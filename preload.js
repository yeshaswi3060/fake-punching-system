const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('locationAPI', {
    setLocation: (latitude, longitude) =>
        ipcRenderer.invoke('set-location', { latitude, longitude }),

    getCurrentLocation: () =>
        ipcRenderer.invoke('get-current-location')
});
