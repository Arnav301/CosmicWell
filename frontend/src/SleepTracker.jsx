import React, { useEffect, useMemo, useState } from 'react';

function formatHMS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function toISOFromLocal(dtLocal) {
  // dtLocal expected as 'YYYY-MM-DDTHH:mm'
  try {
    const d = new Date(dtLocal);
    if (isNaN(d)) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

const Stat = ({ label, value }) => (
  <div className="p-10 text-center rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
    <div className="text-sm text-gray-400 mb-2">{label}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);

export default function SleepTracker() {
  const [status, setStatus] = useState({ isActive: false, start: null, history: [] });
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  // Manual log form
  const [startLocal, setStartLocal] = useState('');
  const [endLocal, setEndLocal] = useState('');
  const [error, setError] = useState('');

  // Poll status
  useEffect(() => {
    const fetchStatus = async () => {
      if (window.electronAPI?.sleepStatus) {
        const s = await window.electronAPI.sleepStatus();
        setStatus(s || { isActive: false, start: null, history: [] });
      }
    };
    fetchStatus();
    const id = setInterval(() => {
      setNow(Date.now());
      fetchStatus();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const activeSeconds = useMemo(() => {
    if (!status.isActive || !status.start) return 0;
    const start = new Date(status.start).getTime();
    return Math.max(0, Math.floor((now - start) / 1000));
  }, [status.isActive, status.start, now]);

  const startSleep = async () => {
    setSaving(true);
    try {
      if (!window.electronAPI?.sleepStart) {
        console.error('sleepStart API not available');
        return;
      }
      const res = await window.electronAPI.sleepStart();
      if (res?.started || res?.reason === 'already_active') {
        const s = await window.electronAPI.sleepStatus();
        setStatus(s || status);
      }
    } catch (e) {
      console.error('Failed to start sleep session', e);
    } finally {
      setSaving(false);
    }
  };

  const stopSleep = async () => {
    setSaving(true);
    try {
      if (!window.electronAPI?.sleepStop) {
        console.error('sleepStop API not available');
        return;
      }
      const res = await window.electronAPI.sleepStop();
      if (res?.stopped || res?.reason === 'not_active') {
        const s = await window.electronAPI.sleepStatus();
        setStatus(s || status);
      }
    } catch (e) {
      console.error('Failed to stop sleep session', e);
    } finally {
      setSaving(false);
    }
  };

  const logManual = async (e) => {
    e.preventDefault();
    setError('');
    const startISO = toISOFromLocal(startLocal);
    const endISO = toISOFromLocal(endLocal);
    if (!startISO || !endISO) {
      setError('Please provide valid start and end times.');
      return;
    }
    if (!window.electronAPI?.sleepLogManual) return;
    setSaving(true);
    try {
      const res = await window.electronAPI.sleepLogManual({ startISO, endISO });
      if (!res?.ok) {
        setError('Invalid time range.');
      } else {
        setStartLocal('');
        setEndLocal('');
        const s = await window.electronAPI.sleepStatus();
        setStatus(s);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id) => {
    if (!window.electronAPI?.sleepDeleteEntry) return;
    setSaving(true);
    try {
      await window.electronAPI.sleepDeleteEntry(id);
      const s = await window.electronAPI.sleepStatus();
      setStatus(s);
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const weekMs = 7 * 24 * 3600 * 1000;
  const totalWeekSeconds = useMemo(() => {
    const cutoff = Date.now() - weekMs;
    return (status.history || []).reduce((acc, e) => {
      const end = new Date(e.end).getTime();
      return acc + (end >= cutoff ? (e.duration || 0) : 0);
    }, 0);
  }, [status.history]);

  const lastNight = status.history?.[0];

  // --- Derived analytics for mock-style layout ---
  const weekBuckets = useMemo(() => {
    // Build last 7 days buckets with label and total sleep seconds from history
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toDateString();
      days.push({ key, date: new Date(d), total: 0 });
    }
    (status.history || []).forEach(e => {
      const end = new Date(e.end);
      const key = new Date(end.getFullYear(), end.getMonth(), end.getDate()).toDateString();
      const bucket = days.find(b => b.key === key);
      if (bucket) bucket.total += e.duration || 0;
    });
    return days.map((b, idx) => ({
      label: b.date.toLocaleDateString(undefined, { weekday: 'short' }),
      hours: (b.total / 3600).toFixed(1),
      value: b.total,
      idx,
    }));
  }, [status.history]);

  const avgBedWake = useMemo(() => {
    // Use last up to 7 entries to compute avg bedtime and waketime local
    const entries = (status.history || []).slice(0, 7);
    if (!entries.length) return { bed: null, wake: null };
    const mean = arr => new Date(arr.reduce((a, b) => a + b, 0) / arr.length);
    const beds = entries.map(e => new Date(e.start).getTime());
    const wakes = entries.map(e => new Date(e.end).getTime());
    return { bed: mean(beds), wake: mean(wakes) };
  }, [status.history]);

  const sleepScore = useMemo(() => {
    // Simple heuristic: 8h target, penalize variance
    const target = 8 * 3600;
    const ds = (status.history || []).slice(0, 7).map(e => e.duration || 0);
    if (!ds.length) return 60;
    const avg = ds.reduce((a, b) => a + b, 0) / ds.length;
    const variance = ds.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / ds.length;
    const std = Math.sqrt(variance);
    let score = 70 + 30 * Math.max(0, 1 - Math.abs(avg - target) / (3 * 3600)) - Math.min(20, std / 3600 * 10);
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [status.history]);

  const lastPhases = useMemo(() => {
    // Without real phases, estimate from last night
    const d = lastNight?.duration || 0;
    const deep = Math.round(d * 0.22);
    const rem = Math.round(d * 0.23);
    const light = Math.max(0, d - deep - rem);
    return { deep, rem, light };
  }, [lastNight]);

  // Wind Down Checklist (fills empty space on right)
  const [tips, setTips] = useState([
    { id: 'screens', text: 'Avoid screens 30 mins before bed', done: false },
    { id: 'stretch', text: '5-min light stretching', done: false },
    { id: 'hydrate', text: 'Hydrate lightly', done: false },
    { id: 'ambient', text: 'Play relaxing ambience', done: false },
  ]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sleep_winddown_tips');
      if (saved) setTips(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('sleep_winddown_tips', JSON.stringify(tips));
    } catch {}
  }, [tips]);
  const toggleTip = (id) => setTips(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 text-white">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">Sleep & Recovery Tracking</h1>
        </div>
        <div className="flex items-center gap-3">
          {!status.isActive ? (
            <button disabled={saving} onClick={startSleep} className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-60">Start Sleep</button>
          ) : (
            <button disabled={saving} onClick={stopSleep} className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-60">Stop & Save</button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Pattern Analysis */}
        <div className="xl:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
            <h2 className="text-lg font-semibold mb-4">Sleep Pattern Analysis</h2>
            <div className="grid grid-cols-7 gap-3">
              {weekBuckets.map((d) => {
                const pct = Math.min(100, Math.round((d.value / (9 * 3600)) * 100));
                return (
                  <div key={d.idx} className="bg-[#1f1f22] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2 text-center">{d.label}</div>
                    <div className="h-4 bg-[#3a3a3f] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-yellow-400" style={{ width: pct + '%' }} />
                    </div>
                    <div className="text-xs text-gray-300 mt-2 text-center">{d.hours}h</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
              <div className="text-sm text-gray-400 mb-1">Bedtime</div>
              <div className="text-3xl font-bold">{avgBedWake.bed ? new Date(avgBedWake.bed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
              <div className="text-xs text-gray-500 mt-1">Average this week</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
              <div className="text-sm text-gray-400 mb-1">Wake Time</div>
              <div className="text-3xl font-bold text-yellow-400">{avgBedWake.wake ? new Date(avgBedWake.wake).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
              <div className="text-xs text-gray-500 mt-1">Average this week</div>
            </div>
          </div>

          {/* Wind Down Checklist (above manual log) */}
          <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
            <h3 className="text-sm text-gray-400 mb-3">Wind Down Checklist</h3>
            <ul className="space-y-2">
              {tips.map(t => (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTip(t.id)} className="accent-purple-600" />
                  <span className={t.done ? 'line-through text-gray-500' : 'text-gray-300'}>{t.text}</span>
                </li>
              ))}
            </ul>
            <div className="text-[11px] text-gray-500 mt-3">Your selections are saved locally.</div>
          </div>

          {/* Manual Log under Bed/Wake tiles with wider layout */}
          <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
            <h2 className="text-lg font-semibold mb-3">Log Sleep Manually</h2>
            <form onSubmit={logManual} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Start</label>
                <input type="datetime-local" value={startLocal} onChange={(e)=>setStartLocal(e.target.value)} className="w-full bg-[#18181b] rounded-md px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">End</label>
                <input type="datetime-local" value={endLocal} onChange={(e)=>setEndLocal(e.target.value)} className="w-full bg-[#18181b] rounded-md px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={saving} className="w-full px-4 py-2 rounded bg-[#3f3f46] hover:bg-[#52525b] disabled:opacity-60">Add</button>
              </div>
              {error && <div className="md:col-span-6 text-sm text-red-400">{error}</div>}
            </form>
          </div>
        </div>

        {/* Right: Quality, Phases, Tonight Plan */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] flex flex-col items-center justify-center">
            <h3 className="text-sm text-gray-400 mb-3">Sleep Quality</h3>
            <div className="relative w-36 h-36 mb-2">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(#8b5cf6 ${sleepScore * 3.6}deg, #3a3a3f ${sleepScore * 3.6}deg)`
              }} />
              <div className="absolute inset-2 rounded-full bg-[#1f1f22] flex items-center justify-center">
                <span className="text-3xl font-bold">{sleepScore}%</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">{sleepScore >= 80 ? 'Excellent quality' : sleepScore >= 60 ? 'Good quality' : 'Needs improvement'}</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
            <h3 className="text-sm text-gray-400 mb-4">Sleep Phases</h3>
            {[
              { label: 'Deep Sleep', color: 'bg-purple-500', val: lastPhases.deep },
              { label: 'REM Sleep', color: 'bg-indigo-400', val: lastPhases.rem },
              { label: 'Light Sleep', color: 'bg-yellow-400', val: lastPhases.light },
            ].map((p) => (
              <div key={p.label} className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">{p.label}</span>
                  <span className="text-gray-400">{formatHMS(p.val)}</span>
                </div>
                <div className="h-2 bg-[#3a3a3f] rounded-full overflow-hidden">
                  <div className={`h-full ${p.color}`} style={{ width: `${Math.min(100, (p.val / Math.max(1, (lastNight?.duration || 1))) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
            <h3 className="text-sm text-gray-400 mb-3">Tonight's Plan</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Wind down at {avgBedWake.bed ? new Date(avgBedWake.bed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</li>
              <li className="flex items-center gap-2 text-gray-300"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Sleep by {avgBedWake.bed ? new Date(avgBedWake.bed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</li>
              <li className="flex items-center gap-2 text-gray-300"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Wake at {avgBedWake.wake ? new Date(avgBedWake.wake).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</li>
            </ul>
          </div>

          {/* Wind Down Checklist moved to left column */}

          {/* Manual Log removed from right column */}
        </div>
      </div>

      {/* Removed bottom manual log section; now placed under Bed/Wake tiles */}

      <section className="p-8 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] mt-12 md:mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">History</h2>
          <span className="text-xs text-gray-400">Showing latest {status.history?.length || 0} entries</span>
        </div>
        {status.history?.length ? (
          <div className="divide-y divide-gray-700">
            {status.history.map((e) => (
              <div key={e.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{new Date(e.start).toLocaleString()} → {new Date(e.end).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Duration: {formatHMS(e.duration)}</div>
                </div>
                <button onClick={() => deleteEntry(e.id)} className="px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-500 text-sm">Delete</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400">No entries yet.</div>
        )}
      </section>
    </div>
  );
}
