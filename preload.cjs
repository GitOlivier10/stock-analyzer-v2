const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App path for data storage
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // File dialogs
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // Message dialogs
  showMessage: (options) => ipcRenderer.invoke('show-message', options),

  // Platform info
  platform: process.platform,

  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});