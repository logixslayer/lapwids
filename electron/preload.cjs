const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openSettings: () => ipcRenderer.send('open-settings'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  pinToDesktop: (flag) => ipcRenderer.send('pin-to-desktop', flag),
  setIgnoreMouseEvents: (ignore, forward) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, { forward }),
  quitApp: () => ipcRenderer.send('quit-app'),
  syncSettings: (settings) => ipcRenderer.send('settings-sync', settings),
  onSettingsSync: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('settings-sync', handler);
    return () => ipcRenderer.removeListener('settings-sync', handler);
  },
  syncWidgets: (widgets) => ipcRenderer.send('widgets-sync', widgets),
  onWidgetsSync: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('widgets-sync', handler);
    return () => ipcRenderer.removeListener('widgets-sync', handler);
  },
});

