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

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

const NOTIFICATION_TYPES = {
  screenTime: { icon: ClockIcon, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  goal: { icon: TargetIcon, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  sleep: { icon: MoonIcon, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  mindfulness: { icon: HeartIcon, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  achievement: { icon: TrophyIcon, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  alert: { icon: AlertIcon, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  system: { icon: BellIcon, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
};

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const generateSampleNotifications = () => {
  const now = Date.now();
  const hour = 3600000;
  const day = 24 * hour;
  
  return [
    { id: generateId(), type: 'achievement', title: '🎉 Weekly Streak!', message: 'You\'ve maintained your screen time goals for 7 days straight.', timestamp: now - 10 * 60 * 1000, read: false, actionPage: 'Screen Time' },
    { id: generateId(), type: 'screenTime', title: 'Daily Limit Approaching', message: 'You\'ve used 5h 30m today. Only 30 minutes remaining.', timestamp: now - 45 * 60 * 1000, read: false },
    { id: generateId(), type: 'mindfulness', title: 'Time for a Break', message: 'You\'ve been active for 2 hours. Take a mindful break.', timestamp: now - 2 * hour, read: false, actionPage: 'Mindfulness' },
    { id: generateId(), type: 'goal', title: 'Goal Reminder', message: 'You haven\'t logged your daily goals yet.', timestamp: now - 3 * hour, read: true, actionPage: 'Dashboard' },
    { id: generateId(), type: 'sleep', title: 'Bedtime Approaching', message: 'Bedtime is in 1 hour. Start winding down.', timestamp: now - 5 * hour, read: true },
    { id: generateId(), type: 'alert', title: 'High App Usage', message: 'Social media usage is 50% higher than average.', timestamp: now - 8 * hour, read: true, actionPage: 'App Usage' },
    { id: generateId(), type: 'achievement', title: '🏆 New Milestone!', message: 'Completed 10 mindfulness sessions this month.', timestamp: now - day, read: true },
    { id: generateId(), type: 'sleep', title: 'Sleep Summary', message: 'Last night: 7h 45m. 15 minutes short of target.', timestamp: now - day - 2 * hour, read: true },
  ];
};


// --- Extra: Hamburger Icon ---
const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// --- Notification Item Component ---
const NotificationItem = ({ notification, onMarkRead, onAction }) => {
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
  const IconComponent = typeConfig.icon;
  
  return (
    <div
      className={`p-3 border-b border-[#2a2a2e] last:border-0 hover:bg-[#27272a] transition cursor-pointer ${!notification.read ? 'bg-[#1f1f22]' : ''}`}
      onClick={() => {
        onMarkRead(notification.id);
        if (notification.actionPage) onAction(notification.actionPage);
      }}
    >
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
          <span className={typeConfig.color}><IconComponent /></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium truncate ${notification.read ? 'text-gray-300' : 'text-white'}`}>
              {notification.title}
              {!notification.read && <span className="ml-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full inline-block" />}
            </p>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">{formatTimeAgo(notification.timestamp)}</span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Navbar Component ---

export default function Navbar({ user, onSignOut }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Load notifications
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cw_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const samples = generateSampleNotifications();
        setNotifications(samples);
        localStorage.setItem('cw_notifications', JSON.stringify(samples));
      }
    } catch {
      setNotifications(generateSampleNotifications());
    }
  }, []);

  // Save notifications when changed
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('cw_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAction = (page) => {
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page } }));
    setNotificationsOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const [activeNav, setActiveNav] = useState('Dashboard');
  
  const handleNavClick = (page) => {
    setActiveNav(page);
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page } }));
  };

  return (
    <div className="w-full flex items-center justify-between py-5 px-8 z-40">
      
      {/* Left Side: Mini Branding */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            <path d="M19 3v4" />
            <path d="M21 5h-4" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">CosmicWell</h1>
          <p className="text-purple-400/70 text-xs font-medium">Digital Wellness</p>
        </div>
      </div>

      {/* Center: Navigation Pill */}
      <nav className="flex items-center gap-3 bg-[#1a1a1d] rounded-full px-3 py-2.5 shadow-2xl shadow-black/40 border border-[#2a2a2e]/40">
        
        {/* Logo Circle in Nav */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavClick('Dashboard'); }}
          className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden transition-transform hover:scale-105 shadow-lg"
        >
          <img 
            src="/logo.png" 
            alt="CosmicWell" 
            className="h-full w-full object-cover"
          />
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {[
            { name: 'Dashboard', label: 'Home' },
            { name: 'Screen Time', label: 'Analytics' },
            { name: 'Settings', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.name)}
              className={`relative px-6 py-3 text-[15px] font-medium rounded-full transition-colors duration-200 overflow-hidden group ${
                activeNav === item.name 
                  ? 'text-white hover:text-[#1a1a1d]'
                  : 'text-gray-400 hover:text-[#1a1a1d]'
              }`}
            >
              <span className="absolute inset-0 rounded-full bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Section: Notifications + Profile */}
        <div className="flex items-center gap-2 ml-3">
          
          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(v => !v)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition-all hover:text-white hover:bg-[#27272a]"
              title="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Popup */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 max-h-[480px] rounded-2xl border border-[#2a2a2e] bg-[#1a1a1d] shadow-2xl shadow-black/50 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2e]/50">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      <CheckIcon /> Mark all read
                    </button>
                  )}
                </div>
                
                {/* Notification List */}
                <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="flex justify-center mb-3 opacity-50"><BellIcon /></div>
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onAction={handleAction}
                      />
                    ))
                  )}
                </div>
                
                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-[#2a2a2e]/50">
                    <button
                      onClick={() => {
                        handleAction('Notifications');
                      }}
                      className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Button - Pill Style */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[#1a1a1d] font-medium text-[15px] transition-all hover:bg-gray-100"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="hidden sm:inline">{user?.name || 'Profile'}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-44 rounded-2xl border border-[#2a2a2e] bg-[#1a1a1d] shadow-2xl shadow-black/50 z-50 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-[#2a2a2e]/50">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm text-white font-medium truncate">{user?.name || 'User'}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); handleNavClick('Settings'); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-[#27272a] hover:text-white transition-colors flex items-center gap-2"
                >
                  <SettingsIcon />
                  Settings
                </button>
                <button
                  onClick={() => { setProfileOpen(false); onSignOut && onSignOut(); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Right Side: Theme Toggle + Date/Time */}
      {/* Right Side: Date/Time */}
      <div className="flex items-center gap-2 text-right">
        <div>
          <p className="text-white font-medium text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          <p className="text-gray-500 text-[11px]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-[#1a1a1d] border border-[#2a2a2e]/50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>
    </div>
  );
}
