import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let pythonProcess = null; // 2. CREATE A GLOBAL REFERENCE FOR PYTHON

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 1920,
    // fullscreen: true,
    // autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
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

  // ==========================================
  // 3. START THE PYTHON MASTER AI SCRIPT
  // ==========================================
  // Adjust this path if detect.py is in a different folder relative to electron.js!
  const pythonScriptPath = path.join(__dirname, '/python-vision/detect.py'); 
  
  const venvPythonPath = path.join(__dirname, '/python-vision/venv/bin/python');

  // NOTE: If you are using a virtual environment, you might need to point 
  // to '../python-vision/venv/bin/python' instead of just 'python'
  pythonProcess = spawn(venvPythonPath, [pythonScriptPath]);

  // Listen to Python's standard output
  const rl = readline.createInterface({
    input: pythonProcess.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const rawString = line.trim();
    if (!rawString) return;

    try {
      // Try to parse the incoming line as JSON
      const payload = JSON.parse(rawString);
      
      // If successful, beam it straight to the React frontend!
      if (mainWindow) {
        mainWindow.webContents.send('customer-proximity-update', payload);
      }

      // THE TWO-WAY HANDSHAKE
      // Only send READY if it was actually a valid JSON payload
      if (pythonProcess && !pythonProcess.killed) {
        pythonProcess.stdin.write("READY\n");
      }

    } catch (e) {
      // It's not JSON (like the Whisper Rocket emoji log). Just print it safely!
      console.log("Python Log:", rawString);
    }
  });

  // Listen to Python's error channel (sys.stderr outputs go here)
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python System: ${data.toString().trim()}`);
  });

  // ==========================================

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('trigger-microphone-capture', (event) => {
    console.log("React informed Electron that speech finished. Initializing voice recorder...");
    if (pythonProcess && !pythonProcess.killed) {
      // Send a signal back to Python if needed later
    }
  });
});

// Cleanly kill the Python process when the app closes
app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});