console.log('--- ELECTRON main.ts file is being read by the compiler ---');
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';

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
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the React development server
  win.loadURL('http://localhost:5173');

  // Wait for the content to finish loading before opening DevTools
  win.webContents.on('did-finish-load', () => {
    win.webContents.openDevTools();
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