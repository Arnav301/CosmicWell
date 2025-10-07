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
    <div className={`bg-[#27272a] p-10 rounded-xl flex-1 flex flex-col h-full justify-between transition-transform duration-200 ${onClick ? 'hover:scale-105' : ''} ${isPulsing ? 'animate-pulse' : ''}`}>
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
    <div className="bg-[#27272a] p-5 rounded-lg">
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


export default function Hero() {
  const [appUsageData, setAppUsageData] = useState({});
  const [lidOpenCount, setLidOpenCount] = useState(0);
  const [mindfulnessData, setMindfulnessData] = useState({ time: 0, isActive: false });
  const [sleepDuration, setSleepDuration] = useState(0);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('Connecting'); // State for connection status

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

  const weeklyData = [ { day: 'Mon', hours: 4.2 }, { day: 'Tue', hours: 6.3 }, { day: 'Wed', hours: 3.8 }, { day: 'Thu', hours: 7.1 }, { day: 'Fri', hours: 5.4 }, { day: 'Sat', hours: 6.2 }, { day: 'Sun', hours: 0 } ];
  const maxHours = 8;

  return (
    <>
      <ConnectionStatus status={apiStatus} />
      <SleepModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} />
      <div className="max-w-7xl mx-auto px-8 py-12 text-white">
        <header className="mb-12">
            <h1 className="text-4xl font-bold">Welcome back, <span className="text-purple-400">Alexandra</span></h1>
            <p className="text-gray-400 mt-2">Let's explore your digital wellness journey through the cosmos</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard icon={<ScreenTimeIcon />} title="Screen Time Today" value={formatTimeForCard(totalUsage)} footerText="Live tracking active" footerColor="text-gray-400" />
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
            <div className="lg:col-span-2 bg-[#27272a] p-8 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-purple-400">Screen Time Analytics</h2>
                    <div className="flex items-center gap-2 bg-[#181818] p-1 rounded-lg">
                        <button className="px-3 py-1 text-sm bg-gray-700 rounded-md">7 days</button>
                        <button className="px-3 py-1 text-sm text-gray-400">30 days</button>
                    </div>
                </div>
                <p className="text-gray-400 mb-6">Weekly Overview</p>
                <div className="flex items-end justify-between h-56">
                    {weeklyData.map(data => (
                        <div key={data.day} className="flex flex-col items-center w-12 text-center">
                            <div className="w-4 bg-gray-700 rounded-t-full flex-grow flex items-end">
                                <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-full" style={{ height: `${(data.hours / maxHours) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{data.day}</p>
                            <p className="text-xs text-gray-500 mt-1">{data.hours}h {data.hours > 0 ? `${Math.round((data.hours % 1) * 60)}m` : ''}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-[#27272a] p-8 rounded-lg flex flex-col">
                <h2 className="text-xl font-bold mb-6">Daily Goals</h2>
                <div className="flex flex-col justify-around flex-grow">
                    <GoalProgress title="Screen Time Limit" value={5} max={6} />
                    <GoalProgress title="Break Reminders" value={8} max={10} unit="" />
                    <GoalProgress title="Phone-Free Time" value={2} max={2} />
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold mb-6 text-yellow-400">Most Used Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedApps.length > 0 ? (
                    sortedApps.slice(0, 6).map(([appName, appData]) => (
                        <AppUsageCard 
                            key={appName}
                            name={appName.replace('.exe', '')}
                            iconUrl={appData.icon}
                            timeInSeconds={appData.time}
                            totalSeconds={totalUsage}
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

