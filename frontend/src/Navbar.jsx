import React from 'react';

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


// --- Main Navbar Component ---

export default function Navbar() {
  return (
    <nav className="bg-[#181818] text-gray-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">

        {/* Left Section: Logo and Branding */}
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
            <a href="#" className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white">
              <HomeIcon />
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white">
              <AnalyticsIcon />
              Analytics
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white">
              <SettingsIcon />
              Settings
            </a>
          </li>
        </ul>

        {/* Right Section: Actions and Profile */}
        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          <div className="relative">
            <button className="text-gray-400 transition-colors hover:text-white">
              <BellIcon />
            </button>
            {/* Notification Dot */}
            <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-yellow-400"></span>
          </div>
          {/* User Profile Avatar */}
          <button>
            <img 
              className="h-10 w-10 rounded-full border-2 border-purple-500 object-cover" 
              src="https://placehold.co/40x40/7e22ce/ffffff?text=U" 
              alt="User profile avatar" 
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
