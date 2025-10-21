import React, { useState, useEffect } from 'react';

// --- SVG Icon Components for better readability and reuse ---

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m14.31 8 5.74 9.94" /><path d="M9.69 8h11.48" /><path d="m7.38 12 5.74-9.94" /><path d="M9.69 16 3.95 6.06" /><path d="M14.31 16H2.83" /><path d="m16.62 12-5.74 9.94" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16h20V4" /><path d="M2 10h20" /><path d="M6 14v-4" /><path d="M18 14v-4" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="10" y1="15" x2="10" y2="9" /><line x1="14" y1="15" x2="14" y2="9" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const ZapOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12.41 6.75 13 2 10.57 4.92" /><polyline points="18.57 12.91 21 10 15.66 10" /><polyline points="8 8 3 14 12 14 11 22 16 16" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;

// --- Component to inject scrollbar styles ---
const ScrollbarStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #3f3f46;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #52525b;
    }
  `}</style>
);


export default function Sidebar({ currentPage = 'Dashboard', onNavigate, onOpenChange, onDetoxStart, forceOpen = false }) {
  const [isOpen, setIsOpen] = useState(false); // State to control sidebar visibility
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [scorePct, setScorePct] = useState(0); // 0-100

  // Effect to add mouse move listener to open sidebar
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Open the sidebar if the mouse is near the left edge of the screen
      if (e.clientX < 20) {
        if (!isOpen) {
          setIsOpen(true);
          onOpenChange && onOpenChange(true);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup the listener when the component is unmounted
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen, onOpenChange]);

  // Sync external control
  useEffect(() => {
    if (forceOpen !== isOpen) {
      setIsOpen(Boolean(forceOpen));
      onOpenChange && onOpenChange(Boolean(forceOpen));
    }
  }, [forceOpen]);

  // Helpers
  const formatHM = (s) => {
    const sec = Math.max(0, Math.floor(s || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };
  const lastNDaysKeys = (n=7) => {
    const keys=[]; const now=new Date();
    for(let i=0;i<n;i++){ const d=new Date(now); d.setDate(now.getDate()-i); keys.push(d.toISOString().slice(0,10)); }
    return keys.reverse();
  };

  // Poll backend for screen time and sleep to compute metrics
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const sh = await window.electronAPI?.getScreenHistory?.();
        const ss = await window.electronAPI?.sleepStatus?.();
        if (!mounted) return;
        const todayKey = new Date().toISOString().slice(0,10);
        setTodaySeconds(sh?.[todayKey]?.total || 0);
        // Weekly score from screen-time and sleep
        const week = lastNDaysKeys(7);
        const dailyTarget = 6*3600;
        const screenDaysMet = week.reduce((acc,k)=> acc + ((sh?.[k]?.total||0) <= dailyTarget ? 1:0), 0);
        const screenPct = Math.round((screenDaysMet/7)*100);
        const sleepTarget = 8*3600;
        // map best sleep per day
        const m = {};
        (ss?.history||[]).forEach(e=>{
          const day = (new Date(e.start)).toISOString().slice(0,10);
          m[day] = Math.max(m[day]||0, Math.max(0, e.duration||0));
        });
        const avgSleep = week.reduce((a,k)=> a + (m[k]||0), 0)/7;
        const sleepPct = Math.max(0, Math.min(100, Math.round((avgSleep / sleepTarget)*100)));
        const score = Math.round((screenPct*0.35) + (sleepPct*0.65));
        setScorePct(Math.max(0, Math.min(100, score)));
      } catch {}
    };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const navItems = [
    { icon: <DashboardIcon />, name: 'Dashboard' },
    { icon: <PhoneIcon />, name: 'App Usage' },
    { icon: <ClockIcon />, name: 'Screen Time' },
    { icon: <ShieldIcon />, name: 'Focus Mode' },
    { icon: <BedIcon />, name: 'Sleep Tracker' },
    { icon: <HeartIcon />, name: 'Mindfulness' },
    { icon: <FileTextIcon />, name: 'Reports' },
  ];

  const quickActions = [
    { icon: <ZapOffIcon />, name: 'Digital Detox' },
  ];

  return (
    <>
      <ScrollbarStyles />
      <aside 
        className={`fixed top-0 left-0 h-screen w-72 bg-[#181818] text-gray-300 p-6 flex flex-col z-50 
                   transition-transform duration-300 ease-in-out 
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onMouseLeave={() => {
          setIsOpen(false);
          onOpenChange && onOpenChange(false);
        }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">CosmicWell</div>
            <div className="text-[10px] text-gray-400 -mt-0.5">Digital Wellbeing</div>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-purple-400 tracking-wider">WELLBEING OVERVIEW</h2>
        </div>

        <div className="flex-1 overflow-y-auto -mr-6 pr-6 custom-scrollbar">
          <div className="bg-[#27272a] p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Digital Health Score</span>
              <span className="text-2xl font-bold text-yellow-400">{(scorePct/10).toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, scorePct)}%` }}></div>
            </div>
          </div>

          <div className="bg-[#27272a] p-4 rounded-lg mb-8">
            <p className="text-sm mb-1">Today's Screen Time</p>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-white">{formatHM(todaySeconds)}</span>
            </div>
          </div>

          <h3 className="text-xs font-semibold text-gray-500 mb-3 tracking-wider">NAVIGATION</h3>
          <nav>
            <ul>
              {navItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigate) onNavigate(item.name);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      currentPage === item.name
                        ? 'bg-[#3f3f46] text-white'
                        : 'hover:bg-[#27272a] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 mb-3 tracking-wider">QUICK ACTIONS</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="w-full flex items-center gap-4 p-3 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
                  onClick={() => {
                    onDetoxStart && onDetoxStart();
                    setIsOpen(false);
                    onOpenChange && onOpenChange(false);
                  }}
                >
                  {action.icon}
                  <span className="font-medium">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
