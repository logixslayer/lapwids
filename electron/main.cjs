const { app, BrowserWindow, ipcMain, screen, Tray, Menu, MenuItem, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// Single-instance lock to ensure only one instance runs
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  // If user tries to launch a second instance, bring Settings / Main window to focus!
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.show();
    settingsWindow.focus();
  } else {
    createSettingsWindow();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
  }
});

// Check startup launch flag (e.g., Windows system startup with --hidden / --startup or openAtLogin)
const isStartupLaunch = process.argv.includes('--hidden') || 
                        process.argv.includes('--startup') || 
                        app.getLoginItemSettings().wasOpenedAtLogin;

let koffi = null;
let SetWindowPos = null;
try {
  koffi = require('koffi');
  const user32 = koffi.load('user32.dll');
  SetWindowPos = user32.func('bool __stdcall SetWindowPos(uintptr_t hWnd, uintptr_t hWndInsertAfter, int X, int Y, int cx, int cy, uint32_t uFlags)');
} catch (e) {
  console.warn('[Main] Koffi user32 SetWindowPos not available:', e.message);
}

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isPinnedBehind = true;
app.isQuitting = false;

// Windows HWND constants
const HWND_BOTTOM = 1;
const SWP_NOSIZE = 0x0001;
const SWP_NOMOVE = 0x0002;
const SWP_NOACTIVATE = 0x0010;

function sendToDesktopBottom(win) {
  if (!win || win.isDestroyed()) return;
  try {
    if (process.platform === 'win32' && SetWindowPos) {
      const handleBuf = win.getNativeWindowHandle();
      let hWndVal = 0n;
      if (handleBuf.length === 8) {
        hWndVal = handleBuf.readBigUInt64LE(0);
      } else if (handleBuf.length === 4) {
        hWndVal = BigInt(handleBuf.readUInt32LE(0));
      }
      if (hWndVal) {
        SetWindowPos(hWndVal, 1n, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
      }
    }
  } catch (err) {
    console.error('sendToDesktopBottom error:', err);
  }
}

function createDesktopWindow(startHidden = false) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.workArea;

  // Leave 2px at the bottom edge so Windows shell auto-hide taskbar sensor always detects mouse hover
  const winHeight = process.platform === 'win32' ? Math.max(height - 2, 100) : height;

  mainWindow = new BrowserWindow({
    width: width,
    height: winHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    show: false,
    skipTaskbar: true,
    focusable: true,
    type: process.platform === 'win32' ? 'desktop' : 'normal',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });

  const fs = require('fs');
  const distHtmlPath = path.join(__dirname, '../dist/index.html');
  const hasDist = fs.existsSync(distHtmlPath);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(distHtmlPath);
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[Main] mainWindow did-fail-load:', errorCode, errorDescription, validatedURL);
    if (hasDist && validatedURL?.includes('localhost:5173')) {
      console.log('[Main] Falling back mainWindow to dist/index.html');
      mainWindow.loadFile(distHtmlPath);
    }
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer mainWindow] ${message} (${sourceId}:${line})`);
  });

  // Handle Ctrl+Plus, Ctrl+=, Ctrl+Minus, Ctrl+0 zoom shortcuts reliably
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && (input.control || input.meta)) {
      if (input.key === '=' || input.key === '+' || input.code === 'NumpadAdd' || input.code === 'Equal') {
        event.preventDefault();
        const currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.setZoomFactor(Math.min(currentZoom + 0.1, 3.0));
      } else if (input.key === '-' || input.key === '_' || input.code === 'NumpadSubtract' || input.code === 'Minus') {
        event.preventDefault();
        const currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.setZoomFactor(Math.max(currentZoom - 0.1, 0.3));
      } else if (input.key === '0' || input.code === 'Numpad0' || input.code === 'Digit0') {
        event.preventDefault();
        mainWindow.webContents.setZoomFactor(1.0);
      }
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (!startHidden) {
      mainWindow.show();
      if (isPinnedBehind) {
        mainWindow.setAlwaysOnTop(false);
        sendToDesktopBottom(mainWindow);
      }
    }
  });

  // When focused or clicked, force it to stay in the bottom desktop layer
  mainWindow.on('focus', () => {
    if (isPinnedBehind) {
      mainWindow.setAlwaysOnTop(false);
      sendToDesktopBottom(mainWindow);
    }
  });

  mainWindow.on('show', () => {
    if (isPinnedBehind) {
      mainWindow.setAlwaysOnTop(false);
      sendToDesktopBottom(mainWindow);
    }
  });

  // Periodic safety check to ensure window never rises above normal windows
  const bottomInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed() && isPinnedBehind && mainWindow.isVisible()) {
      sendToDesktopBottom(mainWindow);
    }
  }, 1000);

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    clearInterval(bottomInterval);
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
    width: Math.min(1080, width - 40),
    height: Math.min(750, height - 40),
    minWidth: 840,
    minHeight: 560,
    title: 'LapWids – Settings & Widgets Control Panel',
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

  const distHtmlPath = path.join(__dirname, '../dist/index.html');

  if (process.env.VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/?mode=settings`);
  } else if (!app.isPackaged) {
    settingsWindow.loadURL('http://localhost:5173/?mode=settings');
  } else {
    settingsWindow.loadFile(distHtmlPath, {
      query: { mode: 'settings' },
    });
  }

  settingsWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[Main] settingsWindow did-fail-load:', errorCode, errorDescription, validatedURL);
    if (fs.existsSync(distHtmlPath) && validatedURL?.includes('localhost:5173')) {
      console.log('[Main] Falling back settingsWindow to dist/index.html');
      settingsWindow.loadFile(distHtmlPath, { query: { mode: 'settings' } });
    }
  });

  settingsWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer settingsWindow] ${message} (${sourceId}:${line})`);
  });

  // Handle Ctrl+Plus, Ctrl+=, Ctrl+Minus, Ctrl+0 zoom shortcuts reliably
  settingsWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && (input.control || input.meta)) {
      if (input.key === '=' || input.key === '+' || input.code === 'NumpadAdd' || input.code === 'Equal') {
        event.preventDefault();
        const currentZoom = settingsWindow.webContents.getZoomFactor();
        settingsWindow.webContents.setZoomFactor(Math.min(currentZoom + 0.1, 3.0));
      } else if (input.key === '-' || input.key === '_' || input.code === 'NumpadSubtract' || input.code === 'Minus') {
        event.preventDefault();
        const currentZoom = settingsWindow.webContents.getZoomFactor();
        settingsWindow.webContents.setZoomFactor(Math.max(currentZoom - 0.1, 0.3));
      } else if (input.key === '0' || input.code === 'Numpad0' || input.code === 'Digit0') {
        event.preventDefault();
        settingsWindow.webContents.setZoomFactor(1.0);
      }
    }
  });

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
      sendToDesktopBottom(mainWindow);
    }
  }
});

ipcMain.on('pin-to-desktop', (_event, flag) => {
  isPinnedBehind = flag;
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (flag) {
      mainWindow.setAlwaysOnTop(false);
      sendToDesktopBottom(mainWindow);
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

// Auto-launch on Windows system startup
function setAutoLaunch(enabled) {
  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
      args: ['--hidden', '--startup'],
    });
  } else {
    // In dev mode
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
      path: process.execPath,
      args: [path.resolve(__dirname, 'main.cjs'), '--hidden', '--startup'],
    });
  }
}

function getAutoLaunch() {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
}

// Auto-Launch IPC handlers
ipcMain.handle('get-auto-launch', () => {
  return getAutoLaunch();
});

ipcMain.handle('set-auto-launch', (_event, enabled) => {
  setAutoLaunch(enabled);
  return getAutoLaunch();
});

// Save media image into public/media/ (and dist/media/) so it is permanently bundled for all users
ipcMain.handle('save-media-image', async (_event, { fileName, dataUrl }) => {
  try {
    const publicMediaDir = path.join(__dirname, '../public/media');
    const distMediaDir = path.join(__dirname, '../dist/media');
    if (!fs.existsSync(publicMediaDir)) {
      fs.mkdirSync(publicMediaDir, { recursive: true });
    }
    if (!fs.existsSync(distMediaDir)) {
      fs.mkdirSync(distMediaDir, { recursive: true });
    }

    // Clean filename
    const safeName = (fileName || `media_${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath = path.join(publicMediaDir, safeName);
    const distDestPath = path.join(distMediaDir, safeName);

    // If dataUrl provided, write buffer
    if (dataUrl && dataUrl.includes('base64,')) {
      const base64Data = dataUrl.split('base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(destPath, buffer);
      try {
        fs.writeFileSync(distDestPath, buffer);
      } catch (err) {
        // ignore if dist not writable
      }
    }

    // Return the relative public path usable anywhere
    return {
      success: true,
      url: `/media/${safeName}`,
    };
  } catch (err) {
    console.error('save-media-image error:', err);
    return { success: false, error: err.message };
  }
});

// Save wallpaper image into public/wallpapers/ (and dist/wallpapers/)
ipcMain.handle('save-wallpaper-image', async (_event, { fileName, dataUrl }) => {
  try {
    const publicWpDir = path.join(__dirname, '../public/wallpapers');
    const distWpDir = path.join(__dirname, '../dist/wallpapers');
    if (!fs.existsSync(publicWpDir)) {
      fs.mkdirSync(publicWpDir, { recursive: true });
    }
    if (!fs.existsSync(distWpDir)) {
      fs.mkdirSync(distWpDir, { recursive: true });
    }

    const safeName = (fileName || `wallpaper_${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath = path.join(publicWpDir, safeName);
    const distDestPath = path.join(distWpDir, safeName);

    if (dataUrl && dataUrl.includes('base64,')) {
      const base64Data = dataUrl.split('base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(destPath, buffer);
      try {
        fs.writeFileSync(distDestPath, buffer);
      } catch (err) {
        // ignore
      }
    }

    return {
      success: true,
      url: `/wallpapers/${safeName}`,
    };
  } catch (err) {
    console.error('save-wallpaper-image error:', err);
    return { success: false, error: err.message };
  }
});

// Save template media/wallpaper asset into public/templates/ (and dist/templates/)
ipcMain.handle('save-template-asset', async (_event, { fileName, dataUrl }) => {
  try {
    const publicTemplatesDir = path.join(__dirname, '../public/templates');
    const distTemplatesDir = path.join(__dirname, '../dist/templates');
    if (!fs.existsSync(publicTemplatesDir)) {
      fs.mkdirSync(publicTemplatesDir, { recursive: true });
    }
    if (!fs.existsSync(distTemplatesDir)) {
      fs.mkdirSync(distTemplatesDir, { recursive: true });
    }

    const safeName = (fileName || `asset_${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath = path.join(publicTemplatesDir, safeName);
    const distDestPath = path.join(distTemplatesDir, safeName);

    if (dataUrl && dataUrl.includes('base64,')) {
      const base64Data = dataUrl.split('base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(destPath, buffer);
      try {
        fs.writeFileSync(distDestPath, buffer);
      } catch (err) {
        // ignore
      }
    }

    return {
      success: true,
      url: `/templates/${safeName}`,
    };
  } catch (err) {
    console.error('save-template-asset error:', err);
    return { success: false, error: err.message };
  }
});

// Append a template directly to src/data/templates.ts if running in dev mode
ipcMain.handle('save-builtin-template', async (_event, templateData) => {
  try {
    const templatesFilePath = path.join(__dirname, '../src/data/templates.ts');
    if (!fs.existsSync(templatesFilePath)) {
      return { success: false, error: 'templates.ts file not found' };
    }

    let fileContent = fs.readFileSync(templatesFilePath, 'utf8');

    // Find BUILTIN_TEMPLATES array and append or replace if id matches
    const jsonStr = JSON.stringify(templateData, null, 2);
    // Format JSON slightly to match TypeScript aesthetics
    const formattedObject = jsonStr.replace(/"([^"]+)":/g, '$1:');

    // Find closing bracket of BUILTIN_TEMPLATES = [ ... ];
    const marker = 'export const BUILTIN_TEMPLATES: DesktopTemplate[] = [';
    const markerIdx = fileContent.indexOf(marker);
    if (markerIdx === -1) {
      return { success: false, error: 'BUILTIN_TEMPLATES marker not found in templates.ts' };
    }

    // Insert new template right after marker
    const insertIdx = markerIdx + marker.length;
    const newContent = 
      fileContent.slice(0, insertIdx) +
      '\n  ' + formattedObject + ',' +
      fileContent.slice(insertIdx);

    fs.writeFileSync(templatesFilePath, newContent, 'utf8');
    return { success: true };
  } catch (err) {
    console.error('save-builtin-template error:', err);
    return { success: false, error: err.message };
  }
});

// Native Windows Context Menu for Widgets
ipcMain.on('show-widget-context-menu', (event, { widgetId, isLocked }) => {
  const isLaunchAtStartup = getAutoLaunch();
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: 'Widget Settings',
      click: () => {
        event.sender.send('widget-action-settings', widgetId);
      },
    })
  );

  menu.append(
    new MenuItem({
      label: isLocked ? 'Unlock Widget' : 'Lock Widget',
      click: () => {
        event.sender.send('widget-action-toggle-lock', widgetId);
      },
    })
  );

  menu.append(
    new MenuItem({
      label: 'Open Settings & Control Panel',
      click: () => {
        createSettingsWindow();
      },
    })
  );

  menu.append(
    new MenuItem({
      label: 'Duplicate Widget',
      click: () => {
        event.sender.send('widget-action-duplicate', widgetId);
      },
    })
  );

  menu.append(new MenuItem({ type: 'separator' }));

  menu.append(
    new MenuItem({
      label: mainWindow?.isVisible() ? 'Hide Desktop Widgets' : 'Show Desktop Widgets',
      click: () => {
        toggleDesktopWidgets();
      },
    })
  );

  menu.append(
    new MenuItem({
      label: 'Launch at System Startup',
      type: 'checkbox',
      checked: isLaunchAtStartup,
      click: (item) => {
        setAutoLaunch(item.checked);
      },
    })
  );

  menu.append(new MenuItem({ type: 'separator' }));

  menu.append(
    new MenuItem({
      label: 'Delete Widget',
      click: () => {
        event.sender.send('widget-action-delete', widgetId);
      },
    })
  );

  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

function toggleDesktopWidgets() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createDesktopWindow(false);
    return;
  }
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    if (isPinnedBehind) {
      mainWindow.setAlwaysOnTop(false);
      sendToDesktopBottom(mainWindow);
    }
  }
}

function createTray() {
  const fs = require('fs');
  let icon = null;
  const candidateIconPaths = [
    path.join(__dirname, '../build/tray-icon.ico'),
    path.join(__dirname, '../build/tray-icon-16.png'),
    path.join(__dirname, '../build/icon.ico'),
    path.join(process.resourcesPath || '', 'build/tray-icon.ico'),
    path.join(process.resourcesPath || '', 'build/icon.ico'),
  ];

  for (const candidate of candidateIconPaths) {
    try {
      if (fs.existsSync(candidate)) {
        const img = nativeImage.createFromPath(candidate);
        if (!img.isEmpty()) {
          icon = img;
          break;
        }
      }
    } catch {}
  }

  if (!icon || icon.isEmpty()) {
    icon = nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVDhPY/wPBAwUACYGKgFGBmoB/xkZGP4T40eCYQAbBhlg1ABqGQAxBiDFAKkGMP4fZkCMQeM2AADd7x0VzC6BawAAAABJRU5ErkJggg==',
        'base64'
      )
    );
  }

  try {
    tray = new Tray(icon);
    tray.setToolTip('LapWids – Desktop Widgets (Running in Tray)');
  } catch (err) {
    console.error('Tray initialization error:', err);
    return;
  }

  tray.on('click', () => {
    // Left click opens settings & controls panel
    createSettingsWindow();
  });

  tray.on('double-click', () => {
    // Double click toggles desktop widgets visibility
    toggleDesktopWidgets();
  });

  tray.on('right-click', () => {
    const isLaunchAtStartup = getAutoLaunch();
    const rightClickMenu = Menu.buildFromTemplate([
      {
        label: 'Open Settings & Control Panel',
        click: () => createSettingsWindow(),
      },
      {
        label: mainWindow?.isVisible() ? 'Hide Desktop Widgets' : 'Show Desktop Widgets',
        click: () => toggleDesktopWidgets(),
      },
      { type: 'separator' },
      {
        label: 'Launch at System Startup',
        type: 'checkbox',
        checked: isLaunchAtStartup,
        click: (item) => {
          setAutoLaunch(item.checked);
        },
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

// When a second instance is launched by the user, show settings window or widgets
app.on('second-instance', () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.show();
    settingsWindow.focus();
  } else {
    createSettingsWindow();
  }
});

app.whenReady().then(() => {
  console.log('[Main] app.whenReady fired, isStartupLaunch:', isStartupLaunch);

  // Set default auto-launch on Windows production build if not configured yet
  try {
    const loginSettings = app.getLoginItemSettings();
    if (app.isPackaged && !loginSettings.openAtLogin) {
      setAutoLaunch(true);
    }
  } catch (err) {
    console.warn('Initial auto launch check warning:', err);
  }

  try {
    createTray();
    console.log('[Main] createTray done');
  } catch (e) {
    console.error('[Main] createTray error:', e);
  }

  try {
    // If launched at system startup with --hidden / --startup / wasOpenedAtLogin, start hidden in tray!
    // mainWindow is created hidden without showing on desktop or taskbar
    createDesktopWindow(isStartupLaunch);
    console.log('[Main] createDesktopWindow done (hidden:', isStartupLaunch, ')');
  } catch (e) {
    console.error('[Main] createDesktopWindow error:', e);
  }

  // Only open Settings window if it was NOT a system startup launch
  if (!isStartupLaunch) {
    try {
      createSettingsWindow();
      console.log('[Main] createSettingsWindow done');
    } catch (e) {
      console.error('[Main] createSettingsWindow error:', e);
    }
  }

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    createSettingsWindow();
  });

  globalShortcut.register('CommandOrControl+Shift+W', () => {
    toggleDesktopWidgets();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createDesktopWindow(false);
    }
  });
});

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
