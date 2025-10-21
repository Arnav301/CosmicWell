import React, { useEffect, useMemo, useState } from 'react';

function formatHM(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

function lastNDaysMap(history = {}, days = 7) {
  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const total = history[key]?.total || 0;
    out.push({ key, label: d.toLocaleDateString(undefined, { weekday: 'short' }), total });
  }
  return out;
}

export default function ScreenTime() {
  const [history, setHistory] = useState({});
  const [apps, setApps] = useState({});
  const [range, setRange] = useState('7'); // '7' | '30'

  // Poll history periodically to keep it real-time
  useEffect(() => {
    let mounted = true;
    const fetcher = async () => {
      const h = await window.electronAPI?.getScreenHistory?.();
      if (mounted && h) setHistory(h);
      const a = await window.electronAPI?.getAppUsage?.();
      if (mounted && a) setApps(a);
    };
    fetcher();
    const id = setInterval(fetcher, 3000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTotal = history[todayKey]?.total || 0;

  const series = useMemo(() => lastNDaysMap(history, range === '7' ? 7 : 30), [history, range]);
  const maxVal = Math.max(1, ...series.map(d => d.total));

  // KPIs
  const totalInRange = series.reduce((a,b)=>a + (b.total||0), 0);
  const avgDaily = totalInRange / Math.max(1, series.length);
  const bestDay = series.reduce((best, d)=> d.total > (best?.total||0) ? d : best, null) || { label: '-', total: 0 };
  const dailyTarget = 6 * 3600; // 6 hours default target
  const todayPctOfTarget = Math.min(100, Math.round((todayTotal / Math.max(1, dailyTarget)) * 100));

  const topApps = useMemo(() => {
    const entries = Object.entries(apps || {});
    entries.sort((a,b) => (b[1]?.time||0) - (a[1]?.time||0));
    return entries.slice(0, 5);
  }, [apps]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Screen Time Analytics</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="rounded-xl p-5 bg-[#202024]/70 backdrop-blur border border-[#2a2a2e]">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Today</div>
          <div className="text-3xl font-bold">{formatHM(todayTotal)}</div>
          <div className="text-xs text-gray-500 mt-1">{todayPctOfTarget}% of 6h goal</div>
        </div>
        <div className="rounded-xl p-5 bg-[#202024]/70 backdrop-blur border border-[#2a2a2e]">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Average Daily</div>
          <div className="text-3xl font-bold">{formatHM(avgDaily)}</div>
          <div className="text-xs text-gray-500 mt-1">based on last {series.length} days</div>
        </div>
        <div className="rounded-xl p-5 bg-[#202024]/70 backdrop-blur border border-[#2a2a2e]">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Best Day</div>
          <div className="text-3xl font-bold">{bestDay.label}</div>
          <div className="text-xs text-gray-500 mt-1">{formatHM(bestDay.total)}</div>
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm uppercase tracking-wider text-gray-400">Overview</h2>
          <div className="p-1 bg-[#2a2a2e] rounded-full text-sm">
            <button className={`px-3 py-1 rounded-full ${range==='7'?'bg-blue-600 text-white':''}`} onClick={()=>setRange('7')}>7d</button>
            <button className={`px-3 py-1 rounded-full ${range==='30'?'bg-blue-600 text-white':''}`} onClick={()=>setRange('30')}>30d</button>
          </div>
        </div>

        {/* Bars */}
        <div className={`grid ${range==='7'?'grid-cols-7':'grid-cols-10 md:grid-cols-15 lg:grid-cols-15'} gap-3 md:gap-4`}>
          {series.map((d, idx) => (
            <div key={d.key+idx} className="flex flex-col items-center">
              <div className="relative w-full bg-[#1b1b1e] rounded-lg h-44 flex items-end overflow-hidden">
                {/* target baseline */}
                <div className="absolute bottom-[calc(6rem)] left-0 right-0 h-[1px] bg-[#3a3a3f]/60" style={{ bottom: `${Math.round((dailyTarget/maxVal)*100)}%` }} />
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-purple-600 to-blue-600 transition-[height] duration-500"
                  style={{ height: `${Math.round((d.total / maxVal) * 100)}%` }}
                  title={`${d.label} • ${formatHM(d.total)}`}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">{d.label}</div>
              <div className="text-xs text-gray-500">{formatClock(d.total)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Daily goal card */}
          <div className="rounded-2xl p-5 bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e]">
            <div className="text-sm text-gray-400 mb-1">Daily Goal Progress</div>
            <div className="w-full bg-[#2a2a2e] rounded-full h-3">
              <div className={`h-3 rounded-full ${todayTotal<=dailyTarget?'bg-gradient-to-r from-green-500 to-emerald-600':'bg-gradient-to-r from-orange-500 to-pink-600'}`} style={{ width: `${todayPctOfTarget}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-2">{formatHM(todayTotal)} / {formatHM(dailyTarget)}</div>
          </div>

          {/* Top apps */}
          <div className="rounded-2xl p-5 bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] lg:col-span-2">
            <div className="text-sm text-gray-400 mb-3">Top Apps (since app start)</div>
            <div className="space-y-3">
              {topApps.length === 0 && (
                <div className="text-xs text-gray-500">No data yet. Use some apps to populate this.</div>
              )}
              {topApps.map(([name, meta]) => {
                const pct = Math.min(100, Math.round(((meta?.time||0) / (topApps[0]?.[1]?.time || 1)) * 100));
                return (
                  <div key={name} className="">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {meta?.icon && <img src={meta.icon} alt="" className="w-4 h-4 rounded-sm" />}
                        <span className="truncate mr-2 text-gray-300">{name}</span>
                      </div>
                      <span className="tabular-nums">{formatHM(meta?.time||0)}</span>
                    </div>
                    <div className="w-full bg-[#2a2a2e] rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
