import React, { useEffect, useRef, useState } from 'react';

// --- SVG Icon Components (for better readability) ---

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);


// --- Extra: Hamburger Icon ---
const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// --- Main Navbar Component ---

export default function Navbar({ user, onSignOut }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);
  return (
    <nav className="bg-[#181818] text-gray-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">

        {/* Left Section: Menu + Logo and Branding */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <StarIcon />
          </a>
          {/* Branding Text */}
          <div>
            <h1 className="text-lg font-bold text-white">CosmicWell</h1>
            <p className="text-xs text-gray-400">Digital Wellbeing Dashboard</p>
          </div>
        </div>

        {/* Center Section: Navigation Links (Hidden on small screens) */}
        <ul className="hidden items-center gap-8 md:flex">
          <li>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page: 'Dashboard' } }))}
              className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
            >
              <HomeIcon />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page: 'Screen Time' } }))}
              className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
            >
              <AnalyticsIcon />
              Analytics
            </button>
          </li>
          <li>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page: 'Settings' } }))}
              className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
            >
              <SettingsIcon />
              Settings
            </button>
          </li>
        </ul>

        {/* Right Section: Notifications and Logout */}
        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          <div className="relative">
            <button className="text-gray-400 transition-colors hover:text-white" title="Notifications">
              <BellIcon />
            </button>
            <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-yellow-400"></span>
          </div>

          {/* Avatar and Logout (icon only) */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <div className="h-9 w-9 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-icon lucide-user">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border border-[#2a2a2e] bg-[#1f1f22] shadow-lg z-50">
                <button
                  onClick={() => { setProfileOpen(false); onSignOut && onSignOut(); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#2a2a2e] rounded-md"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
