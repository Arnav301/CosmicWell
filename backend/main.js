const { app, BrowserWindow, ipcMain, powerMonitor, nativeTheme, Tray, Menu, nativeImage, globalShortcut } = require('electron');
// Load environment variables
try { require('dotenv').config(); } catch {}
// Supabase client
let createClient; try { ({ createClient } = require('@supabase/supabase-js')); } catch {}
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs').promises;
const activeWin = require('active-win');
const { exec } = require('child_process');

let appUsage = {};
let usersFilePath = '';
let lidOpenCount = 0;
let mindfulnessTime = 0; 
let mindfulnessInterval = null; 
let sleepDuration = 0; 

let goals = [];
let goalsFilePath = '';

let sleepActiveStart = null;
let sleepHistory = [];
let sleepFilePath = '';

let mindfulnessPlaylist = []; 
let mindfulnessSettings = { volume: 0.6, loop: false };
let mindfulnessFilePath = '';

let screenHistory = {};
let screenFilePath = '';
let iconStore = {};
let iconFilePath = '';
let currentDateKey = new Date().toISOString().slice(0,10);
let lastPersistTs = 0;
const isDev = !app.isPackaged;

// --- Focus Mode Lockdown Globals ---
let focusModeActive = false;
let focusModeEndTime = null;
let focusModeTask = '';
let focusAllowedApps = [];
let focusFilePath = '';
let focusEnforcerInterval = null;
let focusBlockedShortcuts = [
  'Alt+F4', 'Alt+Tab', 'CommandOrControl+W', 'CommandOrControl+Q',
  'Alt+Escape', 'CommandOrControl+Alt+Delete', 'Super+D', 'Super+Tab',
  'CommandOrControl+Shift+Escape', 'Alt+Space'
];

// --- Supabase Globals ---
let supabase = null;

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

async function connectSupabase() {
  // Skip Supabase in Electron - auth is handled by the server
  // Personal data (screen time, app usage, sleep) stays local for privacy
  if (!createClient || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('📦 Electron using local storage only (privacy mode)');
    return;
  }
  
  if (supabase) return;
  
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test connection
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      throw error;
    }
    
    console.log('☁️ Electron Supabase sync enabled (optional)');
  } catch (e) {
    // Non-critical - data stays local
    console.log('📦 Cloud sync unavailable - using local storage (this is fine)');
    supabase = null;
  }
}

async function saveScreenToSupabase() {
  try {
    if (!supabase) return;
    for (const [day, meta] of Object.entries(screenHistory || {})) {
      await supabase.from('screen_time').upsert({
        day,
        total: Math.max(0, Number(meta?.total || 0))
      }, { onConflict: 'day' });
    }
  } catch (e) { /* ignore */ }
}

async function saveAppUsageToSupabase() {
  try {
    if (!supabase) return;
    const snapshot = Object.entries(appUsage || {}).map(([name, v]) => ({
      name,
      time: Math.max(0, Number(v?.time || 0)),
      icon: v?.icon || null,
    }));
    await supabase.from('app_usage').insert({
      recorded_at: new Date().toISOString(),
      apps: snapshot
    });
  } catch (e) { /* ignore */ }
}

async function ensureUsersFile(){
  try {
    await fsp.access(usersFilePath);
  } catch {
    await writeUsers([]);
  }
}

async function readUsers(){
  try {
    const buf = await fsp.readFile(usersFilePath, 'utf-8');
    const parsed = JSON.parse(buf || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users){
  const data = JSON.stringify(users, null, 2);
  await fsp.mkdir(path.dirname(usersFilePath), { recursive: true }).catch(()=>{});
  await fsp.writeFile(usersFilePath, data, 'utf-8');
}

function hashPassword(password){
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt){
  try {
    const compare = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(compare, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}


setInterval(async () => {
  try {
    const window = await activeWin();
    if (window && window.owner.name && window.owner.path) {
      const appName = window.owner.name;
      const appPath = window.owner.path;

      // Store icon only the first time this app is ever seen across all history
      if (!iconStore[appName] && iconFilePath) {
        try {
          const icon = await app.getFileIcon(appPath);
          iconStore[appName] = icon.toDataURL();
          saveIcons().catch(() => {});
        } catch {}
      }

      if (!appUsage[appName]) {
        appUsage[appName] = { time: 0, icon: iconStore[appName] || null };
      }
      appUsage[appName].time += 1;
      if (!appUsage[appName].icon && iconStore[appName]) {
        appUsage[appName].icon = iconStore[appName];
      }

      const todayKey = new Date().toISOString().slice(0,10);
      if (todayKey !== currentDateKey) {
        currentDateKey = todayKey;
      }

      if (!screenHistory[currentDateKey]) screenHistory[currentDateKey] = { total: 0, apps: {} };
      if (!screenHistory[currentDateKey].apps) screenHistory[currentDateKey].apps = {};
      screenHistory[currentDateKey].total += 1;
      screenHistory[currentDateKey].apps[appName] = (screenHistory[currentDateKey].apps[appName] || 0) + 1;

      const now = Date.now();
      if (now - lastPersistTs > 60_000 && screenFilePath) {
        lastPersistTs = now;
        // Fire and forget
        saveScreenHistory().catch(() => {});
        // Also persist to Supabase if available
        saveScreenToSupabase().catch(()=>{});
        saveAppUsageToSupabase().catch(()=>{});
      }
    }
  } catch (error) {
     console.error('Error in tracking interval:', error); 
  }
}, 1000);

let mainWin = null;
let loginWin = null;
let tray = null;
let isQuitting = false;

function createLoginWindow() {
  if (loginWin) return loginWin;

  const { screen, BrowserWindow } = require('electron');
  const path = require('path');
  const { workArea } = screen.getPrimaryDisplay();


  const winW = 860;
  const winH = 500;


  const posX = workArea.x + (workArea.width - winW) / 2;
  const posY = workArea.y + (workArea.height - winH) / 2;

  loginWin = new BrowserWindow({
    width: winW,
    height: winH,
    x: posX,
    y: posY,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,               
    transparent: true,          
    alwaysOnTop: false,
    show: false,              
    backgroundColor: '#00000000',
    title: 'Sign in',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });


  if (isDev) {
    loginWin.loadURL('http://localhost:5173/#/login');
  } else {
    const loginPath = path.join(__dirname, '../frontend/dist/index.html');

    loginWin.loadFile(loginPath, { hash: '/login' });
  }


  loginWin.once('ready-to-show', () => {
    loginWin.show();
    loginWin.setOpacity(0);
    let opacity = 0;
    const fade = setInterval(() => {
      opacity += 0.05;
      if (opacity >= 1) {
        opacity = 1;
        clearInterval(fade);
      }
      loginWin.setOpacity(opacity);
    }, 16);
  });


  loginWin.on('closed', () => {
    loginWin = null;
  });

  return loginWin;
}



function createMainWindow() {
  console.log('Creating main window...');
  if (mainWin) {
    console.log('Main window already exists, showing it');
    mainWin.show();
    return mainWin;
  }

  console.log('Creating new BrowserWindow');
  mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: true,       // Show native window frame with min/max/close buttons
    webPreferences: {
      nodeIntegration: false,  // Disable nodeIntegration for security
      contextIsolation: true,  // Enable contextIsolation for security
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,          // Required for some native modules to work
    },
    show: false // Don't show until ready-to-show
  });

  // Show window maximized when ready
  mainWin.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWin.maximize(); // Start maximized
    mainWin.show();
  });

  // Handle page load errors
  mainWin.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', { errorCode, errorDescription });
  });

  mainWin.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
  });

  if (isDev) {
    console.log('Loading development URL: http://localhost:5173');
    mainWin.loadURL('http://localhost:5173').catch(err => {
      console.error('Failed to load dev URL:', err);
    });
  } else {
    console.log('Production mode - loading built files');
    // In production, the dist folder should be copied to the same level as main.js
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    
    console.log(`Loading production build from: ${indexPath}`);
    console.log(`App.isPackaged: ${app.isPackaged}`);
    console.log(`__dirname: ${__dirname}`);
    
    // Check if file exists
    fs.access(indexPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Index file does not exist at: ${indexPath}`);
        console.log('Files in __dirname:', fs.readdirSync(__dirname));
        if (fs.existsSync(path.join(__dirname, 'dist'))) {
          console.log('Files in dist:', fs.readdirSync(path.join(__dirname, 'dist')));
        }
      } else {
        console.log(`Index file exists at: ${indexPath}`);
      }
    });
    
    mainWin.loadFile(indexPath).catch(err => {
      console.error('Failed to load production build:', err);
      // Fallback to showing an error
      mainWin.loadURL(`data:text/html,<h1>Error loading app</h1><p>${err.message}</p>`);
    });
  }
  mainWin.on('close', (e) => {
    if (!isQuitting && mainWin) {
      e.preventDefault();
      mainWin.hide();
      e.returnValue = false;
    }
  });
  mainWin.on('closed', () => { mainWin = null; });
  return mainWin;
}

async function loadGoals() {
  try {
    const data = await fsp.readFile(goalsFilePath, 'utf-8');
    goals = JSON.parse(data);
  } catch (err) {
    goals = [];
  }
}

async function saveGoals(newGoals) {
  goals = Array.isArray(newGoals) ? newGoals : [];
  await fsp.mkdir(path.dirname(goalsFilePath), { recursive: true }).catch(() => {});
  await fsp.writeFile(goalsFilePath, JSON.stringify(goals, null, 2), 'utf-8');
}

async function loadSleep() {
  try {
    const data = await fsp.readFile(sleepFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    sleepActiveStart = parsed.sleepActiveStart || null;
    sleepHistory = Array.isArray(parsed.sleepHistory) ? parsed.sleepHistory : [];
  } catch (err) {
    sleepActiveStart = null;
    sleepHistory = [];
  }
}

async function saveSleep() {
  const payload = { sleepActiveStart, sleepHistory };
  await fsp.mkdir(path.dirname(sleepFilePath), { recursive: true }).catch(() => {});
  await fsp.writeFile(sleepFilePath, JSON.stringify(payload, null, 2), 'utf-8');
}


async function loadMindfulness() {
  try {
    const data = await fsp.readFile(mindfulnessFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    mindfulnessPlaylist = Array.isArray(parsed.playlist) ? parsed.playlist : [];
    mindfulnessSettings = parsed.settings || { volume: 0.6, loop: false };
  } catch (e) {
    mindfulnessPlaylist = [];
    mindfulnessSettings = { volume: 0.6, loop: false };
  }
}

async function saveMindfulness() {
  const payload = { playlist: mindfulnessPlaylist, settings: mindfulnessSettings };
  await fsp.mkdir(path.dirname(mindfulnessFilePath), { recursive: true }).catch(() => {});
  await fsp.writeFile(mindfulnessFilePath, JSON.stringify(payload, null, 2), 'utf-8');
}

// --- Helpers: Load/Save Screen Time History ---
async function loadScreenHistory() {
  try {
    const data = await fsp.readFile(screenFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    screenHistory = parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    screenHistory = {};
  }
  // Ensure today key exists
  if (!screenHistory[currentDateKey]) screenHistory[currentDateKey] = { total: 0 };
}

async function saveScreenHistory() {
  await fsp.mkdir(path.dirname(screenFilePath), { recursive: true }).catch(() => {});
  await fsp.writeFile(screenFilePath, JSON.stringify(screenHistory, null, 2), 'utf-8');
}

async function loadIcons() {
  try {
    const data = await fsp.readFile(iconFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    iconStore = parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    iconStore = {};
  }
}

async function saveIcons() {
  if (!iconFilePath) return;
  await fsp.mkdir(path.dirname(iconFilePath), { recursive: true }).catch(() => {});
  await fsp.writeFile(iconFilePath, JSON.stringify(iconStore), 'utf-8');
}

// --- Focus Mode Lockdown Functions ---
async function loadFocusSettings() {
  try {
    const data = await fsp.readFile(focusFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    focusAllowedApps = Array.isArray(parsed.allowedApps) ? parsed.allowedApps : [];
  } catch (e) {
    focusAllowedApps = [];
  }
}

async function saveFocusSettings() {
  const payload = { allowedApps: focusAllowedApps };
  await fsp.mkdir(path.dirname(focusFilePath), { recursive: true }).catch(() => {});
  await fsp.writeFile(focusFilePath, JSON.stringify(payload, null, 2), 'utf-8');
}

function registerFocusShortcutBlockers() {
  // Block dangerous keyboard shortcuts during focus mode
  focusBlockedShortcuts.forEach(shortcut => {
    try {
      globalShortcut.register(shortcut, () => {
        // Do nothing - block the shortcut
        console.log(`[Focus Mode] Blocked: ${shortcut}`);
        return false;
      });
    } catch (e) {
      // Some shortcuts may not be registerable on all platforms
      console.log(`[Focus Mode] Could not register: ${shortcut}`);
    }
  });
}

function unregisterFocusShortcutBlockers() {
  focusBlockedShortcuts.forEach(shortcut => {
    try {
      globalShortcut.unregister(shortcut);
    } catch {}
  });
}

function startFocusEnforcer() {
  if (focusEnforcerInterval) clearInterval(focusEnforcerInterval);
  
  focusEnforcerInterval = setInterval(async () => {
    if (!focusModeActive) return;
    
    // Check if focus mode should end
    if (focusModeEndTime && Date.now() >= focusModeEndTime) {
      await endFocusMode();
      return;
    }
    
    try {
      const window = await activeWin();
      if (window && window.owner && window.owner.name) {
        const currentApp = window.owner.name.toLowerCase().replace('.exe', '');
        const isCosmicWell = currentApp.includes('cosmicwell') || currentApp.includes('electron');
        
        // Check if current app is allowed
        const isAllowed = focusAllowedApps.some(app => 
          currentApp.includes(app.name.toLowerCase().replace('.exe', ''))
        );
        
        if (!isCosmicWell && !isAllowed) {
          // App is not allowed - minimize it and bring CosmicWell to front
          if (mainWin && !mainWin.isDestroyed()) {
            mainWin.show();
            mainWin.focus();
            mainWin.setAlwaysOnTop(true, 'screen-saver');
            
            // Try to close or minimize the blocked app
            if (process.platform === 'win32') {
              // Minimize the blocked window
              exec(`powershell -Command "(New-Object -ComObject Shell.Application).MinimizeAll()"`, () => {
                setTimeout(() => {
                  if (mainWin && !mainWin.isDestroyed()) {
                    mainWin.show();
                    mainWin.focus();
                  }
                }, 100);
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('[Focus Mode] Enforcer error:', e);
    }
  }, 500);
}

function stopFocusEnforcer() {
  if (focusEnforcerInterval) {
    clearInterval(focusEnforcerInterval);
    focusEnforcerInterval = null;
  }
}

async function startFocusMode(durationMinutes, task, allowedApps = []) {
  if (focusModeActive) return { ok: false, reason: 'already_active' };
  
  focusModeActive = true;
  focusModeEndTime = Date.now() + (durationMinutes * 60 * 1000);
  focusModeTask = task || 'Focus Session';
  focusAllowedApps = allowedApps;
  
  // Make main window fullscreen and always on top
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.setFullScreen(true);
    mainWin.setAlwaysOnTop(true, 'screen-saver');
    mainWin.setClosable(false);
    mainWin.setMinimizable(false);
    
    // Prevent window from being closed
    mainWin.on('close', focusPreventClose);
  }
  
  // Register shortcut blockers
  registerFocusShortcutBlockers();
  
  // Start the enforcer to check active windows
  startFocusEnforcer();
  
  return { 
    ok: true, 
    endTime: focusModeEndTime, 
    task: focusModeTask,
    allowedApps: focusAllowedApps
  };
}

function focusPreventClose(e) {
  if (focusModeActive) {
    e.preventDefault();
    return false;
  }
}

async function endFocusMode() {
  if (!focusModeActive) return { ok: false, reason: 'not_active' };
  
  focusModeActive = false;
  focusModeEndTime = null;
  focusModeTask = '';
  
  // Stop the enforcer
  stopFocusEnforcer();
  
  // Unregister shortcut blockers
  unregisterFocusShortcutBlockers();
  
  // Restore main window
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.setAlwaysOnTop(false);
    mainWin.setFullScreen(false);
    mainWin.setClosable(true);
    mainWin.setMinimizable(true);
    mainWin.removeListener('close', focusPreventClose);
  }
  
  return { ok: true };
}

async function getInstalledApps() {
  return new Promise((resolve) => {
    const apps = [];
    
    if (process.platform === 'win32') {
      // Get apps from Start Menu and common program folders
      const commonPaths = [
        process.env.ProgramFiles,
        process.env['ProgramFiles(x86)'],
        path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
        path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
      ].filter(Boolean);
      
      // Also get recently used apps from appUsage
      Object.keys(appUsage).forEach(appName => {
        if (!apps.some(a => a.name.toLowerCase() === appName.toLowerCase())) {
          apps.push({
            name: appName.replace('.exe', ''),
            icon: appUsage[appName]?.icon || null
          });
        }
      });
      
      // Add some common apps manually
      const commonApps = [
        'Chrome', 'Firefox', 'Edge', 'Brave', 'Safari',
        'Visual Studio Code', 'VS Code', 'Notepad', 'Notepad++',
        'Word', 'Excel', 'PowerPoint', 'Outlook',
        'Spotify', 'Discord', 'Slack', 'Teams', 'Zoom',
        'Terminal', 'PowerShell', 'CMD',
        'File Explorer', 'Calculator', 'Settings'
      ];
      
      commonApps.forEach(appName => {
        if (!apps.some(a => a.name.toLowerCase() === appName.toLowerCase())) {
          apps.push({ name: appName, icon: null });
        }
      });
    }
    
    resolve(apps.sort((a, b) => a.name.localeCompare(b.name)));
  });
}

app.whenReady().then(async () => {
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

  // Sleep Handlers (legacy quick calc)
  ipcMain.handle('set-sleep-data', (event, { bedtime, wakeTime }) => {
    const bed = new Date(`1970-01-01T${bedtime}:00`);
    let wake = new Date(`1970-01-01T${wakeTime}:00`);
    if (wake < bed) {
      wake.setDate(wake.getDate() + 1);
    }
    sleepDuration = (wake - bed) / 1000;
  });

  ipcMain.handle('get-sleep-data', () => sleepDuration);

  // Daily Goals Handlers
  goalsFilePath = path.join(app.getPath('userData'), 'goals.json');
  await loadGoals();
  ipcMain.handle('get-goals', () => structuredClone(goals));
  ipcMain.handle('save-goals', async (event, newGoals) => {
    await saveGoals(newGoals);
    return true;
  });

  // Sleep Tracker Handlers
  sleepFilePath = path.join(app.getPath('userData'), 'sleep.json');
  await loadSleep();
  ipcMain.handle('sleep-start', async () => {
    if (sleepActiveStart) return { started: false, reason: 'already_active', start: sleepActiveStart };
    sleepActiveStart = new Date().toISOString();
    await saveSleep();
    return { started: true, start: sleepActiveStart };
  });
  ipcMain.handle('sleep-stop', async () => {
    if (!sleepActiveStart) return { stopped: false, reason: 'not_active' };
    const start = new Date(sleepActiveStart);
    const end = new Date();
    const duration = Math.max(0, Math.floor((end - start) / 1000));
    const entry = { id: `${start.getTime()}-${end.getTime()}`, start: start.toISOString(), end: end.toISOString(), duration };
    sleepHistory.unshift(entry);
    sleepActiveStart = null;
    await saveSleep();
    return { stopped: true, entry };
  });
  ipcMain.handle('sleep-status', () => ({ isActive: !!sleepActiveStart, start: sleepActiveStart, history: sleepHistory.slice(0, 100) }));
  ipcMain.handle('sleep-log-manual', async (event, { startISO, endISO }) => {
    try {
      const start = new Date(startISO);
      const end = new Date(endISO);
      if (isNaN(start) || isNaN(end) || end <= start) throw new Error('invalid_range');
      const duration = Math.max(0, Math.floor((end - start) / 1000));
      const entry = { id: `${start.getTime()}-${end.getTime()}`, start: start.toISOString(), end: end.toISOString(), duration };
      sleepHistory.unshift(entry);
      await saveSleep();
      return { ok: true, entry };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  ipcMain.handle('sleep-delete-entry', async (event, id) => {
    const before = sleepHistory.length;
    sleepHistory = sleepHistory.filter(e => e.id !== id);
    await saveSleep();
    return { ok: true, deleted: before - sleepHistory.length };
  });

  // Mindfulness media handlers
  mindfulnessFilePath = path.join(app.getPath('userData'), 'mindfulness.json');
  await loadMindfulness();
  ipcMain.handle('mind-get-playlist', () => structuredClone(mindfulnessPlaylist));
  ipcMain.handle('mind-add-track', async (event, { url, title }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    mindfulnessPlaylist.push({ id, url, title: title || url });
    await saveMindfulness();
    return { ok: true, id };
  });
  ipcMain.handle('mind-remove-track', async (event, id) => {
    const before = mindfulnessPlaylist.length;
    mindfulnessPlaylist = mindfulnessPlaylist.filter(t => t.id !== id);
    await saveMindfulness();
    return { ok: true, deleted: before - mindfulnessPlaylist.length };
  });
  ipcMain.handle('mind-get-settings', () => structuredClone(mindfulnessSettings));
  ipcMain.handle('mind-set-settings', async (event, settings) => {
    mindfulnessSettings = { ...mindfulnessSettings, ...settings };
    await saveMindfulness();
    return { ok: true };
  });

  // Screen Time History Handlers
  const userDataDir = app.getPath('userData');
  screenFilePath = path.join(userDataDir, 'screen-time.json');
  iconFilePath = path.join(userDataDir, 'app-icons.json');
  usersFilePath = path.join(userDataDir, 'users.json');
  await loadScreenHistory();
  await loadIcons();
  await ensureUsersFile();
  ipcMain.handle('get-screen-history', () => ({
    history: structuredClone(screenHistory),
    icons: structuredClone(iconStore)
  }));
  ipcMain.handle('save-screen-history', async () => {
    await saveScreenHistory();
    return { ok: true };
  });

  // Focus Mode Lockdown Handlers
  focusFilePath = path.join(app.getPath('userData'), 'focus-settings.json');
  await loadFocusSettings();
  
  ipcMain.handle('focus-start', async (event, { duration, task, allowedApps }) => {
    return await startFocusMode(duration, task, allowedApps || []);
  });
  
  ipcMain.handle('focus-end', async () => {
    return await endFocusMode();
  });
  
  ipcMain.handle('focus-status', () => ({
    isActive: focusModeActive,
    endTime: focusModeEndTime,
    task: focusModeTask,
    timeRemaining: focusModeEndTime ? Math.max(0, focusModeEndTime - Date.now()) : 0,
    allowedApps: focusAllowedApps
  }));
  
  ipcMain.handle('focus-get-allowed-apps', () => structuredClone(focusAllowedApps));
  
  ipcMain.handle('focus-save-allowed-apps', async (event, apps) => {
    focusAllowedApps = Array.isArray(apps) ? apps : [];
    await saveFocusSettings();
    return { ok: true };
  });
  
  ipcMain.handle('focus-get-installed-apps', async () => {
    return await getInstalledApps();
  });

  // Connect to Supabase for optional cloud sync (non-critical)
  await connectSupabase();

  // Auto-start on login and start hidden
  try {
    app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
  } catch {}

  // Create system tray (use app executable icon for Windows)
  try {
    const exeIcon = await app.getFileIcon(process.execPath).catch(()=>null);
    const img = exeIcon || nativeImage.createEmpty();
    tray = new Tray(img);
    tray.setToolTip('CosmicWell');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Dashboard',
        click: () => {
          if (!mainWin) createMainWindow();
          if (mainWin) { mainWin.show(); mainWin.focus(); }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit', click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (!mainWin) createMainWindow();
      if (mainWin) { mainWin.show(); mainWin.focus(); }
    });
  } catch (e) {
    console.warn('Tray failed:', e?.message || e);
  }

  // Auth IPC: mock validate and open main window
  ipcMain.handle('auth-login', async (event, { username, password }) => {
    try {
      const users = await readUsers();
      const identifier = String(username || '').trim();
      const pwd = String(password || '');
      if (!identifier || !pwd) return { ok: false, message: 'Username/email and password are required.' };
      // find by username or email
      const user = users.find(u => u.username.toLowerCase() === identifier.toLowerCase() || u.email?.toLowerCase() === identifier.toLowerCase());
      if (!user) return { ok: false, message: 'Account not found.' };
      const valid = verifyPassword(pwd, user.hash, user.salt);
      if (!valid) return { ok: false, message: 'Invalid password.' };
      createMainWindow();
      if (loginWin) loginWin.close();
      return { ok: true, user: { name: user.username, email: user.email } };
    } catch (e) {
      return { ok: false, message: 'Login error' };
    }
  });
  ipcMain.handle('auth-register', async (event, { email, username, password }) => {
    try {
      const users = await readUsers();
      const usr = String(username || '').trim();
      const mail = String(email || '').trim();
      const pwd = String(password || '');
      if (!usr || !mail || !pwd) return { ok: false, message: 'All fields are required.' };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return { ok: false, message: 'Invalid email.' };
      const exists = users.find(u => u.username.toLowerCase() === usr.toLowerCase() || u.email.toLowerCase() === mail.toLowerCase());
      if (exists) return { ok: false, message: 'User or email already exists.' };
      const { hash, salt } = hashPassword(pwd);
      const newUser = { id: crypto.randomUUID(), username: usr, email: mail, hash, salt, createdAt: Date.now() };
      users.push(newUser);
      await writeUsers(users);
      createMainWindow();
      if (loginWin) loginWin.close();
      return { ok: true, user: { name: usr, email: mail } };
    } catch (e) {
      return { ok: false, message: 'Registration error' };
    }
  });

  // Logout: return to compact login window
  ipcMain.handle('auth-logout', async () => {
    try {
      if (mainWin) {
        const w = mainWin; mainWin = null;
        try { w.close(); } catch {}
      }
      createLoginWindow();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.message || 'failed' };
    }
  });

  // Start with login window
  createLoginWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (mainWin) createMainWindow(); else createLoginWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  // Keep running in background unless user explicitly quits from tray
  // On macOS default is to keep app running; on Windows we also keep it alive
});

app.on('quit', async () => {
  try {
    await Promise.all([
      saveScreenToSupabase().catch(()=>{}),
      saveAppUsageToSupabase().catch(()=>{}),
    ]);
  } catch {}
});

