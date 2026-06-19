import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // During development, pull from the live Vite server
  if (process.env.NODE_ENV == 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools for debugging UI or checking console logs
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('trigger-microphone-capture', (event) => {
    console.log("React informed Electron that speech finished. Initializing voice recorder...");
    if (pythonProcess && !pythonProcess.killed) {
      //
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Listener placeholder for when our Python AI script sends aignals later
ipcMain.on('ia-vision-event', (event, data) => {
  console.log('AI Signal received in Main Process:', data);
  // Forward this event straight to the React frontend
  mainWindow.webContents.send('customer-proximity-update', data);
});