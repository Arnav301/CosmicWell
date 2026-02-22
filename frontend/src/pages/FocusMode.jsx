import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Icon Components ---
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const AwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CoffeeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>;
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const UnlockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

// --- Stat Card Component (from Dashboard) ---
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

// --- Session History Item ---
const SessionHistoryItem = ({ date, duration, task }) => {
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#27272a]/50 border border-[#2a2a2e]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <TargetIcon />
        </div>
        <div>
          <p className="font-semibold text-white">{task || 'Focus Session'}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
      <span className="text-lg font-bold text-white">{formatDuration(duration)}</span>
    </div>
  );
};

// --- Allowed Apps Modal ---
function AllowedAppsModal({ isOpen, onClose, allowedApps, onSave }) {
  const [apps, setApps] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customApp, setCustomApp] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedApps(allowedApps || []);
      loadApps();
    }
  }, [isOpen, allowedApps]);

  const loadApps = async () => {
    try {
      if (window.electronAPI?.focusGetInstalledApps) {
        const installedApps = await window.electronAPI.focusGetInstalledApps();
        setApps(installedApps);
      }
    } catch (e) {
      console.error('Failed to load apps:', e);
    }
  };

  const toggleApp = (app) => {
    const exists = selectedApps.some(a => a.name.toLowerCase() === app.name.toLowerCase());
    if (exists) {
      setSelectedApps(selectedApps.filter(a => a.name.toLowerCase() !== app.name.toLowerCase()));
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const addCustomApp = () => {
    if (customApp.trim() && !selectedApps.some(a => a.name.toLowerCase() === customApp.toLowerCase())) {
      setSelectedApps([...selectedApps, { name: customApp.trim(), icon: null }]);
      setCustomApp('');
    }
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#181818] border border-gray-700 text-white p-8 rounded-xl shadow-2xl w-full max-w-2xl relative max-h-[80vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-purple-400">Allowed Apps During Focus</h2>
        <p className="text-gray-400 mb-6">Select apps that you can use while in focus mode lockdown.</p>
        
        {/* Search and Custom Add */}
        <div className="flex gap-3 mb-4">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps..."
            className="flex-1 bg-[#27272a] border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Add Custom App */}
        <div className="flex gap-3 mb-4">
          <input 
            type="text"
            value={customApp}
            onChange={(e) => setCustomApp(e.target.value)}
            placeholder="Add custom app name..."
            className="flex-1 bg-[#27272a] border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && addCustomApp()}
          />
          <button 
            onClick={addCustomApp}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center gap-2"
          >
            <PlusIcon /> Add
          </button>
        </div>

        {/* Selected Apps */}
        {selectedApps.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Selected ({selectedApps.length}):</p>
            <div className="flex flex-wrap gap-2">
              {selectedApps.map((app, idx) => (
                <span 
                  key={idx} 
                  onClick={() => toggleApp(app)}
                  className="px-3 py-1.5 rounded-full bg-purple-600/30 border border-purple-500 text-sm cursor-pointer hover:bg-purple-600/50 flex items-center gap-2"
                >
                  {app.name}
                  <XIcon />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* App List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[300px] pr-2">
          {filteredApps.map((app, idx) => {
            const isSelected = selectedApps.some(a => a.name.toLowerCase() === app.name.toLowerCase());
            return (
              <button
                key={idx}
                onClick={() => toggleApp(app)}
                className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'bg-purple-600/30 border border-purple-500' 
                    : 'bg-[#27272a]/50 border border-[#2a2a2e] hover:bg-[#3f3f46]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {app.icon ? (
                    <img src={app.icon} alt="" className="w-8 h-8 rounded" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{app.name}</span>
                </div>
                {isSelected && <CheckIcon />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-[#2a2a2e] hover:bg-[#3a3a3f]">Cancel</button>
          <button 
            onClick={() => { onSave(selectedApps); onClose(); }} 
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500"
          >
            Save Allowed Apps
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Focus Session Modal ---
function FocusSessionModal({ isOpen, onClose, onStart, allowedApps, onOpenAllowedApps }) {
  const [duration, setDuration] = useState(25);
  const [task, setTask] = useState('');
  const [lockdownEnabled, setLockdownEnabled] = useState(true);
  const presets = [15, 25, 45, 60, 90];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#181818] border border-gray-700 text-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-purple-400">Start Focus Session</h2>
        <p className="text-gray-400 mb-6">Set your focus duration and start your deep work session.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">What are you focusing on?</label>
            <input 
              type="text" 
              value={task} 
              onChange={(e) => setTask(e.target.value)} 
              placeholder="e.g., Complete project report"
              className="w-full bg-[#27272a] border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map(p => (
                <button 
                  key={p} 
                  onClick={() => setDuration(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    duration === p 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-[#27272a] text-gray-300 hover:bg-[#3f3f46]'
                  }`}
                >
                  {p}m
                </button>
              ))}
            </div>
            <input 
              type="number" 
              min={1} 
              max={180}
              value={duration} 
              onChange={(e) => setDuration(Math.max(1, Math.min(180, Number(e.target.value))))} 
              className="w-full bg-[#27272a] border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" 
            />
          </div>

          {/* Lockdown Toggle */}
          <div className="p-4 rounded-xl bg-[#27272a]/50 border border-[#2a2a2e]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <LockIcon />
                <div>
                  <p className="font-semibold text-white">System Lockdown</p>
                  <p className="text-xs text-gray-400">Block Alt+F4, app switching & more</p>
                </div>
              </div>
              <button
                onClick={() => setLockdownEnabled(!lockdownEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${lockdownEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${lockdownEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            
            {lockdownEnabled && (
              <div className="mt-3 pt-3 border-t border-[#3a3a3f]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Allowed apps: {allowedApps.length}</span>
                  <button 
                    onClick={onOpenAllowedApps}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <SettingsIcon /> Configure
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => onStart(duration, task, lockdownEnabled)} 
          className="w-full mt-8 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          {lockdownEnabled ? <LockIcon /> : <PlayIcon />} 
          {lockdownEnabled ? 'Start Locked Session' : 'Start Session'}
        </button>
      </div>
    </div>
  );
}

// --- Format Time Helpers ---
const formatTimeForCard = (seconds) => {
  const roundedSeconds = Math.round(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

const formatCountdown = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function FocusMode() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllowedAppsModalOpen, setIsAllowedAppsModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [focusHistory, setFocusHistory] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [allowedApps, setAllowedApps] = useState([]);
  const intervalRef = useRef(null);

  // Load focus history and settings
  useEffect(() => {
    // Load history from localStorage
    try {
      const saved = localStorage.getItem('cw_focus_history');
      if (saved) {
        const history = JSON.parse(saved);
        setFocusHistory(history);
        calculateStats(history);
      }
    } catch {}

    // Load allowed apps from backend
    loadAllowedApps();
    
    // Check if there's an active focus session
    checkFocusStatus();
  }, []);

  const loadAllowedApps = async () => {
    try {
      if (window.electronAPI?.focusGetAllowedApps) {
        const apps = await window.electronAPI.focusGetAllowedApps();
        setAllowedApps(apps || []);
      }
    } catch {}
  };

  const checkFocusStatus = async () => {
    try {
      if (window.electronAPI?.focusStatus) {
        const status = await window.electronAPI.focusStatus();
        if (status.isActive) {
          setIsActive(true);
          setIsLocked(true);
          setCurrentTask(status.task);
          setTimeRemaining(Math.floor(status.timeRemaining / 1000));
          setSessionDuration(Math.floor((status.endTime - Date.now() + status.timeRemaining) / 1000));
        }
      }
    } catch {}
  };

  const saveAllowedApps = async (apps) => {
    setAllowedApps(apps);
    try {
      if (window.electronAPI?.focusSaveAllowedApps) {
        await window.electronAPI.focusSaveAllowedApps(apps);
      }
    } catch {}
  };

  const calculateStats = (history) => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    let todaySum = 0;
    let weekSum = 0;
    let todaySessions = 0;

    history.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const sessionKey = sessionDate.toISOString().slice(0, 10);
      
      if (sessionKey === todayKey) {
        todaySum += session.duration;
        todaySessions++;
      }
      if (sessionDate >= weekStart) {
        weekSum += session.duration;
      }
    });

    setTodayTotal(todaySum);
    setWeekTotal(weekSum);
    setSessionsToday(todaySessions);
    
    let currentStreak = 0;
    const checkDate = new Date(now);
    while (true) {
      const key = checkDate.toISOString().slice(0, 10);
      const hasSession = history.some(s => new Date(s.timestamp).toISOString().slice(0, 10) === key);
      if (hasSession) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  };

  const startSession = async (duration, task, lockdownEnabled = false) => {
    setSessionDuration(duration * 60);
    setTimeRemaining(duration * 60);
    setCurrentTask(task || 'Focus Session');
    setIsActive(true);
    setIsLocked(lockdownEnabled);
    setIsModalOpen(false);

    // Start backend lockdown if enabled
    if (lockdownEnabled && window.electronAPI?.focusStart) {
      try {
        await window.electronAPI.focusStart({
          duration,
          task: task || 'Focus Session',
          allowedApps
        });
      } catch (e) {
        console.error('Failed to start focus lockdown:', e);
      }
    }
  };

  const endSession = async (completed = false) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const actualDuration = sessionDuration - timeRemaining;
    
    // End backend lockdown
    if (isLocked && window.electronAPI?.focusEnd) {
      try {
        await window.electronAPI.focusEnd();
      } catch (e) {
        console.error('Failed to end focus lockdown:', e);
      }
    }
    
    if (actualDuration > 60) {
      const session = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        duration: actualDuration,
        task: currentTask,
        completed,
        wasLocked: isLocked
      };
      
      const newHistory = [session, ...focusHistory].slice(0, 50);
      setFocusHistory(newHistory);
      localStorage.setItem('cw_focus_history', JSON.stringify(newHistory));
      calculateStats(newHistory);
    }
    
    setIsActive(false);
    setIsLocked(false);
    setTimeRemaining(0);
    setSessionDuration(0);
    setCurrentTask('');
  };

  // Timer countdown
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endSession(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const progressPercentage = sessionDuration > 0 ? ((sessionDuration - timeRemaining) / sessionDuration) * 100 : 0;

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayTotal = focusHistory
        .filter(s => new Date(s.timestamp).toISOString().slice(0, 10) === key)
        .reduce((sum, s) => sum + s.duration, 0);
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        total: dayTotal
      });
    }
    return days;
  }, [focusHistory]);

  const maxWeekly = Math.max(1, ...weeklyData.map(d => d.total));
  const dailyTarget = 2 * 3600;

  return (
    <>
      <AllowedAppsModal 
        isOpen={isAllowedAppsModalOpen}
        onClose={() => setIsAllowedAppsModalOpen(false)}
        allowedApps={allowedApps}
        onSave={saveAllowedApps}
      />
      
      <FocusSessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onStart={startSession}
        allowedApps={allowedApps}
        onOpenAllowedApps={() => {
          setIsModalOpen(false);
          setIsAllowedAppsModalOpen(true);
        }}
      />
      
      <div className="max-w-7xl mx-auto px-8 py-12 text-white">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              Focus Mode
              {isLocked && <LockIcon />}
            </h1>
            <p className="text-gray-400 mt-2">Deep work sessions with optional system lockdown</p>
          </div>
          <div className="flex items-center gap-3">
            {!isActive && (
              <>
                <button 
                  onClick={() => setIsAllowedAppsModalOpen(true)}
                  className="px-4 py-3 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] font-semibold flex items-center gap-2 transition-colors"
                >
                  <SettingsIcon /> Allowed Apps
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold flex items-center gap-2 transition-colors"
                >
                  <PlayIcon /> Start Session
                </button>
              </>
            )}
          </div>
        </header>

        {/* Active Session Display */}
        {isActive && (
          <section className="mb-12">
            <div className={`p-10 rounded-2xl backdrop-blur-md border shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${
              isLocked 
                ? 'bg-gradient-to-br from-red-900/40 to-purple-900/40 border-red-500/30' 
                : 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30'
            }`}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left">
                  {isLocked && (
                    <div className="flex items-center gap-2 mb-3 text-red-400">
                      <LockIcon />
                      <span className="text-sm font-semibold uppercase tracking-wider">System Locked</span>
                    </div>
                  )}
                  <p className="text-sm text-purple-300 uppercase tracking-wider mb-2">Currently Focusing On</p>
                  <h2 className="text-2xl font-bold text-white mb-4">{currentTask}</h2>
                  
                  {isLocked && allowedApps.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">Allowed apps:</p>
                      <div className="flex flex-wrap gap-2">
                        {allowedApps.slice(0, 5).map((app, idx) => (
                          <span key={idx} className="px-2 py-1 rounded bg-[#27272a]/50 text-xs">{app.name}</span>
                        ))}
                        {allowedApps.length > 5 && (
                          <span className="px-2 py-1 rounded bg-[#27272a]/50 text-xs">+{allowedApps.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => endSession(false)}
                      className="px-6 py-3 rounded-xl bg-red-600/80 hover:bg-red-500 font-semibold flex items-center gap-2"
                    >
                      {isLocked ? <UnlockIcon /> : <StopIcon />}
                      {isLocked ? 'Unlock & End' : 'End Session'}
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-48 h-48 rounded-full border-8 border-[#27272a] relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="44%"
                        fill="none"
                        stroke={isLocked ? "url(#gradient-locked)" : "url(#gradient)"}
                        strokeWidth="8"
                        strokeDasharray={`${progressPercentage * 2.76} 276`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient id="gradient-locked" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{formatCountdown(timeRemaining)}</span>
                      <span className="text-sm text-gray-400">{isLocked ? '🔒 Locked' : 'Remaining'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard 
            icon={<ClockIcon />} 
            title="Today's Focus" 
            value={formatTimeForCard(todayTotal)} 
            footerText={`${sessionsToday} session${sessionsToday !== 1 ? 's' : ''} completed`}
            footerColor="text-gray-400" 
          />
          <StatCard 
            icon={<TrendingUpIcon />} 
            title="This Week" 
            value={formatTimeForCard(weekTotal)} 
            footerText="Total focus time"
            footerColor="text-gray-400" 
          />
          <StatCard 
            icon={<AwardIcon />} 
            title="Focus Streak" 
            value={`${streak} day${streak !== 1 ? 's' : ''}`}
            footerText={streak > 0 ? "Keep it going!" : "Start your streak today"}
            footerColor={streak > 0 ? "text-green-400" : "text-gray-400"} 
          />
          <StatCard 
            icon={<ShieldIcon />} 
            title="Allowed Apps" 
            value={allowedApps.length}
            footerText="Click to configure"
            footerColor="text-purple-400"
            onClick={() => setIsAllowedAppsModalOpen(true)}
          />
        </section>

        {/* Analytics & Quick Start */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Weekly Chart */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-purple-400">Focus Time Analytics</h2>
              <span className="text-sm text-gray-400">Last 7 days</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl p-4 bg-[#202024]/70 border border-[#2a2a2e]">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Today</div>
                <div className="text-2xl font-bold">{formatTimeForCard(todayTotal)}</div>
                <div className="text-xs text-gray-500 mt-1">{Math.round((todayTotal / dailyTarget) * 100)}% of 2h goal</div>
              </div>
              <div className="rounded-xl p-4 bg-[#202024]/70 border border-[#2a2a2e]">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Average Daily</div>
                <div className="text-2xl font-bold">{formatTimeForCard(weekTotal / 7)}</div>
                <div className="text-xs text-gray-500 mt-1">This week</div>
              </div>
              <div className="rounded-xl p-4 bg-[#202024]/70 border border-[#2a2a2e]">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Best Day</div>
                <div className="text-2xl font-bold">{weeklyData.reduce((best, d) => d.total > best.total ? d : best, { label: '-', total: 0 }).label}</div>
                <div className="text-xs text-gray-500 mt-1">{formatTimeForCard(Math.max(...weeklyData.map(d => d.total)))}</div>
              </div>
            </div>

            <p className="text-gray-400 mb-4">Weekly Overview</p>
            <div className="grid grid-cols-7 gap-4">
              {weeklyData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="relative w-full bg-[#1b1b1e] rounded-lg h-32 flex items-end overflow-hidden">
                    <div className="absolute left-0 right-0" style={{ bottom: `${Math.round((dailyTarget / maxWeekly) * 100)}%` }}>
                      <div className="h-px bg-[#3a3a3f]/60 w-full" />
                    </div>
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-purple-600 to-blue-600 transition-[height] duration-500"
                      style={{ height: `${Math.round((d.total / maxWeekly) * 100)}%` }}
                      title={`${d.label} • ${formatTimeForCard(d.total)}`}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{d.label}</div>
                  <div className="text-[10px] text-gray-500">{formatTimeForCard(d.total)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start Presets */}
          <div className="p-8 rounded-2xl flex flex-col bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold mb-6">Quick Start (Locked)</h2>
            <div className="space-y-3 flex-1">
              <button 
                onClick={() => startSession(25, 'Pomodoro Session', true)}
                disabled={isActive}
                className="w-full p-4 rounded-xl bg-[#27272a]/50 border border-[#2a2a2e] hover:bg-[#3f3f46] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <span className="text-lg">🍅</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Pomodoro</p>
                    <p className="text-xs text-gray-400">25 minutes • Locked</p>
                  </div>
                  <LockIcon />
                </div>
              </button>
              
              <button 
                onClick={() => startSession(45, 'Deep Work', true)}
                disabled={isActive}
                className="w-full p-4 rounded-xl bg-[#27272a]/50 border border-[#2a2a2e] hover:bg-[#3f3f46] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <ZapIcon />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Deep Work</p>
                    <p className="text-xs text-gray-400">45 minutes • Locked</p>
                  </div>
                  <LockIcon />
                </div>
              </button>
              
              <button 
                onClick={() => startSession(90, 'Flow State', true)}
                disabled={isActive}
                className="w-full p-4 rounded-xl bg-[#27272a]/50 border border-[#2a2a2e] hover:bg-[#3f3f46] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-lg">🌊</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Flow State</p>
                    <p className="text-xs text-gray-400">90 minutes • Locked</p>
                  </div>
                  <LockIcon />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Recent Sessions */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">Recent Focus Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {focusHistory.length > 0 ? (
              focusHistory.slice(0, 6).map(session => (
                <SessionHistoryItem 
                  key={session.id}
                  date={new Date(session.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  duration={session.duration}
                  task={session.task}
                />
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#27272a]/50 p-8 rounded-lg text-center text-gray-500 border-2 border-dashed border-gray-700">
                <p className="font-semibold">No focus sessions recorded yet.</p>
                <p className="text-sm mt-1">Start your first focus session to begin tracking your productivity!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
