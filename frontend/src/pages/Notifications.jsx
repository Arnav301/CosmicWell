import React, { useEffect, useState } from 'react';

// Icons
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

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
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

// Sample notifications generator
const generateSampleNotifications = () => {
  const now = Date.now();
  const hour = 3600000;
  const day = 24 * hour;
  
  return [
    {
      id: generateId(),
      type: 'achievement',
      title: '🎉 Weekly Streak Achieved!',
      message: 'You\'ve maintained your screen time goals for 7 days straight. Keep up the great work!',
      timestamp: now - 10 * 60 * 1000,
      read: false,
      actionLabel: 'View Stats',
      actionPage: 'Screen Time',
    },
    {
      id: generateId(),
      type: 'screenTime',
      title: 'Daily Limit Approaching',
      message: 'You\'ve used 5h 30m of screen time today. Only 30 minutes remaining until your 6h daily limit.',
      timestamp: now - 45 * 60 * 1000,
      read: false,
    },
    {
      id: generateId(),
      type: 'mindfulness',
      title: 'Time for a Break',
      message: 'You\'ve been active for 2 hours. Consider taking a 5-minute mindfulness break to refresh.',
      timestamp: now - 2 * hour,
      read: false,
      actionLabel: 'Start Session',
      actionPage: 'Mindfulness',
    },
    {
      id: generateId(),
      type: 'goal',
      title: 'Goal Reminder',
      message: 'You haven\'t logged your daily goals yet. Take a moment to track your progress!',
      timestamp: now - 3 * hour,
      read: true,
      actionLabel: 'Log Goals',
      actionPage: 'Dashboard',
    },
    {
      id: generateId(),
      type: 'sleep',
      title: 'Bedtime Approaching',
      message: 'Based on your sleep schedule, bedtime is in 1 hour. Start winding down for better rest.',
      timestamp: now - 5 * hour,
      read: true,
    },
    {
      id: generateId(),
      type: 'alert',
      title: 'High App Usage Detected',
      message: 'You\'ve spent 3 hours on social media today, which is 50% higher than your weekly average.',
      timestamp: now - 8 * hour,
      read: true,
      actionLabel: 'View Details',
      actionPage: 'App Usage',
    },
    {
      id: generateId(),
      type: 'achievement',
      title: '🏆 New Milestone!',
      message: 'You\'ve completed 10 mindfulness sessions this month. You\'re building a great habit!',
      timestamp: now - day,
      read: true,
    },
    {
      id: generateId(),
      type: 'sleep',
      title: 'Sleep Summary',
      message: 'Last night you slept 7h 45m. That\'s 15 minutes short of your 8h target, but still great!',
      timestamp: now - day - 2 * hour,
      read: true,
    },
    {
      id: generateId(),
      type: 'system',
      title: 'Weekly Report Ready',
      message: 'Your weekly wellness report is now available. See how you performed this week.',
      timestamp: now - 2 * day,
      read: true,
    },
    {
      id: generateId(),
      type: 'goal',
      title: '✅ Daily Goals Complete!',
      message: 'Congratulations! You\'ve completed all 3 of your daily goals. Amazing consistency!',
      timestamp: now - 2 * day - 6 * hour,
      read: true,
    },
    {
      id: generateId(),
      type: 'screenTime',
      title: 'Focus Mode Ended',
      message: 'Your 25-minute focus session has ended. Great job staying focused!',
      timestamp: now - 3 * day,
      read: true,
    },
    {
      id: generateId(),
      type: 'mindfulness',
      title: 'Breathing Exercise Complete',
      message: 'You completed a 10-minute breathing exercise. Your stress levels should feel lower.',
      timestamp: now - 4 * day,
      read: true,
    },
  ];
};

const NotificationCard = ({ notification, onMarkRead, onDelete, onAction }) => {
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
  const IconComponent = typeConfig.icon;
  
  return (
    <div className={`p-4 rounded-xl border transition-all ${notification.read ? 'bg-[#1a1a1d]/50 border-[#2a2a2e]/50' : 'bg-[#202024]/70 border-[#2a2a2e] shadow-lg'}`}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
          <span className={typeConfig.color}><IconComponent /></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                {notification.title}
                {!notification.read && <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full inline-block" />}
              </h3>
              <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-400'}`}>
                {notification.message}
              </p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimeAgo(notification.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {notification.actionLabel && (
              <button
                onClick={() => onAction(notification)}
                className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
              >
                {notification.actionLabel}
              </button>
            )}
            {!notification.read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-gray-300 transition flex items-center gap-1"
              >
                <CheckIcon /> Mark Read
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="px-2 py-1.5 text-xs rounded-lg bg-[#3f3f46] hover:bg-red-600/50 text-gray-400 hover:text-red-400 transition ml-auto"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterTab = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-purple-600 text-white' : 'bg-[#27272a] text-gray-400 hover:bg-[#3f3f46]'}`}
  >
    {label}
    {count > 0 && (
      <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-purple-400/30' : 'bg-gray-600'}`}>
        {count}
      </span>
    )}
  </button>
);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | type
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load notifications from localStorage or generate samples
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

  // Save to localStorage when notifications change
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

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('cw_notifications');
    setShowClearConfirm(false);
  };

  const handleAction = (notification) => {
    if (notification.actionPage) {
      window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page: notification.actionPage } }));
    }
    markAsRead(notification.id);
  };

  // Add a new notification (for demo purposes)
  const addTestNotification = () => {
    const types = ['screenTime', 'goal', 'sleep', 'mindfulness', 'achievement', 'alert'];
    const messages = [
      { type: 'screenTime', title: 'Screen Time Update', message: 'You\'ve used 4 hours of screen time today.' },
      { type: 'goal', title: 'Goal Progress', message: 'You\'re 75% towards completing your daily reading goal!' },
      { type: 'sleep', title: 'Sleep Reminder', message: 'Time to start your wind-down routine for better sleep.' },
      { type: 'mindfulness', title: 'Mindfulness Break', message: 'Take a moment to breathe and reset your focus.' },
      { type: 'achievement', title: '🌟 New Achievement!', message: 'You\'ve unlocked the "Early Bird" badge!' },
      { type: 'alert', title: 'Usage Warning', message: 'Gaming apps usage is 2x higher than usual today.' },
    ];
    const selected = messages[Math.floor(Math.random() * messages.length)];
    const newNotification = {
      id: generateId(),
      ...selected,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((acc, n) => {
    const date = new Date(n.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let group;
    if (date.toDateString() === today.toDateString()) {
      group = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    } else if (Date.now() - n.timestamp < 7 * 24 * 3600 * 1000) {
      group = 'This Week';
    } else {
      group = 'Earlier';
    }
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const typeFilters = ['screenTime', 'goal', 'sleep', 'mindfulness', 'achievement', 'alert'];

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 text-white">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">Notifications</h1>
          <p className="text-sm text-gray-400 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addTestNotification}
            className="px-4 py-2 rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-sm"
          >
            + Test
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm"
            >
              Mark All Read
            </button>
          )}
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterTab active={filter === 'all'} label="All" count={notifications.length} onClick={() => setFilter('all')} />
        <FilterTab active={filter === 'unread'} label="Unread" count={unreadCount} onClick={() => setFilter('unread')} />
        <div className="w-px bg-gray-700 mx-2" />
        {typeFilters.map(type => {
          const count = notifications.filter(n => n.type === type).length;
          const typeConfig = NOTIFICATION_TYPES[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${filter === type ? 'bg-purple-600 text-white' : 'bg-[#27272a] text-gray-400 hover:bg-[#3f3f46]'}`}
            >
              <typeConfig.icon />
              <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl p-12 bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <BellIcon />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
          <p className="text-gray-400 text-sm">
            {filter === 'unread' ? 'You\'ve read all your notifications!' : 'No notifications to show.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([group, items]) => (
            <div key={group}>
              <h2 className="text-sm font-medium text-gray-500 mb-3">{group}</h2>
              <div className="space-y-3">
                {items.map(notification => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-700/50 flex justify-center">
          {showClearConfirm ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Clear all notifications?</span>
              <button onClick={clearAll} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm">Yes, Clear All</button>
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-sm">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-sm text-gray-400"
            >
              Clear All Notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}
