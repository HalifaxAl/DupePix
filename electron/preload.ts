import { contextBridge, ipcRenderer } from 'electron';

// Expose a secure API to the renderer process (your React app)
contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory')
});