const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  minimizeWindow: () => ipcRenderer.send('minimize-windowD'),
  toggleMaximizeWindow: () => ipcRenderer.send('toggle-maximize-windowD'),
  closeWindow: () => ipcRenderer.send('close-windowD')
});