import React, { useState, useEffect } from 'react';

// --- Helper Components & Functions ---

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

const AppUsageCard = ({ iconUrl, name, category, timeInSeconds, totalSeconds }) => {
    const percentage = totalSeconds > 0 ? (timeInSeconds / totalSeconds) * 100 : 0;
    
    return (
        <div className="bg-[#27272a] p-5 rounded-lg transform transition-transform duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900`}>
                        <img src={iconUrl} alt={`${name} icon`} className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="font-semibold text-white truncate">{name}</p>
                         <p className="text-xs text-gray-400">{category || 'Application'}</p>
                     </div>
                 </div>
                 <p className="text-lg font-bold text-white">{formatTime(timeInSeconds)}</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
                 <div className={`h-1 rounded-full bg-purple-500`} style={{ width: `${percentage}%` }}></div>
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

// --- Main AppUsagePage Component ---

export default function AppUsagePage() {
  const [appUsageData, setAppUsageData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (window.electronAPI && typeof window.electronAPI.getAppUsage === 'function') {
        const liveUsage = await window.electronAPI.getAppUsage();
        setAppUsageData(liveUsage);
      }
    };

    fetchData(); // Fetch immediately on component mount
    const intervalId = setInterval(fetchData, 5000); // Then poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const sortedApps = Object.entries(appUsageData).sort(([, a], [, b]) => b.time - a.time);
  const totalUsage = sortedApps.reduce((acc, [, data]) => acc + data.time, 0);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 text-white">
      <section>
        <h2 className="text-3xl font-bold mb-8 text-yellow-400">Most Used Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedApps.length > 0 ? (
                sortedApps.map(([appName, appData]) => (
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
  );
}
