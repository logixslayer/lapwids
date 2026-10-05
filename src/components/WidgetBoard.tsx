import React, { useState, useEffect, useRef } from 'react';
import type { WidgetInstance, AppSettings, AnyWidgetConfig, WidgetType } from '../types/widgets';
import { INITIAL_WIDGETS } from '../data/presets';
import { WidgetContainer } from './WidgetContainer';
import { SettingsModal } from './SettingsModal';
import { GothicWallpaperArt } from './GothicWallpaperArt';
import { subscribeToSync, broadcastWidgets, broadcastSettings, applyFontToDOM } from '../utils/syncChannel';

const STORAGE_KEY_WIDGETS = 'lapwids_widgets_layout_v1';
const STORAGE_KEY_SETTINGS = 'lapwids_app_settings_v1';

export const WidgetBoard: React.FC = () => {
  // Load initial widgets from localStorage or use preset
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WIDGETS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WIDGETS;
  });

  // Load app settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        applyFontToDOM(parsed.fontFamily);
        return parsed;
      }
    } catch {}
    applyFontToDOM('Inter');
    return {
      backgroundMode: 'desktop-mimic',
      gridSnap: false,
      gridSnapSize: 10,
      lockAll: false,
      accentColor: '#ffffff',
      globalScale: 1,
      isPinnedBehind: true,
      fontFamily: 'Inter',
    };
  });

  const [settingsModalWidget, setSettingsModalWidget] = useState<WidgetInstance | null>(null);

  // Sync state across windows via BroadcastChannel, StorageEvent, and local polling
  useEffect(() => {
    applyFontToDOM(settings.fontFamily);
    const unsubscribe = subscribeToSync(
      (newSettings) => {
        setSettings(newSettings);
      },
      (newWidgets) => {
        setWidgets(newWidgets);
      }
    );
    return unsubscribe;
  }, []);

  // Update DOM font whenever settings.fontFamily changes
  useEffect(() => {
    applyFontToDOM(settings.fontFamily);
  }, [settings.fontFamily]);

  // Sync pinning to desktop on mount and settings change
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.pinToDesktop(settings.isPinnedBehind ?? true);
    }
  }, [settings.isPinnedBehind]);

  // Widget mutation handlers
  const handleUpdateWidget = (id: string, updates: Partial<WidgetInstance>) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, ...updates } : w));
      broadcastWidgets(next);
      return next;
    });
  };

  const handleDeleteWidget = (id: string) => {
    setWidgets((prev) => {
      const next = prev.filter((w) => w.id !== id);
      broadcastWidgets(next);
      return next;
    });
  };

  const handleDuplicateWidget = (target: WidgetInstance) => {
    const newWidget: WidgetInstance = {
      ...target,
      id: `widget-${Date.now()}`,
      x: target.x + 20,
      y: target.y + 20,
      zIndex: Math.max(...widgets.map((w) => w.zIndex), 10) + 1,
    };
    setWidgets((prev) => {
      const next = [...prev, newWidget];
      broadcastWidgets(next);
      return next;
    });
  };

  const handleBringToFront = (id: string) => {
    setWidgets((prev) => {
      const highestZ = Math.max(...prev.map((w) => w.zIndex), 10);
      const next = prev.map((w) => (w.id === id ? { ...w, zIndex: highestZ + 1 } : w));
      broadcastWidgets(next);
      return next;
    });
  };

  const handleSaveWidgetConfig = (id: string, newConfig: AnyWidgetConfig) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, config: newConfig } : w));
      broadcastWidgets(next);
      return next;
    });
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none bg-transparent"
      style={{
        '--widget-font-family': `'${settings.fontFamily || 'Inter'}', system-ui, sans-serif`,
        fontFamily: 'var(--widget-font-family)',
      } as React.CSSProperties}
    >
      {/* Background Mode Render */}
      {(settings.backgroundMode === 'desktop-mimic' || settings.backgroundMode === 'wallpaper') && (
        <GothicWallpaperArt 
          preset={settings.wallpaperPreset || 'renaissance'} 
          customUrl={settings.customWallpaperUrl} 
        />
      )}
      {settings.backgroundMode === 'solid-dark' && <div className="absolute inset-0 bg-[#060709]" />}
      {settings.backgroundMode === 'mesh-gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-[#060709]" />
      )}
      {settings.backgroundMode === 'transparent' && null}

      {/* Grid Pattern overlay if grid snapping is on */}
      {settings.gridSnap && (
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />
      )}

      {/* Interactive Desktop Widget Layer */}
      <div className="relative w-full h-full">
        {widgets.map((widget) => (
          <WidgetContainer
            key={widget.id}
            widget={widget}
            isAllLocked={settings.lockAll}
            gridSnap={settings.gridSnap}
            gridSnapSize={settings.gridSnapSize}
            fontFamily={settings.fontFamily}
            onUpdate={handleUpdateWidget}
            onDelete={handleDeleteWidget}
            onDuplicate={handleDuplicateWidget}
            onBringToFront={handleBringToFront}
            onOpenSettings={(w) => setSettingsModalWidget(w)}
          />
        ))}
      </div>

      {/* Quick Individual Widget Settings Modal */}
      <SettingsModal
        widget={settingsModalWidget}
        isOpen={!!settingsModalWidget}
        onClose={() => setSettingsModalWidget(null)}
        onSave={handleSaveWidgetConfig}
      />
    </div>
  );
};
