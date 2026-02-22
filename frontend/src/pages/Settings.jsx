import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-600'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`} />
  </button>
);

const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-700/50 last:border-0">
    <div>
      <p className="font-medium text-white">{label}</p>
      {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div>{children}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="rounded-2xl p-6 bg-[#202024]/70 backdrop-blur-md border border-[#2a2a2e] mb-6">
    <h2 className="text-lg font-semibold text-purple-400 mb-4">{title}</h2>
    {children}
  </div>
);

export default function Settings() {
  const { logout } = useAuth();
  // Profile
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Notifications
  const [notifyScreenTime, setNotifyScreenTime] = useState(true);
  const [notifyGoals, setNotifyGoals] = useState(true);
  const [notifySleep, setNotifySleep] = useState(false);
  const [notifyMindfulness, setNotifyMindfulness] = useState(true);

  // Privacy
  const [trackApps, setTrackApps] = useState(true);
  const [storeHistory, setStoreHistory] = useState(true);

  // Appearance
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('purple');

  // Goals defaults
  const [dailyScreenLimit, setDailyScreenLimit] = useState(6);
  const [sleepTarget, setSleepTarget] = useState(8);

  // Load from localStorage
  useEffect(() => {
    try {
      const name = localStorage.getItem('cw_user_name') || '';
      const mail = localStorage.getItem('cw_user_email') || '';
      setDisplayName(name);
      setEmail(mail);

      const settings = JSON.parse(localStorage.getItem('cw_settings') || '{}');
      if (settings.notifyScreenTime !== undefined) setNotifyScreenTime(settings.notifyScreenTime);
      if (settings.notifyGoals !== undefined) setNotifyGoals(settings.notifyGoals);
      if (settings.notifySleep !== undefined) setNotifySleep(settings.notifySleep);
      if (settings.notifyMindfulness !== undefined) setNotifyMindfulness(settings.notifyMindfulness);
      if (settings.trackApps !== undefined) setTrackApps(settings.trackApps);
      if (settings.storeHistory !== undefined) setStoreHistory(settings.storeHistory);
      if (settings.theme) setTheme(settings.theme);
      if (settings.accentColor) setAccentColor(settings.accentColor);
      if (settings.dailyScreenLimit) setDailyScreenLimit(settings.dailyScreenLimit);
      if (settings.sleepTarget) setSleepTarget(settings.sleepTarget);
    } catch {}
  }, []);

  // Save settings
  const saveSettings = () => {
    try {
      localStorage.setItem('cw_user_name', displayName);
      localStorage.setItem('cw_user_email', email);
      localStorage.setItem('cw_settings', JSON.stringify({
        notifyScreenTime,
        notifyGoals,
        notifySleep,
        notifyMindfulness,
        trackApps,
        storeHistory,
        theme,
        accentColor,
        dailyScreenLimit,
        sleepTarget,
      }));
    } catch {}
  };

  useEffect(() => {
    saveSettings();
  }, [notifyScreenTime, notifyGoals, notifySleep, notifyMindfulness, trackApps, storeHistory, theme, accentColor, dailyScreenLimit, sleepTarget]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.hash = '#/login';
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8 text-purple-400">Settings</h1>

      {/* Profile Section */}
      <Section title="Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={saveSettings}
              className="w-full bg-[#18181b] border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={saveSettings}
              className="w-full bg-[#18181b] border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>
        </div>
      </Section>

      {/* Notifications Section */}
      <Section title="Notifications">
        <SettingRow label="Screen Time Alerts" description="Get notified when you exceed your daily limit">
          <ToggleSwitch enabled={notifyScreenTime} onChange={setNotifyScreenTime} />
        </SettingRow>
        <SettingRow label="Goal Reminders" description="Daily reminders to complete your goals">
          <ToggleSwitch enabled={notifyGoals} onChange={setNotifyGoals} />
        </SettingRow>
        <SettingRow label="Sleep Reminders" description="Remind you to log sleep and wind down">
          <ToggleSwitch enabled={notifySleep} onChange={setNotifySleep} />
        </SettingRow>
        <SettingRow label="Mindfulness Prompts" description="Periodic prompts to take mindful breaks">
          <ToggleSwitch enabled={notifyMindfulness} onChange={setNotifyMindfulness} />
        </SettingRow>
      </Section>

      {/* Privacy Section */}
      <Section title="Privacy & Data">
        <SettingRow label="Track Application Usage" description="Monitor which apps you use and for how long">
          <ToggleSwitch enabled={trackApps} onChange={setTrackApps} />
        </SettingRow>
        <SettingRow label="Store Usage History" description="Keep historical data for analytics and reports">
          <ToggleSwitch enabled={storeHistory} onChange={setStoreHistory} />
        </SettingRow>
        <SettingRow label="Export Data" description="Download all your data as JSON">
          <button className="px-4 py-2 rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-sm">Export</button>
        </SettingRow>
        <SettingRow label="Clear All Data" description="Permanently delete all local data">
          <button onClick={handleClearData} className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-sm">Clear Data</button>
        </SettingRow>
      </Section>

      {/* Appearance Section */}
      <Section title="Appearance">
        <SettingRow label="Theme" description="Choose your preferred color scheme">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-[#18181b] border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </SettingRow>
        <SettingRow label="Accent Color" description="Primary color for buttons and highlights">
          <div className="flex gap-2">
            {['purple', 'blue', 'green', 'pink', 'orange'].map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${accentColor === color ? 'scale-110 border-white' : 'border-transparent'}`}
                style={{ backgroundColor: { purple: '#8b5cf6', blue: '#3b82f6', green: '#22c55e', pink: '#ec4899', orange: '#f97316' }[color] }}
              />
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Goals & Targets Section */}
      <Section title="Goals & Targets">
        <SettingRow label="Daily Screen Time Limit" description="Target maximum hours per day">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="12"
              value={dailyScreenLimit}
              onChange={(e) => setDailyScreenLimit(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-300 w-12">{dailyScreenLimit}h</span>
          </div>
        </SettingRow>
        <SettingRow label="Sleep Target" description="Recommended hours of sleep per night">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="4"
              max="12"
              value={sleepTarget}
              onChange={(e) => setSleepTarget(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-300 w-12">{sleepTarget}h</span>
          </div>
        </SettingRow>
      </Section>

      {/* Account Section */}
      <Section title="Account">
        <SettingRow label="Sign Out" description="Log out of your account">
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-sm">Sign Out</button>
        </SettingRow>
        <div className="pt-4 text-center">
          <p className="text-xs text-gray-500">CosmicWell v1.0.0</p>
          <p className="text-xs text-gray-600 mt-1">Made with 💜 for your digital wellness</p>
        </div>
      </Section>
    </div>
  );
}
