const { app, BrowserWindow, ipcMain, powerMonitor, nativeTheme, Tray, Menu, nativeImage } = require('electron');
// Load environment variables
try { require('dotenv').config(); } catch {}
// MongoDB client
let MongoClient; try { ({ MongoClient } = require('mongodb')); } catch {}
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs').promises;
const activeWin = require('active-win');

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
let currentDateKey = new Date().toISOString().slice(0,10);
let lastPersistTs = 0;
const isDev = !app.isPackaged;

// --- MongoDB Globals ---
let mongoClient = null;
let mongoDb = null;
let colScreen = null;
let colAppUsage = null;
let colSleep = null;
let colUsers = null;

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'cosmicwell';
const COL_SCREEN = process.env.MONGODB_COLLECTION_SCREEN_TIME || 'screen_time';
const COL_APP = process.env.MONGODB_COLLECTION_APP_USAGE || 'app_usage';
const COL_SLEEP = process.env.MONGODB_COLLECTION_SLEEP || 'sleep_entries';
const COL_USERS = process.env.MONGODB_COLLECTION_USERS || 'users';

async function connectMongo() {
  if (!MongoClient || !MONGODB_URI) return;
  if (mongoClient) return;
  const allowInvalid = String(process.env.MONGODB_TLS_ALLOW_INVALID || '').toLowerCase() === 'true';
  const allowInvalidHost = String(process.env.MONGODB_TLS_ALLOW_INVALID_HOSTNAMES || '').toLowerCase() === 'true';
  const tlsCAFile = process.env.MONGODB_TLS_CA_FILE || undefined; // absolute path to CA bundle if needed
  mongoClient = new MongoClient(MONGODB_URI, {
    ignoreUndefined: true,
    serverSelectionTimeoutMS: 10000,
    directConnection: false,
    tlsAllowInvalidCertificates: allowInvalid,
    tlsAllowInvalidHostnames: allowInvalidHost,
    tlsCAFile,
    serverApi: { version: '1' },
  });
  await mongoClient.connect();
  mongoDb = mongoClient.db(MONGODB_DB);
  colScreen = mongoDb.collection(COL_SCREEN);
  colAppUsage = mongoDb.collection(COL_APP);
  colSleep = mongoDb.collection(COL_SLEEP);
  colUsers = mongoDb.collection(COL_USERS);
}

async function saveScreenToMongo() {
  try {
    if (!colScreen) return;
    const bulk = colScreen.initializeUnorderedBulkOp();
    for (const [day, meta] of Object.entries(screenHistory || {})) {
      bulk.find({ day }).upsert().updateOne({ $set: { day, total: Math.max(0, Number(meta?.total||0)) } });
    }
    if (bulk.s.currentBatch && bulk.s.currentBatch.operations.length > 0) await bulk.execute();
  } catch (e) { /* ignore */ }
}

async function saveAppUsageToMongo() {
  try {
    if (!colAppUsage) return;
    const snapshot = Object.entries(appUsage || {}).map(([name, v]) => ({
      name,
      time: Math.max(0, Number(v?.time||0)),
      icon: v?.icon || null,
    }));
    await colAppUsage.insertOne({ at: new Date(), apps: snapshot });
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

      if (!appUsage[appName]) {
        const icon = await app.getFileIcon(appPath);
        appUsage[appName] = {
          time: 0,
          icon: icon.toDataURL(),
        };
      }
      appUsage[appName].time += 1;


      const todayKey = new Date().toISOString().slice(0,10);
      if (todayKey !== currentDateKey) {
        currentDateKey = todayKey;
      }

      if (!screenHistory[currentDateKey]) screenHistory[currentDateKey] = { total: 0 };
      screenHistory[currentDateKey].total += 1;

      const now = Date.now();
      if (now - lastPersistTs > 60_000 && screenFilePath) {
        lastPersistTs = now;
        // Fire and forget
        saveScreenHistory().catch(() => {});
        // Also persist to Mongo if available
        saveScreenToMongo().catch(()=>{});
        saveAppUsageToMongo().catch(()=>{});
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
    fullscreen: false, // Changed from true to false for debugging
    frame: true,       // Changed from false to true for debugging
    webPreferences: {
      nodeIntegration: false,  // Disable nodeIntegration for security
      contextIsolation: true,  // Enable contextIsolation for security
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,          // Required for some native modules to work
    },
    show: false // Don't show until ready-to-show
  });

  // Show window when ready
  mainWin.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWin.show();
  });

  // Handle page load errors
  mainWin.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', { errorCode, errorDescription });
  });

  mainWin.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
    // Open DevTools to see any errors (temporary for debugging)
    if (!app.isPackaged) {
      mainWin.webContents.openDevTools();
    }
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
    if (!isQuitting) {
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
  usersFilePath = path.join(userDataDir, 'users.json');
  await loadScreenHistory();
  await ensureUsersFile();
  ipcMain.handle('get-screen-history', () => structuredClone(screenHistory));
  ipcMain.handle('save-screen-history', async () => {
    await saveScreenHistory();
    return { ok: true };
  });

  // Connect to MongoDB if configured
  try { await connectMongo(); } catch (e) { console.warn('Mongo connect failed:', e?.message || e); }

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
      saveScreenToMongo().catch(()=>{}),
      saveAppUsageToMongo().catch(()=>{}),
    ]);
  } catch {}
  try { if (mongoClient) await mongoClient.close(); } catch {}
});

