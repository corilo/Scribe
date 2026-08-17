const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fileAPI', {
  open: () => ipcRenderer.invoke('file:open'),
  openPath: (filePath) => ipcRenderer.invoke('file:openPath', { filePath }),
  save: (filePath, content) => ipcRenderer.invoke('file:save', { filePath, content }),
  saveAs: (content, defaultName) => ipcRenderer.invoke('file:saveAs', { content, defaultName }),
  readClipboard: () => ipcRenderer.invoke('clipboard:read'),
  onMenu: (cb) => ipcRenderer.on('menu', (_e, action, payload) => cb(action, payload))
});
