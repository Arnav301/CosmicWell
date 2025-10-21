import React, { useEffect, useMemo, useState } from 'react';

// Donut with gradient stroke and soft animation
function Donut({ percent = 0, label = '', sub = '', gradientId }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const size = 88;
  const r = 32;
  const c = 2 * Math.PI * r;
  const dash = (c * p) / 100;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 88 88" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#1f1f22" strokeWidth="10" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          className="[transition:stroke-dasharray_600ms_ease]"
        />
        <text x="44" y="49" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="700">{p}%</text>
      </svg>
      <div>
        <div className="text-[13px] tracking-wide text-gray-300">{label}</div>
        <div className="text-xs text-gray-500">{sub}</div>
      </div>
    </div>
  );
}

function formatHM(s) {
  const sec = Math.max(0, Math.floor(s||0));
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
  return `${h}h ${m}m`;
}

function lastNDaysKeys(n=7){
  const keys=[]; const now=new Date();
  for(let i=0;i<n;i++){ const d=new Date(now); d.setDate(now.getDate()-i); keys.push(d.toISOString().slice(0,10)); }
  return keys;
}

export default function Reports(){
  const [screenHistory, setScreenHistory] = useState({});
  const [sleep, setSleep] = useState({ isActive:false, start:null, history:[] });

  // Fetch data
  useEffect(()=>{
    let mounted=true;
    const load = async ()=>{
      const sh = await window.electronAPI?.getScreenHistory?.();
      if(mounted && sh) setScreenHistory(sh);
      const ss = await window.electronAPI?.sleepStatus?.();
      if(mounted && ss) setSleep(ss);
    };
    load();
    const id = setInterval(load, 4000);
    return ()=>{ mounted=false; clearInterval(id); };
  },[]);

  const weekKeys = useMemo(()=> lastNDaysKeys(7).reverse(), []);

  // Screen time goal: days meeting <= 6h target
  const screenTarget = 6*3600;
  const screenDaysMet = weekKeys.reduce((acc,k)=> acc + ((screenHistory[k]?.total||0) <= screenTarget ? 1:0), 0);
  const screenPct = Math.round((screenDaysMet/7)*100);

  // Sleep quality: average of best session per day vs 8h
  const sleepByDay = useMemo(()=>{
    const map = {};
    (sleep.history||[]).forEach(e=>{
      const day = (new Date(e.start)).toISOString().slice(0,10);
      map[day] = Math.max(map[day]||0, Math.max(0, e.duration||0));
    });
    return map;
  },[sleep.history]);
  const avgSleep = (()=>{
    const vals = weekKeys.map(k=> sleepByDay[k]||0);
    const sum = vals.reduce((a,b)=>a+b,0);
    return sum / 7;
  })();
  const sleepTarget = 8*3600;
  const sleepPct = Math.max(0, Math.min(100, Math.round((avgSleep / sleepTarget)*100)));

  // Mindfulness: we don't have per-session history; show placeholder based on availability
  const mindfulSessions = 0; // could be wired if history is added later
  const mindfulPct = Math.round((mindfulSessions/7)*100);

  // Overall wellness score heuristic
  const wellness = Math.round((screenPct*0.35) + (sleepPct*0.5) + (mindfulPct*0.15));

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 text-white">
      <h1 className="text-3xl font-bold text-cyan-300 mb-6">Weekly Wellness Report</h1>

      <div className="rounded-2xl p-6 md:p-8 bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Progress Overview */}
          <div className="lg:col-span-2">
            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-5">Progress Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              <Donut gradientId="grad-screen" percent={screenPct} label="Screen Time Goals" sub={`${screenDaysMet}/7 days achieved`} />
              <Donut gradientId="grad-sleep" percent={sleepPct} label="Sleep Quality" sub={`${(avgSleep/3600).toFixed(1)}h avg`} />
              <Donut gradientId="grad-mind" percent={mindfulPct} label="Mindfulness" sub={`${mindfulSessions}/7 sessions`} />
            </div>

            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-gray-300">Overall Wellness Score</div>
              <div className="text-sm text-gray-400 font-semibold">{(wellness/10).toFixed(1)}/10</div>
            </div>
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#151518] to-[#1e1e22]">
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.45)]" style={{ width: `${Math.min(100, wellness)}%` }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="bg-[#1f1f22]/80 border border-[#2a2a2e] rounded-xl p-4 shadow-inner">
                <div className="text-sm text-gray-400 mb-1">Biggest Improvement</div>
                <div className="text-white font-semibold tracking-wide">Sleep Consistency</div>
                <div className="text-xs text-green-400 mt-1">+23% better than last week</div>
              </div>
              <div className="bg-[#1f1f22]/80 border border-[#2a2a2e] rounded-xl p-4 shadow-inner">
                <div className="text-sm text-gray-400 mb-1">Focus Area</div>
                <div className="text-white font-semibold tracking-wide">Physical Activity</div>
                <div className="text-xs text-gray-400 mt-1">increase daily movement</div>
              </div>
            </div>
          </div>

          {/* Right: Achievements */}
          <div>
            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-5">Achievements</h2>
            <div className="space-y-3">
              <div className="border border-yellow-500/40 bg-[#1f1f22]/70 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-semibold">Sleep Champion</div>
                  <div className="text-xs text-gray-400">7 days optimal sleep</div>
                </div>
                <span className="text-yellow-400">🏆</span>
              </div>
              <div className="border border-green-500/40 bg-[#1f1f22]/70 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-semibold">Mindful Week</div>
                  <div className="text-xs text-gray-400">5+ meditation sessions</div>
                </div>
                <span className="text-green-400">🏅</span>
              </div>
              <div className="border border-purple-500/40 bg-[#1f1f22]/70 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-semibold">Focus Master</div>
                  <div className="text-xs text-gray-400">3+ hour focus sessions</div>
                </div>
                <span className="text-purple-400">🎯</span>
              </div>
            </div>

            <h3 className="text-sm uppercase tracking-wider text-gray-400 mt-6 mb-3">Next Week Goals</h3>
            <div className="space-y-2">
              <div className="bg-[#1f1f22]/80 border border-[#2a2a2e] rounded-xl p-3 text-sm flex items-center gap-2 hover:bg-[#242429] transition-colors"><span className="text-gray-400">•</span> Reduce screen time by 30 minutes</div>
              <div className="bg-[#1f1f22]/80 border border-[#2a2a2e] rounded-xl p-3 text-sm flex items-center gap-2 hover:bg-[#242429] transition-colors"><span className="text-gray-400">•</span> Complete 7 mindfulness sessions</div>
              <div className="bg-[#1f1f22]/80 border border-[#2a2a2e] rounded-xl p-3 text-sm flex items-center gap-2 hover:bg-[#242429] transition-colors"><span className="text-gray-400">•</span> Take 3 outdoor breaks daily</div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
