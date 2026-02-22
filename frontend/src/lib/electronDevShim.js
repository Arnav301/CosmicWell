// electronDevShim.js
// Provides safe no-op/mock implementations of Electron APIs during Vite dev.
// This lets the UI work even when window.electronAPI is not injected by Electron.

(function ensureElectronAPIMock(){
  if (typeof window === 'undefined') return;
  if (window.electronAPI) return; // already provided by Electron

  // Basic in-memory mock state for dev
  let mindfulnessActive = false;
  let goals = [];
  let sleepHistory = [];

  const todayKey = () => new Date().toISOString().slice(0,10);
  const screenHistory = { [todayKey()]: { total: 0, apps: {} } };
  const iconStore = {};
  const apps = {};

  window.electronAPI = {
    // Usage
    async getAppUsage() { return apps; },
    async getLidOpenCount() { return 0; },

    // Mindfulness
    async getMindfulnessData() { return { time: mindfulnessActive ? 120 : 0, isActive: mindfulnessActive }; },
    async toggleMindfulnessSession() { mindfulnessActive = !mindfulnessActive; return mindfulnessActive; },

    // Sleep quick data
    async getSleepData() { return 0; },
    async setSleepData({ bedtime, wakeTime }) { return { ok: true, bedtime, wakeTime }; },

    // Goals
    async getGoals() { return goals; },
    async saveGoals(next) { goals = Array.isArray(next) ? next : []; return { ok: true }; },

    // Screen time history
    async getScreenHistory() { return { history: screenHistory, icons: iconStore }; },

    // Sleep tracker API
    async sleepStatus() { return { isActive: false, start: null, history: sleepHistory }; },
    async sleepStart() { return { started: true }; },
    async sleepStop() { return { stopped: true }; },
    async sleepLogManual({ startISO, endISO }) {
      try {
        const s = new Date(startISO).getTime();
        const e = new Date(endISO).getTime();
        if (!(s && e) || e <= s) return { ok: false };
        const duration = Math.floor((e - s)/1000);
        const id = Math.random().toString(36).slice(2);
        const entry = { id, start: new Date(s).toISOString(), end: new Date(e).toISOString(), duration };
        sleepHistory = [entry, ...sleepHistory];
        const day = new Date(e).toISOString().slice(0,10);
        screenHistory[day] = screenHistory[day] || { total: 0 };
        return { ok: true };
      } catch { return { ok: false }; }
    },
    async sleepDeleteEntry(id) { sleepHistory = sleepHistory.filter(x => x.id !== id); return { ok: true }; },

    // Auth
    async login({ username, password, remember }) {
      if (!username || !password) return { ok: false, message: 'Missing credentials' };
      return { ok: true, user: { id: 'dev-user', name: username, remember: !!remember } };
    },
    async register({ email, username, password }) {
      if (!email || !username || !password) return { ok: false, message: 'Missing fields' };
      return { ok: true, user: { id: 'dev-user', name: username, email } };
    },
  };
})();
