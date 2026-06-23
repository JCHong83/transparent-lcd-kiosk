const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onCustomerUpdate: (callback) => ipcRenderer.on('customer-proximity-update', (_event, value) => callback(value)),
  removeCustomerListener: () => ipcRenderer.removeAllListeners('customer-proximity-update'),
  sendMicrophoneTrigger: () => ipcRenderer.send('trigger-microphone-capture')
});