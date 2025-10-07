const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron');
const path = require('path');
const activeWin = require('active-win');

let appUsage = {};
let lidOpenCount = 0;
let mindfulnessTime = 0; // In seconds
let mindfulnessInterval = null; // To hold the interval ID
let sleepDuration = 0; // In seconds

// --- App Usage Tracking Logic ---
setInterval(async () => {
  try {
    const window = await activeWin();
    if (window && window.owner.name && window.owner.path) {
      const appName = window.owner.name;
      const appPath = window.owner.path;

      if (!appUsage[appName]) {
        const icon = await app.getFileIcon(appPath);
        appUsage[appName] = {
          time: 0,
          icon: icon.toDataURL(),
        };
      }
      appUsage[appName].time += 1;
    }
  } catch (error) {
    // console.error('Error in tracking interval:', error); 
  }
}, 1000);

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  powerMonitor.on('resume', () => {
    lidOpenCount++;
  });

  // --- IPC Handlers for ALL Features ---

  ipcMain.handle('get-app-usage', () => structuredClone(appUsage));
  ipcMain.handle('get-lid-open-count', () => lidOpenCount);

  // Mindfulness Handlers
  ipcMain.handle('toggle-mindfulness-session', () => {
    if (mindfulnessInterval) {
      clearInterval(mindfulnessInterval);
      mindfulnessInterval = null;
      return false; // Session is now inactive
    } else {
      mindfulnessInterval = setInterval(() => {
        mindfulnessTime++;
      }, 1000);
      return true; // Session is now active
    }
  });

  ipcMain.handle('get-mindfulness-data', () => ({
    time: mindfulnessTime,
    isActive: !!mindfulnessInterval,
  }));

  // Sleep Handlers
  ipcMain.handle('set-sleep-data', (event, { bedtime, wakeTime }) => {
    const bed = new Date(`1970-01-01T${bedtime}:00`);
    let wake = new Date(`1970-01-01T${wakeTime}:00`);
    if (wake < bed) {
      wake.setDate(wake.getDate() + 1);
    }
    sleepDuration = (wake - bed) / 1000;
  });

  ipcMain.handle('get-sleep-data', () => sleepDuration);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

