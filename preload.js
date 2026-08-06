const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fileAPI', {
  open: () => ipcRenderer.invoke('file:open'),
  save: (filePath, content) => ipcRenderer.invoke('file:save', { filePath, content }),
  saveAs: (content, defaultName) => ipcRenderer.invoke('file:saveAs', { content, defaultName }),
  onMenu: (cb) => ipcRenderer.on('menu', (_e, action) => cb(action))
});
