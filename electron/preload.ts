import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openSettings: () => ipcRenderer.send('open-settings'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('set-always-on-top', flag),
  pinToDesktop: (flag: boolean) => ipcRenderer.send('pin-to-desktop', flag),
  setIgnoreMouseEvents: (ignore: boolean, forward: boolean) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, { forward }),
  quitApp: () => ipcRenderer.send('quit-app'),
});
