import React, { useState } from 'react';
import type { AppSettings } from '../types/widgets';
import { 
  Plus, 
  Lock, 
  Unlock, 
  Grid, 
  RotateCcw, 
  Image, 
  Download, 
  Upload, 
  Layers,
  Settings
} from 'lucide-react';

interface ControlBarProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onOpenAddModal: () => void;
  onOpenSettingsApp: () => void;
  onResetLayout: () => void;
  onExportLayout: () => void;
  onImportLayout: () => void;
  widgetCount: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenAddModal,
  onOpenSettingsApp,
  onResetLayout,
  onExportLayout,
  onImportLayout,
  widgetCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const backgroundOptions: { id: AppSettings['backgroundMode']; label: string }[] = [
    { id: 'desktop-mimic', label: 'Reference Art Wallpaper' },
    { id: 'solid-dark', label: 'Matte Deep Black' },
    { id: 'mesh-gradient', label: 'Dark Vignette' },
    { id: 'transparent', label: 'Pure Desktop Overlay' },
  ];

  return (
    <div className="fixed top-4 right-4 z-[90] flex items-center gap-2 select-none">
      {/* Floating HUD Pill */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.18)] text-neutral-300">
        {/* Toggle Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
          title="Toggle Dock"
        >
          <div className="w-2 h-2 rounded-full bg-neutral-400" />
          <span className="font-mono text-xs font-semibold tracking-wider text-neutral-200">LapWids</span>
        </button>

        {isExpanded && (
          <>
            <div className="h-4 w-[1px] bg-white/10 mx-1" />

            {/* Add Widget Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#252833] hover:bg-[#2e3240] text-neutral-200 text-xs font-medium border border-white/10 transition-colors"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>

            {/* Open Settings App Button */}
            <button
              onClick={onOpenSettingsApp}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-neutral-400"
              title="Open Settings App (Ctrl + ,)"
            >
              <Settings size={14} />
            </button>

            {/* Pin Behind Windows (Desktop Widget Mode) */}
            <button
              onClick={() => {
                const nextState = !settings.isPinnedBehind;
                onUpdateSettings({ isPinnedBehind: nextState });
                if (window.electronAPI) {
                  window.electronAPI.pinToDesktop(nextState);
                }
              }}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                settings.isPinnedBehind
                  ? 'bg-neutral-700/50 text-white border border-white/20'
                  : 'hover:bg-white/10 hover:text-white text-neutral-400'
              }`}
              title={
                settings.isPinnedBehind
                  ? 'Desktop Mode: ACTIVE (Pinned behind open apps)'
                  : 'Click to Pin Behind Windows (Desktop mode)'
              }
            >
              <Layers size={13} />
            </button>

            {/* Lock / Unlock all */}
            <button
              onClick={() => onUpdateSettings({ lockAll: !settings.lockAll })}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.lockAll
                  ? 'bg-neutral-700/50 text-white border border-white/20'
                  : 'hover:bg-white/10 hover:text-white text-neutral-400'
              }`}
              title={settings.lockAll ? 'Unlock Widgets' : 'Lock Widgets'}
            >
              {settings.lockAll ? <Lock size={13} /> : <Unlock size={13} />}
            </button>

            {/* Grid Snap */}
            <button
              onClick={() => onUpdateSettings({ gridSnap: !settings.gridSnap })}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.gridSnap
                  ? 'bg-neutral-700/50 text-white border border-white/20'
                  : 'hover:bg-white/10 hover:text-white text-neutral-400'
              }`}
              title={`Grid Snapping: ${settings.gridSnap ? 'ON' : 'OFF'}`}
            >
              <Grid size={13} />
            </button>

            {/* Background Mode dropdown */}
            <div className="relative group">
              <button
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-neutral-400"
                title="Change Background"
              >
                <Image size={13} />
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-[#181a20] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all text-xs z-50">
                <div className="px-3 py-1 text-[10px] font-mono text-neutral-500 uppercase tracking-wider border-b border-white/5">
                  Wallpaper
                </div>
                {backgroundOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ backgroundMode: opt.id })}
                    className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors flex items-center justify-between ${
                      settings.backgroundMode === opt.id ? 'text-white font-medium bg-white/[0.06]' : 'text-neutral-400'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset to Reference Screenshot */}
            <button
              onClick={onResetLayout}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-neutral-400"
              title="Reset to Screenshot Layout"
            >
              <RotateCcw size={13} />
            </button>

            {/* Export Layout */}
            <button
              onClick={onExportLayout}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-neutral-400"
              title="Export Layout"
            >
              <Download size={13} />
            </button>

            {/* Import Layout */}
            <button
              onClick={onImportLayout}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-neutral-400"
              title="Import Layout"
            >
              <Upload size={13} />
            </button>

            {/* Widget Count Badge */}
            <span className="font-mono text-[10px] text-neutral-500 px-2 py-0.5 rounded bg-white/[0.04]">
              {widgetCount}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
