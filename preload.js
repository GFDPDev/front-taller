// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Solicitar guardar credenciales
  saveCredentials: (data) => ipcRenderer.invoke('save-credentials', data),
  // Solicitar obtener credenciales
  getCredentials: () => ipcRenderer.invoke('get-credentials'),
  // Solicitar borrar credenciales
  deleteCredentials: () => ipcRenderer.invoke('delete-credentials')
});