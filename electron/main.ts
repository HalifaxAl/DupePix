console.log('--- ELECTRON main.ts file is being read by the compiler ---');
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';

// This function handles the API call from the preload script
async function handleDirectoryOpen() {
  console.log('--- handleDirectoryOpen function was called! ---'); // ADD THIS LINE
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (!canceled) {
    return filePaths[0];
  }
  return null;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // The preload script is essential for the API bridge to work
      preload: path.join(__dirname, 'preload.js') // Note: it points to the compiled .js file
    }
  });

  // Load the React development server
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  // Register the handler that will be called by the preload script
  ipcMain.handle('dialog:openDirectory', handleDirectoryOpen);
  console.log('--- IPC handler for dialog:openDirectory was registered. ---'); // ADD THIS LINE
  
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