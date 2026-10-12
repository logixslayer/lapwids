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
  showWidgetContextMenu: (params) => ipcRenderer.send('show-widget-context-menu', params),
  onWidgetActionDelete: (callback) => {
    const handler = (_event, widgetId) => callback(widgetId);
    ipcRenderer.on('widget-action-delete', handler);
    return () => ipcRenderer.removeListener('widget-action-delete', handler);
  },
  onWidgetActionToggleLock: (callback) => {
    const handler = (_event, widgetId) => callback(widgetId);
    ipcRenderer.on('widget-action-toggle-lock', handler);
    return () => ipcRenderer.removeListener('widget-action-toggle-lock', handler);
  },
  onWidgetActionDuplicate: (callback) => {
    const handler = (_event, widgetId) => callback(widgetId);
    ipcRenderer.on('widget-action-duplicate', handler);
    return () => ipcRenderer.removeListener('widget-action-duplicate', handler);
  },
  onWidgetActionSettings: (callback) => {
    const handler = (_event, widgetId) => callback(widgetId);
    ipcRenderer.on('widget-action-settings', handler);
    return () => ipcRenderer.removeListener('widget-action-settings', handler);
  },
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
  saveMediaImage: (params) => ipcRenderer.invoke('save-media-image', params),
  saveWallpaperImage: (params) => ipcRenderer.invoke('save-wallpaper-image', params),
  saveTemplateAsset: (params) => ipcRenderer.invoke('save-template-asset', params),
  saveBuiltinTemplate: (params) => ipcRenderer.invoke('save-builtin-template', params),
});

