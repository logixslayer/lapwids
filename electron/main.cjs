const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isPinnedBehind = true;
app.isQuitting = false;

function createDesktopWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  // Use workArea (excludes taskbar) so the auto-hide taskbar trigger zone stays accessible
  const { x, y, width, height } = primaryDisplay.workArea;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    skipTaskbar: true, // Desktop layer stays out of taskbar
    type: process.platform === 'win32' ? 'desktop' : 'normal',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Desktop Pinning: Keep strictly at wallpaper level behind other apps
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isPinnedBehind) {
      mainWindow.setAlwaysOnTop(false);
    }
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  settingsWindow = new BrowserWindow({
    width: Math.min(940, width - 40),
    height: Math.min(680, height - 40),
    minWidth: 780,
    minHeight: 520,
    title: 'LapWids — Settings & Widgets Control Panel',
    frame: true,
    show: true,
    center: true,
    autoHideMenuBar: true,
    backgroundColor: '#111317',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const settingsUrl = `${devUrl}/?mode=settings`;

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    settingsWindow.loadURL(settingsUrl);
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { mode: 'settings' },
    });
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    settingsWindow.focus();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// Window & Widget IPC handlers
ipcMain.on('open-settings', () => {
  createSettingsWindow();
});

ipcMain.on('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
});

ipcMain.on('set-always-on-top', (_event, flag) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (flag) {
      isPinnedBehind = false;
      mainWindow.setAlwaysOnTop(true, 'floating');
    } else {
      mainWindow.setAlwaysOnTop(false);
    }
  }
});

ipcMain.on('pin-to-desktop', (_event, flag) => {
  isPinnedBehind = flag;
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (flag) {
      mainWindow.setAlwaysOnTop(false);
    } else {
      mainWindow.setAlwaysOnTop(true, 'floating');
    }
  }
});

ipcMain.on('set-ignore-mouse-events', (_event, ignore, options) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setIgnoreMouseEvents(ignore, options || { forward: true });
  }
});

ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

ipcMain.on('settings-sync', (event, updatedSettings) => {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents !== event.sender) {
    mainWindow.webContents.send('settings-sync', updatedSettings);
  }
  if (settingsWindow && !settingsWindow.isDestroyed() && settingsWindow.webContents !== event.sender) {
    settingsWindow.webContents.send('settings-sync', updatedSettings);
  }
});

ipcMain.on('widgets-sync', (event, updatedWidgets) => {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents !== event.sender) {
    mainWindow.webContents.send('widgets-sync', updatedWidgets);
  }
  if (settingsWindow && !settingsWindow.isDestroyed() && settingsWindow.webContents !== event.sender) {
    settingsWindow.webContents.send('widgets-sync', updatedWidgets);
  }
});

function createTray() {
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVDhPY/wPBAwUACYGKgFGBmoB/xkZGP4T40eCYQAbBhlg1ABqGQAxBiDFAKkGMP4fZkCMQeM2AADd7x0VzC6BawAAAABJRU5ErkJggg==',
      'base64'
    )
  );

  tray = new Tray(icon);
  tray.setToolTip('LapWids — Click to Open Settings & Widget Controls');

  // Direct Click Action -> Immediately opens the Settings App GUI
  tray.on('click', () => {
    createSettingsWindow();
  });

  tray.on('double-click', () => {
    createSettingsWindow();
  });

  // Right-click action -> also opens Settings or minimal Quit
  tray.on('right-click', () => {
    const rightClickMenu = Menu.buildFromTemplate([
      {
        label: 'Open LapWids Settings...',
        click: () => createSettingsWindow(),
      },
      { type: 'separator' },
      {
        label: 'Quit LapWids',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray.popUpContextMenu(rightClickMenu);
  });
}

app.whenReady().then(() => {
  console.log('[Main] app.whenReady fired');
  try {
    createDesktopWindow();
    console.log('[Main] createDesktopWindow done');
  } catch (e) {
    console.error('[Main] createDesktopWindow error:', e);
  }

  try {
    createTray();
    console.log('[Main] createTray done');
  } catch (e) {
    console.error('[Main] createTray error:', e);
  }

  // Open the Settings App GUI immediately when launching
  try {
    createSettingsWindow();
    console.log('[Main] createSettingsWindow done');
  } catch (e) {
    console.error('[Main] createSettingsWindow error:', e);
  }

  // Shortcut Ctrl+Shift+S or Ctrl+, to toggle Settings App window
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    createSettingsWindow();
  });

  // Shortcut Ctrl+Shift+W to toggle desktop widgets
  globalShortcut.register('CommandOrControl+Shift+W', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      if (isPinnedBehind) mainWindow?.setAlwaysOnTop(false);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createDesktopWindow();
    }
  });
});

// NEVER quit when windows close, keep background desktop engine running
app.on('window-all-closed', (e) => {
  if (!app.isQuitting) {
    e.preventDefault();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
