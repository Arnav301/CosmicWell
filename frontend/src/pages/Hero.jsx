import React, { useState, useEffect } from 'react';

// --- Icon Components ---
const ScreenTimeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const LaptopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>;
const MindfulnessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const SleepIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const PlaceholderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;

// --- CONSOLIDATED SleepModal Component ---
function SleepModal({ isOpen, onClose }) {
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');

  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    if (window.electronAPI && typeof window.electronAPI.setSleepData === 'function') {
      await window.electronAPI.setSleepData({ bedtime, wakeTime });
      onClose();
    }
  };

  

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#181818] border border-gray-700 text-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-purple-400">Log Your Sleep</h2>
        <p className="text-gray-400 mb-6">Enter your bedtime and wake-up time to calculate duration.</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="bedtime" className="block text-sm font-medium text-gray-300 mb-1">Bedtime</label>
            <input type="time" id="bedtime" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full bg-[#27272a] border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="wakeTime" className="block text-sm font-medium text-gray-300 mb-1">Wake-up Time</label>
            <input type="time" id="wakeTime" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full bg-[#27272a] border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          </div>
        </div>
        <button onClick={handleSave} className="w-full mt-8 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Save Sleep Data
        </button>
      </div>
    </div>
  );
}

// MODIFIED StatCard to be a clickable button
const StatCard = ({ icon, title, value, footerText, footerColor, isPulsing = false, onClick }) => {
  const CardContent = () => (
    <div className={`p-10 rounded-2xl flex-1 flex flex-col h-full justify-between transition-transform duration-200 ${onClick ? 'hover:scale-105' : ''} ${isPulsing ? 'animate-pulse' : ''} 
      bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">{title}</p>
          {icon}
        </div>
        <p className="text-3xl font-bold text-white mb-3">{value}</p>
      </div>
      <div className={`flex items-center text-xs ${footerColor}`}>
        <span>{footerText}</span>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left h-full w-full">
        <CardContent />
      </button>
    );
  }
  return <CardContent />;
};

const GoalProgress = ({ title, value, max, unit = 'h' }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{title}</span>
        <span className="text-gray-400">{value}{unit} / {max}{unit}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  const roundedSeconds = Math.round(seconds);
  if (roundedSeconds < 60) return '<1m';
  const minutes = Math.floor(roundedSeconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

const formatTimeForCard = (seconds) => {
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
};

const AppUsageCard = ({ iconUrl, name, timeInSeconds, totalSeconds }) => {
  const percentage = totalSeconds > 0 ? (timeInSeconds / totalSeconds) * 100 : 0;
  return (
    <div className="p-5 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900">
            <img src={iconUrl} alt={`${name} icon`} className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-white truncate">{name}</p>
          </div>
        </div>
        <p className="text-lg font-bold text-white">{formatTime(timeInSeconds)}</p>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div className="h-1 rounded-full bg-purple-500" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const NoUsagePlaceholder = () => (
  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#27272a]/50 p-8 rounded-lg text-center text-gray-500 border-2 border-dashed border-gray-700">
    <p className="font-semibold">No application usage has been tracked yet.</p>
    <p className="text-sm mt-1">Start using an app on your computer to see live data appear here.</p>
  </div>
);

// --- NEW: Debugging Component ---
const ConnectionStatus = ({ status }) => {
    const statusConfig = {
        Connecting: { color: 'bg-yellow-500', text: 'Connecting to Backend...' },
        Connected: { color: 'bg-green-500', text: 'Backend Connected' },
        Error: { color: 'bg-red-500', text: 'Backend Connection Error' },
    };
    const { color, text } = statusConfig[status];
    return (
        <div className="fixed top-4 right-4 text-xs text-white px-3 py-1 rounded-full flex items-center gap-2 z-50">
            <span className={`w-2 h-2 rounded-full ${color}`}></span>
            {text}
        </div>
    );
};

// --- NEW: Goals Modal to set Daily Goals inline ---
function GoalsModal({ isOpen, onClose, goals, onSave }) {
  const [localGoals, setLocalGoals] = useState([]);
  const [draft, setDraft] = useState({ id: '', title: '', type: 'count', target: 1 });

  useEffect(() => {
    if (isOpen) {
      setLocalGoals(goals || []);
      setDraft({ id: '', title: '', type: 'count', target: 1 });
    }
  }, [isOpen, goals]);

  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  const addGoal = (e) => {
    e?.preventDefault?.();
    const title = (draft.title || '').trim();
    if (!title) return;
    const newGoal = { id: uid(), title, type: draft.type, target: Math.max(1, Number(draft.target || 1)), progress: 0 };
    setLocalGoals([newGoal, ...localGoals]);
    setDraft({ id: '', title: '', type: 'count', target: 1 });
  };
  const updateGoal = (g) => setLocalGoals(localGoals.map(x => x.id === g.id ? g : x));
  const deleteGoal = (id) => setLocalGoals(localGoals.filter(x => x.id !== id));

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#181818] border border-gray-700 text-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-purple-400">Set Daily Goals</h2>
        <p className="text-gray-400 mb-4">Create or edit your daily targets.</p>

        {/* Add Goal */}
        <form onSubmit={addGoal} className="bg-[#27272a] p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <input className="md:col-span-2 bg-[#18181b] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-600" placeholder="Goal title" value={draft.title} onChange={(e)=>setDraft(d=>({...d,title:e.target.value}))} />
          <select className="bg-[#18181b] rounded px-3 py-2" value={draft.type} onChange={(e)=>setDraft(d=>({...d,type:e.target.value}))}>
            <option value="count">Count</option>
            <option value="minutes">Minutes</option>
          </select>
          <input type="number" min={1} className="bg-[#18181b] rounded px-3 py-2" value={draft.target} onChange={(e)=>setDraft(d=>({...d,target:e.target.value}))} />
          <div className="md:col-span-4 flex justify-end">
            <button type="submit" className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500">Add Goal</button>
          </div>
        </form>

        {/* List Goals */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {localGoals.length === 0 ? (
            <div className="text-sm text-gray-400">No goals yet. Add your first one above.</div>
          ) : localGoals.map(g => (
            <div key={g.id} className="bg-[#27272a] p-3 rounded-lg flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{g.title}</p>
                <p className="text-xs text-gray-400">{g.type === 'minutes' ? 'Minutes' : 'Count'} • Target: {g.target}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={g.target} onChange={(e)=>updateGoal({...g, target: Math.max(1, Number(e.target.value||1))})} className="w-20 bg-[#18181b] rounded px-2 py-1 text-sm" />
                <button onClick={()=>deleteGoal(g.id)} className="px-3 py-1.5 rounded bg-red-600/80 text-white text-sm hover:bg-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-[#3f3f46] hover:bg-[#52525b]">Cancel</button>
          <button onClick={()=>onSave(localGoals)} className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500">Save Changes</button>
        </div>
      </div>
    </div>
  );
}


export default function Hero() {
  const [appUsageData, setAppUsageData] = useState({});
  const [lidOpenCount, setLidOpenCount] = useState(0);
  const [mindfulnessData, setMindfulnessData] = useState({ time: 0, isActive: false });
  const [sleepDuration, setSleepDuration] = useState(0);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('Connecting'); // State for connection status
  // Goals state
  const [goals, setGoals] = useState([]);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  // Screen history for dashboard analytics
  const [screenHistory, setScreenHistory] = useState({});
  const [iconStore, setIconStore] = useState({});
  const [range, setRange] = useState('7'); // '7' | '30'
  const [selectedDate, setSelectedDate] = useState(null); // null = live/today, string = historical date key
  // Display name from localStorage
  const [displayName, setDisplayName] = useState('Explorer');
  useEffect(() => {
    const load = () => {
      try {
        const name = localStorage.getItem('cw_user_name');
        setDisplayName(name && name.trim() ? name.trim() : 'Explorer');
      } catch {
        setDisplayName('Explorer');
      }
    };
    load();
    const onStorage = (e) => { if (e.key === 'cw_user_name') load(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // Check for the Electron API after a short delay
    setTimeout(() => {
        if (window.electronAPI) {
            setApiStatus('Connected');
        } else {
            setApiStatus('Error');
            console.error("DEBUG: `window.electronAPI` is not defined. Check your preload.js script and main process configuration.");
        }
    }, 500);

    const fetchData = async () => {
      // Only try to fetch if the API is available
      if (window.electronAPI) {
        try {
          console.log("DEBUG: Fetching data from backend...");
          const [usage, lidCount, mindfulness, sleep] = await Promise.all([
            window.electronAPI.getAppUsage(),
            window.electronAPI.getLidOpenCount(),
            window.electronAPI.getMindfulnessData(),
            window.electronAPI.getSleepData(),
          ]);

          console.log("DEBUG: Received usage data:", usage);
          setAppUsageData(usage || {});
          setLidOpenCount(lidCount || 0);
          setMindfulnessData(mindfulness || { time: 0, isActive: false });
          setSleepDuration(sleep || 0);
          // also fetch screen history
          if (window.electronAPI.getScreenHistory) {
            const histResult = await window.electronAPI.getScreenHistory();
            if (histResult && histResult.history) {
              setScreenHistory(histResult.history || {});
              setIconStore(histResult.icons || {});
            } else {
              setScreenHistory(histResult || {}); // backward compat with old format
            }
          }
        } catch (error) {
          console.error("DEBUG: Error fetching data:", error);
          setApiStatus('Error');
        }
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const handleToggleMindfulness = async () => {
    if (window.electronAPI && typeof window.electronAPI.toggleMindfulnessSession === 'function') {
      const sessionState = await window.electronAPI.toggleMindfulnessSession();
      setMindfulnessData(prevData => ({ ...prevData, isActive: sessionState }));
    }
  };
  
  const sortedApps = Object.entries(appUsageData).sort(([, a], [, b]) => b.time - a.time);
  const totalUsage = sortedApps.reduce((acc, [, data]) => acc + data.time, 0);

  // Build series from screenHistory
  const series = (() => {
    const days = range === '7' ? 7 : 30;
    const out = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const total = screenHistory[key]?.total || 0;
      out.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), total, dateKey: key });
    }
    return out;
  })();
  const maxVal = Math.max(1, ...series.map(d => d.total));

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTotal = screenHistory[todayKey]?.total || 0;

  // Derived display data — switches between live data and selected historical date
  const isViewingHistory = selectedDate !== null && selectedDate !== todayKey;
  const viewedTotal = isViewingHistory ? (screenHistory[selectedDate]?.total || 0) : todayTotal;
  const viewedApps = isViewingHistory
    ? Object.entries(screenHistory[selectedDate]?.apps || {})
        .map(([name, time]) => [name, { time, icon: iconStore[name] || null }])
        .sort(([, a], [, b]) => b.time - a.time)
    : sortedApps;
  const viewedTotalUsage = isViewingHistory
    ? viewedApps.reduce((acc, [, d]) => acc + d.time, 0)
    : totalUsage;
  const viewedDateLabel = isViewingHistory
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const totalInRange = series.reduce((a,b)=>a + (b.total||0), 0);
  const avgDaily = totalInRange / Math.max(1, series.length);
  const bestDay = series.reduce((best, d)=> d.total > (best?.total||0) ? d : best, null) || { label: '-', total: 0 };
  const dailyTarget = 6 * 3600;
  const todayPctOfTarget = Math.min(100, Math.round((todayTotal / Math.max(1, dailyTarget)) * 100));
  const formatClock = (s) => {
    const sec = Math.max(0, Math.floor(s||0));
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
    const pad = (n) => String(n).padStart(2,'0');
    return `${pad(h)}:${pad(m)}`;
  };

  // Load goals on mount
  useEffect(() => {
    const loadGoals = async () => {
      if (window.electronAPI?.getGoals) {
        const g = await window.electronAPI.getGoals();
        setGoals(Array.isArray(g) ? g : []);
      }
    };
    loadGoals();
  }, []);

  const saveGoals = async (next) => {
    if (window.electronAPI?.saveGoals) {
      await window.electronAPI.saveGoals(next);
    }
    setGoals(next);
    setIsGoalsModalOpen(false);
  };

  return (
    <>
      <GoalsModal isOpen={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} goals={goals} onSave={saveGoals} />
      <SleepModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} />
      <div className="max-w-7xl mx-auto px-8 py-12 text-white">
        {isViewingHistory && (
          <div className="mb-6 flex items-center justify-between px-5 py-3 rounded-xl bg-purple-600/20 border border-purple-500/40 text-sm">
            <div className="flex items-center gap-2 text-purple-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Viewing data for <span className="font-semibold text-white">{viewedDateLabel}</span>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
            >
              ← Switch to Today
            </button>
          </div>
        )}
        <header className="mb-12">
            <h1 className="text-4xl font-bold">Welcome back, <span className="text-purple-400">{displayName}</span></h1>
            <p className="text-gray-400 mt-2">Let's explore your digital wellness journey through the cosmos</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard
              icon={<ScreenTimeIcon />}
              title={isViewingHistory ? 'Screen Time' : 'Screen Time Today'}
              value={formatTimeForCard(viewedTotal)}
              footerText={isViewingHistory ? viewedDateLabel : 'Live tracking active'}
              footerColor={isViewingHistory ? 'text-purple-400' : 'text-gray-400'}
            />
            <StatCard icon={<LaptopIcon />} title="Laptop Opens" value={lidOpenCount} footerText="Today's count" footerColor="text-gray-400" />
            <StatCard 
                icon={<MindfulnessIcon />} 
                title="Mindfulness" 
                value={formatTimeForCard(mindfulnessData.time)} 
                footerText={mindfulnessData.isActive ? "Session active..." : "Click to start session"} 
                footerColor={mindfulnessData.isActive ? "text-green-400" : "text-gray-400"}
                isPulsing={mindfulnessData.isActive}
                onClick={handleToggleMindfulness}
            />
            <StatCard 
                icon={<SleepIcon />} 
                title="Sleep Duration" 
                value={sleepDuration > 0 ? formatTimeForCard(sleepDuration) : "Not Logged"} 
                footerText="Click to log sleep" 
                footerColor="text-gray-400"
                onClick={() => setIsSleepModalOpen(true)}
            />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 p-8 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-purple-400">Screen Time Analytics</h2>
                    <div className="flex items-center gap-2 bg-[#181818] p-1 rounded-lg">
                        <button onClick={()=>setRange('7')} className={`px-3 py-1 text-sm rounded-md ${range==='7'?'bg-gray-700 text-white':'text-gray-400'}`}>7 days</button>
                        <button onClick={()=>setRange('30')} className={`px-3 py-1 text-sm rounded-md ${range==='30'?'bg-gray-700 text-white':'text-gray-400'}`}>30 days</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl p-4 bg-[#202024]/70 border border-[#2a2a2e]">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Today</div>
                    <div className="text-2xl font-bold">{formatTimeForCard(todayTotal)}</div>
                    <div className="text-xs text-gray-500 mt-1">{todayPctOfTarget}% of 6h goal</div>
                  </div>
                  <div className="rounded-xl p-4 bg-[#202024]/70 border border-[#2a2a2e]">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Average Daily</div>
                    <div className="text-2xl font-bold">{formatTimeForCard(avgDaily)}</div>
                    <div className="text-xs text-gray-500 mt-1">based on last {series.length} days</div>
                  </div>
                  <div className="rounded-xl p-4 bg-[#202024]/70 border border-[#2a2a2e]">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Best Day</div>
                    <div className="text-2xl font-bold">{bestDay.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatTimeForCard(bestDay.total)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400">Overview</p>
                  <p className="text-xs text-gray-500">Click a bar to view that day's activity</p>
                </div>
                <div className="grid grid-cols-7 md:grid-cols-10 lg:grid-cols-14 gap-3 md:gap-4">
                  {series.map((d, idx) => {
                    const isSelected = selectedDate === d.dateKey;
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => setSelectedDate(isSelected ? null : d.dateKey)}
                        title={`${d.label} — ${formatTimeForCard(d.total)} — Click to view`}
                      >
                        <div className={`relative w-full rounded-lg h-44 flex items-end overflow-hidden transition-all duration-200 ${
                          isSelected ? 'ring-1 ring-purple-400 bg-purple-900/40' : 'bg-[#1b1b1e] group-hover:bg-[#252529]'
                        }`}>
                          <div className="absolute left-0 right-0" style={{ bottom: `${Math.round((dailyTarget/maxVal)*100)}%` }}>
                            <div className="h-px bg-[#3a3a3f]/60 w-full" />
                          </div>
                          <div
                            className={`w-full rounded-lg transition-[height] duration-500 ${
                              isSelected
                                ? 'bg-gradient-to-t from-yellow-500 to-orange-400'
                                : 'bg-gradient-to-t from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500'
                            }`}
                            style={{ height: `${Math.round((d.total / maxVal) * 100)}%` }}
                          />
                        </div>
                        <div className={`text-xs mt-2 transition-colors ${
                          isSelected ? 'text-yellow-400 font-semibold' : 'text-gray-400 group-hover:text-gray-200'
                        }`}>{d.label}</div>
                        <div className="text-[10px] text-gray-500">{formatClock(d.total)}</div>
                      </div>
                    );
                  })}
                </div>
            </div>
            <div className="p-8 rounded-2xl flex flex-col bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Daily Goals</h2>
                  <button className="px-3 py-1.5 text-sm rounded bg-[#3f3f46] hover:bg-[#52525b]" onClick={() => setIsGoalsModalOpen(true)}>Set Goals</button>
                </div>
                <div className="flex flex-col justify-around flex-grow">
                  {goals.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center min-h-[140px]">
                      <p className="text-gray-400 text-sm">No goals yet. Click "Set Goals" to add.</p>
                    </div>
                  ) : (
                    goals.slice(0,3).map(g => (
                      <GoalProgress key={g.id} title={g.title} value={Math.min(g.progress || 0, Math.max(1, Number(g.target||1)))} max={Math.max(1, Number(g.target||1))} unit={g.type === 'minutes' ? 'm' : ''} />
                    ))
                  )}
                </div>
            </div>
        </section>

        <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">
                {isViewingHistory ? `Top Apps — ${viewedDateLabel}` : 'Most Used Applications'}
              </h2>
              {isViewingHistory && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ← Back to today
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {viewedApps.length > 0 ? (
                    viewedApps.slice(0, 6).map(([appName, appData]) => (
                        <AppUsageCard
                            key={appName}
                            name={appName.replace('.exe', '')}
                            iconUrl={appData.icon}
                            timeInSeconds={appData.time}
                            totalSeconds={viewedTotalUsage}
                        />
                    ))
                ) : (
                    <NoUsagePlaceholder />
                )}
            </div>
        </section>
      </div>
    </>
  );
}

