import type { AppSettings, WidgetInstance } from '../types/widgets';

const STORAGE_KEY_WIDGETS = 'lapwids_widgets_layout_v1';
const STORAGE_KEY_SETTINGS = 'lapwids_app_settings_v1';
const CHANNEL_NAME = 'lapwids_sync_channel';

// Create a BroadcastChannel if supported (Chromium / modern browsers)
let bc: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (err) {
  console.warn('BroadcastChannel not supported:', err);
}

export type SyncMessage =
  | { type: 'settings'; payload: AppSettings }
  | { type: 'widgets'; payload: WidgetInstance[] };

export function applyFontToDOM(fontFamily?: string) {
  const font = fontFamily || 'Inter';
  const fallback =
    font === 'Cinzel' || font === 'Playfair Display'
      ? 'serif'
      : font === 'JetBrains Mono'
      ? 'monospace'
      : font === 'Caveat'
      ? 'cursive'
      : 'system-ui, -apple-system, sans-serif';

  const fontValue = `'${font}', ${fallback}`;
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.style.setProperty('--widget-font-family', fontValue);
  }
}

export function broadcastSettings(settings: AppSettings) {
  // 1. Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }

  // 2. Apply font locally immediately
  applyFontToDOM(settings.fontFamily);

  // 3. Broadcast via BroadcastChannel
  try {
    bc?.postMessage({ type: 'settings', payload: settings } as SyncMessage);
  } catch (err) {
    console.warn('BroadcastChannel postMessage failed:', err);
  }

  // 4. Send via Electron IPC if available
  try {
    if (window.electronAPI && 'syncSettings' in window.electronAPI) {
      (window.electronAPI as any).syncSettings(settings);
    }
  } catch {}
}

export function broadcastWidgets(widgets: WidgetInstance[]) {
  // 1. Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(widgets));
  } catch (err) {
    console.error('Failed to save widgets to localStorage:', err);
  }

  // 2. Broadcast via BroadcastChannel
  try {
    bc?.postMessage({ type: 'widgets', payload: widgets } as SyncMessage);
  } catch (err) {
    console.warn('BroadcastChannel postMessage failed:', err);
  }

  // 3. Send via Electron IPC if available
  try {
    if (window.electronAPI && 'syncWidgets' in window.electronAPI) {
      (window.electronAPI as any).syncWidgets(widgets);
    }
  } catch {}
}

export function subscribeToSync(
  onSettings: (settings: AppSettings) => void,
  onWidgets: (widgets: WidgetInstance[]) => void
): () => void {
  // 1. Listen on BroadcastChannel
  const handleBCMessage = (event: MessageEvent<SyncMessage>) => {
    if (!event.data) return;
    if (event.data.type === 'settings') {
      applyFontToDOM(event.data.payload.fontFamily);
      onSettings(event.data.payload);
    } else if (event.data.type === 'widgets') {
      onWidgets(event.data.payload);
    }
  };

  if (bc) {
    bc.addEventListener('message', handleBCMessage);
  }

  // 2. Listen on StorageEvent fallback
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_SETTINGS && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        applyFontToDOM(parsed.fontFamily);
        onSettings(parsed);
      } catch {}
    }
    if (e.key === STORAGE_KEY_WIDGETS && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        onWidgets(parsed);
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // 3. Listen on Electron IPC if available
  let unsubElectronSettings: (() => void) | undefined;
  let unsubElectronWidgets: (() => void) | undefined;
  try {
    if (window.electronAPI && 'onSettingsSync' in window.electronAPI) {
      unsubElectronSettings = (window.electronAPI as any).onSettingsSync((data: AppSettings) => {
        applyFontToDOM(data.fontFamily);
        onSettings(data);
      });
    }
    if (window.electronAPI && 'onWidgetsSync' in window.electronAPI) {
      unsubElectronWidgets = (window.electronAPI as any).onWidgetsSync((data: WidgetInstance[]) => {
        onWidgets(data);
      });
    }
  } catch {}

  // 4. Lightweight polling fallback (every 500ms) to ensure sync even if all inter-process events are blocked
  let lastSettingsStr = localStorage.getItem(STORAGE_KEY_SETTINGS) || '';
  let lastWidgetsStr = localStorage.getItem(STORAGE_KEY_WIDGETS) || '';

  const intervalId = setInterval(() => {
    try {
      const curSettingsStr = localStorage.getItem(STORAGE_KEY_SETTINGS) || '';
      if (curSettingsStr && curSettingsStr !== lastSettingsStr) {
        lastSettingsStr = curSettingsStr;
        const parsed = JSON.parse(curSettingsStr);
        applyFontToDOM(parsed.fontFamily);
        onSettings(parsed);
      }

      const curWidgetsStr = localStorage.getItem(STORAGE_KEY_WIDGETS) || '';
      if (curWidgetsStr && curWidgetsStr !== lastWidgetsStr) {
        lastWidgetsStr = curWidgetsStr;
        const parsed = JSON.parse(curWidgetsStr);
        onWidgets(parsed);
      }
    } catch {}
  }, 500);

  // Return cleanup function
  return () => {
    if (bc) {
      bc.removeEventListener('message', handleBCMessage);
    }
    window.removeEventListener('storage', handleStorage);
    if (unsubElectronSettings) unsubElectronSettings();
    if (unsubElectronWidgets) unsubElectronWidgets();
    clearInterval(intervalId);
  };
}
