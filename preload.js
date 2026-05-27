const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Allows React to register a callback function when the AI detects a user
  onCustomerUpdate: (callback) => {
    ipcRenderer.on('customer-proximity-update', (_event, value) => callback(value));
  },
  // Clean up listener utility
  removeCustomerListener: () => {
    ipcRenderer.removeAllListeners('customer-proximity-update');
  }
});