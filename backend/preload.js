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
});

