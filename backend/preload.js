const { contextBridge, ipcRenderer } = require('electron');

// This creates a secure bridge between your Electron backend and React frontend.
// The frontend can access these functions via `window.electronAPI`.
contextBridge.exposeInMainWorld('electronAPI', {
  // App Usage
  getAppUsage: () => ipcRenderer.invoke('get-app-usage'),
  
  // Lid Open Count
  getLidOpenCount: () => ipcRenderer.invoke('get-lid-open-count'), 
  
  // Mindfulness Session
  toggleMindfulnessSession: () => ipcRenderer.invoke('toggle-mindfulness-session'),
  getMindfulnessData: () => ipcRenderer.invoke('get-mindfulness-data'),

  // Sleep Data
  setSleepData: (data) => ipcRenderer.invoke('set-sleep-data', data),
  getSleepData: () => ipcRenderer.invoke('get-sleep-data'),

  // Daily Goals
  getGoals: () => ipcRenderer.invoke('get-goals'),
  saveGoals: (goals) => ipcRenderer.invoke('save-goals', goals),

  // Sleep Tracker APIs
  sleepStart: () => ipcRenderer.invoke('sleep-start'),
  sleepStop: () => ipcRenderer.invoke('sleep-stop'),
  sleepStatus: () => ipcRenderer.invoke('sleep-status'),
  sleepLogManual: (payload) => ipcRenderer.invoke('sleep-log-manual', payload),
  sleepDeleteEntry: (id) => ipcRenderer.invoke('sleep-delete-entry', id),

  // Mindfulness Media APIs
  mindGetPlaylist: () => ipcRenderer.invoke('mind-get-playlist'),
  mindAddTrack: (payload) => ipcRenderer.invoke('mind-add-track', payload),
  mindRemoveTrack: (id) => ipcRenderer.invoke('mind-remove-track', id),
  mindGetSettings: () => ipcRenderer.invoke('mind-get-settings'),
  mindSetSettings: (settings) => ipcRenderer.invoke('mind-set-settings', settings),

  // Screen Time History
  getScreenHistory: () => ipcRenderer.invoke('get-screen-history'),
  saveScreenHistory: () => ipcRenderer.invoke('save-screen-history'),

  // Auth
  login: (payload) => ipcRenderer.invoke('auth-login', payload),
  register: (payload) => ipcRenderer.invoke('auth-register', payload),
  logout: () => ipcRenderer.invoke('auth-logout'),
});

