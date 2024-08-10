const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  executeNodeCode: () => ipcRenderer.invoke('execute-node-code'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  toggleMaximizeWindow: () => ipcRenderer.send('toggle-maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  playGame: () => ipcRenderer.invoke('play-game'),
  on: (eventName, callback) => ipcRenderer.on(eventName, callback),
  onUpdateButtonText: (callback) => ipcRenderer.on('update-button-text', callback),
  uninstallClick: () => ipcRenderer.invoke('uninstallClick'),
  unir: (channel, callback) => {ipcRenderer.on(channel, callback)}
});