console.log('--- ELECTRON main.ts file is being read by the compiler ---');
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs'; // Import the Node.js file system module

// --- Optional: Redirect console output to a file ---
// 1. Generate a filename-safe timestamp (e.g., 2025-09-26T18-30-00)
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

// 2. Create the full log file path with the dynamic name
const logFilename = `electron_${timestamp}.log`;
//const logFile = fs.createWriteStream(path.join(__dirname, 'electron.log'), { flags: 'a' });
const logFile = fs.createWriteStream(path.join("/tmp/", logFilename), { flags: 'a' });
const logStdout = process.stdout;

console.log = function (message) {
  logFile.write(new Date().toISOString() + ': ' + message + '\n');
  logStdout.write(new Date().toISOString() + ': ' + message + '\n');
};
// --- End of optional logging setup ---

// Disable GPU Acceleration to prevent common WSL2 errors
app.disableHardwareAcceleration();

// This function handles the API call from the preload script
async function handleDirectoryOpen() {
  console.log('--- dialog:openDirectory called---');  
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select a Directory to Scan for Duplicates',
    properties: ['openDirectory'],
    buttonLabel: 'Include'
  });
  if (!canceled) {
    return filePaths[0];
  }
  return null;
}

function createWindow() {
  console.log('--- createWindow called---');
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // ADD THIS LINE to the existing webPreferences object.
    }
  });

  // Load the React development server
  win.loadURL('http://localhost:5173');

  // If the page loads successfully, open the DevTools.
  win.webContents.on('did-finish-load', () => {
    console.log('--- Page finished loading. Opening DevTools. ---');
    win.webContents.openDevTools();
  });

  // *** THIS IS THE CRITICAL PART ***
  // If the page fails to load, log the error to the terminal.
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`--- Page failed to load: ${errorDescription} (Code: ${errorCode}) ---`);
  });
}

app.whenReady().then(() => {
  // Register the handler that will be called by the preload script
  ipcMain.handle('dialog:openDirectory', handleDirectoryOpen);
  console.log('--- IPC handler for dialog:openDirectory was registered. ---');
  
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