const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;
let currentLocation = { latitude: 0, longitude: 0 };

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    },
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0f0f1a'
  });

  mainWindow.loadFile('index.html');

  // Auto-grant geolocation permission
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'geolocation') {
      callback(true);
    } else {
      callback(true);
    }
  });
}

// Override geolocation for a webview
async function overrideGeolocation(webContents, latitude, longitude) {
  try {
    await webContents.debugger.attach('1.3');
    await webContents.debugger.sendCommand('Emulation.setGeolocationOverride', {
      latitude: latitude,
      longitude: longitude,
      accuracy: 100
    });
    console.log(`Location set to: ${latitude}, ${longitude}`);
    return true;
  } catch (err) {
    console.error('Failed to override geolocation:', err);
    return false;
  }
}

// IPC handler to set location
ipcMain.handle('set-location', async (event, { latitude, longitude }) => {
  currentLocation = { latitude, longitude };
  
  // Get all webviews and override their location
  const allWebContents = require('electron').webContents.getAllWebContents();
  let success = true;
  
  for (const wc of allWebContents) {
    if (wc.getType() === 'webview') {
      const result = await overrideGeolocation(wc, latitude, longitude);
      if (!result) success = false;
    }
  }
  
  return { success, latitude, longitude };
});

// IPC handler to get current location
ipcMain.handle('get-current-location', () => {
  return currentLocation;
});

// Handle webview creation
app.on('web-contents-created', (event, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('did-finish-load', async () => {
      if (currentLocation.latitude !== 0 || currentLocation.longitude !== 0) {
        await overrideGeolocation(contents, currentLocation.latitude, currentLocation.longitude);
      }
    });
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
