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


export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // State to control sidebar visibility

  // Effect to add mouse move listener to open sidebar
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Open the sidebar if the mouse is near the left edge of the screen
      if (e.clientX < 20) {
        setIsOpen(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup the listener when the component is unmounted
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const navItems = [
    { icon: <DashboardIcon />, name: 'Dashboard', active: true },
    { icon: <PhoneIcon />, name: 'App Usage' },
    { icon: <ShieldIcon />, name: 'Focus Mode' },
    { icon: <BedIcon />, name: 'Sleep Tracker' },
    { icon: <HeartIcon />, name: 'Mindfulness' },
    { icon: <FileTextIcon />, name: 'Reports' },
  ];

  const quickActions = [
    { icon: <PauseIcon />, name: 'Take a Break' },
    { icon: <MoonIcon />, name: 'Night Mode' },
    { icon: <ZapOffIcon />, name: 'Digital Detox' },
  ];

  return (
    <>
      <ScrollbarStyles />
      <aside 
        className={`fixed top-0 left-0 h-screen w-72 bg-[#181818] text-gray-300 p-6 flex flex-col z-50 
                   transition-transform duration-300 ease-in-out 
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onMouseLeave={() => setIsOpen(false)} // This closes the sidebar when the mouse leaves it
      >
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-purple-400">WELLBEING OVERVIEW</h2>
        </div>

        {/* --- Scrollable Content Area --- */}
        <div className="flex-1 overflow-y-auto -mr-6 pr-6 custom-scrollbar">
          {/* --- Health Score Card --- */}
          <div className="bg-[#27272a] p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Digital Health Score</span>
              <span className="text-2xl font-bold text-yellow-400">8.7</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>

          {/* --- Screen Time Card --- */}
          <div className="bg-[#27272a] p-4 rounded-lg mb-8">
            <p className="text-sm mb-1">Today's Screen Time</p>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-white">5h 23m</span>
              <div className="flex items-center text-sm text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
                <span>12%</span>
              </div>
            </div>
          </div>

          {/* --- Navigation --- */}
          <h3 className="text-xs font-semibold text-gray-500 mb-3 tracking-wider">NAVIGATION</h3>
          <nav>
            <ul>
              {navItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <a href="#" className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      item.active 
                      ? 'bg-[#3f3f46] text-white' 
                      : 'hover:bg-[#27272a] hover:text-white'
                    }`}>
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- Quick Actions --- */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 mb-3 tracking-wider">QUICK ACTIONS</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                 <button key={action.name} className="w-full flex items-center gap-4 p-3 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] transition-colors">
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

