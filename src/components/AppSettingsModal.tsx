import React, { useState } from 'react';
import type { AppSettings, WidgetInstance } from '../types/widgets';
import { 
  X, 
  Sliders, 
  Image, 
  Layers, 
  Clock, 
  Cloud, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Image as ImageIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Grid, 
  Lock, 
  Unlock,
  Trash2,
  Plus,
  Power
} from 'lucide-react';
import { ART_PRESETS } from '../data/presets';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  widgets: WidgetInstance[];
  onUpdateWidget: (id: string, updates: Partial<WidgetInstance>) => void;
  onDeleteWidget: (id: string) => void;
  onAddWidget: (type: WidgetInstance['type']) => void;
  onResetLayout: () => void;
  onExportLayout: () => void;
  onImportLayout: () => void;
}

type TabType = 'general' | 'widgets' | 'weather' | 'clock' | 'calendar' | 'todo' | 'art' | 'backup';

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  widgets,
  onUpdateWidget,
  onDeleteWidget,
  onAddWidget,
  onResetLayout,
  onExportLayout,
  onImportLayout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  if (!isOpen) return null;

  // Background modes available
  const backgroundOptions: { id: AppSettings['backgroundMode']; label: string; desc: string }[] = [
    { id: 'desktop-mimic', label: 'Reference Art Wallpaper', desc: 'Dark gothic etching illustration background' },
    { id: 'solid-dark', label: 'Matte Deep Black', desc: 'Minimal solid black background' },
    { id: 'mesh-gradient', label: 'Dark Vignette', desc: 'Subtle charcoal gradient vignette' },
    { id: 'transparent', label: 'Pure Desktop Overlay', desc: 'Transparent overlay directly on your Windows desktop' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[150] p-4 select-none font-sans">
      <div className="bg-[#14161c] border border-white/10 rounded-2xl w-full max-w-3xl h-[80vh] max-h-[620px] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Window Titlebar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#181a22] border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
            <span className="font-mono text-xs font-semibold tracking-wider text-white">
              LapWids Settings & Control Panel
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings Body with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-[#111318] border-r border-white/[0.06] p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-2 py-1">
              Configuration
            </div>

            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'general' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <Sliders size={14} />
              <span>General & Desktop</span>
            </button>

            <button
              onClick={() => setActiveTab('widgets')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'widgets' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <Layers size={14} />
              <span>Manage Widgets</span>
              <span className="ml-auto text-[10px] font-mono text-neutral-500 bg-black/40 px-1.5 py-0.5 rounded">
                {widgets.length}
              </span>
            </button>

            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-2 py-1 pt-3">
              Widget Tuning
            </div>

            <button
              onClick={() => setActiveTab('clock')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'clock' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <Clock size={14} />
              <span>Flip Clock</span>
            </button>

            <button
              onClick={() => setActiveTab('weather')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'weather' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <Cloud size={14} />
              <span>Weather</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'calendar' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('todo')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'todo' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <CheckSquare size={14} />
              <span>To-Do List</span>
            </button>

            <button
              onClick={() => setActiveTab('art')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'art' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <ImageIcon size={14} />
              <span>Art Frames</span>
            </button>

            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-2 py-1 pt-3">
              System
            </div>

            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                activeTab === 'backup' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`}
            >
              <Download size={14} />
              <span>Backup & Reset</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-neutral-300">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-white mb-1">Desktop & Wallpaper Modes</h3>
                  <p className="text-xs text-neutral-400">Choose how the background canvas interacts with your Windows desktop.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {backgroundOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => onUpdateSettings({ backgroundMode: opt.id })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        settings.backgroundMode === opt.id
                          ? 'bg-[#1e222c] border-white/30 text-white'
                          : 'bg-[#111318] border-white/[0.06] hover:border-white/15 text-neutral-400'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-neutral-200">{opt.label}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{opt.desc}</div>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        settings.backgroundMode === opt.id ? 'border-white bg-white' : 'border-white/30'
                      }`}>
                        {settings.backgroundMode === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/[0.06] space-y-4">
                  <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                    Window & Behavior
                  </h4>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#111318] border border-white/[0.06] cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">Pin Behind All Windows (Wallpaper Mode)</div>
                      <div className="text-[11px] text-neutral-400">Widgets always stay at the lowest layer behind other applications</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.isPinnedBehind ?? true}
                      onChange={(e) => {
                        const next = e.target.checked;
                        onUpdateSettings({ isPinnedBehind: next });
                        window.electronAPI?.pinToDesktop(next);
                      }}
                      className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#111318] border border-white/[0.06] cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">Lock All Widgets</div>
                      <div className="text-[11px] text-neutral-400">Prevent accidental movement or dragging</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.lockAll}
                      onChange={(e) => onUpdateSettings({ lockAll: e.target.checked })}
                      className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#111318] border border-white/[0.06] cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">Grid Snapping (10px)</div>
                      <div className="text-[11px] text-neutral-400">Snap widgets to a clean 10px alignment grid</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.gridSnap}
                      onChange={(e) => onUpdateSettings({ gridSnap: e.target.checked })}
                      className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* WIDGETS MANAGER TAB */}
            {activeTab === 'widgets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-white mb-0.5">Active Desktop Widgets</h3>
                    <p className="text-xs text-neutral-400">Add, remove, or configure widgets on your desktop.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddWidget('clock')}
                      className="px-2.5 py-1 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Clock</span>
                    </button>
                    <button
                      onClick={() => onAddWidget('weather')}
                      className="px-2.5 py-1 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Weather</span>
                    </button>
                    <button
                      onClick={() => onAddWidget('calendar')}
                      className="px-2.5 py-1 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Calendar</span>
                    </button>
                    <button
                      onClick={() => onAddWidget('todo')}
                      className="px-2.5 py-1 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>To-Do</span>
                    </button>
                    <button
                      onClick={() => onAddWidget('media')}
                      className="px-2.5 py-1 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Art Frame</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {widgets.map((w, idx) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl bg-[#111318] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-neutral-500 w-5">{idx + 1}.</span>
                        <div>
                          <div className="text-xs font-semibold text-white capitalize">{w.type} Widget</div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            Position: ({w.x}px, {w.y}px) • Size: {w.width}x{w.height}px
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateWidget(w.id, { isLocked: !w.isLocked })}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title={w.isLocked ? 'Unlock' : 'Lock'}
                        >
                          {w.isLocked ? <Lock size={13} className="text-amber-400" /> : <Unlock size={13} />}
                        </button>

                        <button
                          onClick={() => onDeleteWidget(w.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                          title="Delete Widget"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLOCK TAB */}
            {activeTab === 'clock' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-white mb-0.5">Flip Clock Settings</h3>
                  <p className="text-xs text-neutral-400">Configure time format and mechanical flip card display.</p>
                </div>

                {widgets.filter((w) => w.type === 'clock').map((clockW) => {
                  const cfg = clockW.config as any;
                  return (
                    <div key={clockW.id} className="p-4 rounded-xl bg-[#111318] border border-white/[0.06] space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs text-neutral-300">24-Hour Military Format</span>
                        <input
                          type="checkbox"
                          checked={cfg.format24}
                          onChange={(e) =>
                            onUpdateWidget(clockW.id, {
                              config: { ...cfg, format24: e.target.checked },
                            })
                          }
                          className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs text-neutral-300">Show AM / PM Marker</span>
                        <input
                          type="checkbox"
                          checked={cfg.showAmPm}
                          onChange={(e) =>
                            onUpdateWidget(clockW.id, {
                              config: { ...cfg, showAmPm: e.target.checked },
                            })
                          }
                          className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* WEATHER TAB */}
            {activeTab === 'weather' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-white mb-0.5">Weather Configuration</h3>
                  <p className="text-xs text-neutral-400">Configure local location and forecast options.</p>
                </div>

                {widgets.filter((w) => w.type === 'weather').map((weatherW) => {
                  const cfg = weatherW.config as any;
                  return (
                    <div key={weatherW.id} className="p-4 rounded-xl bg-[#111318] border border-white/[0.06] space-y-3">
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">City / Location Label</label>
                        <input
                          type="text"
                          value={cfg.city || ''}
                          onChange={(e) =>
                            onUpdateWidget(weatherW.id, {
                              config: { ...cfg, city: e.target.value },
                            })
                          }
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-sans text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-neutral-400 block mb-1">Latitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={cfg.latitude}
                            onChange={(e) =>
                              onUpdateWidget(weatherW.id, {
                                config: { ...cfg, latitude: parseFloat(e.target.value) || 0 },
                              })
                            }
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-400 block mb-1">Longitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={cfg.longitude}
                            onChange={(e) =>
                              onUpdateWidget(weatherW.id, {
                                config: { ...cfg, longitude: parseFloat(e.target.value) || 0 },
                              })
                            }
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Temperature Unit</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateWidget(weatherW.id, {
                                config: { ...cfg, unit: 'fahrenheit' },
                              })
                            }
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                              cfg.unit === 'fahrenheit' ? 'bg-white/20 border-white text-white' : 'border-white/10 hover:bg-white/5'
                            }`}
                          >
                            Fahrenheit (°F)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateWidget(weatherW.id, {
                                config: { ...cfg, unit: 'celsius' },
                              })
                            }
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                              cfg.unit === 'celsius' ? 'bg-white/20 border-white text-white' : 'border-white/10 hover:bg-white/5'
                            }`}
                          >
                            Celsius (°C)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ART & MEDIA TAB */}
            {activeTab === 'art' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-white mb-0.5">Art Presets & Media Frames</h3>
                  <p className="text-xs text-neutral-400">Choose monochrome presets or assign custom artwork.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {ART_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2 rounded-xl bg-[#111318] border border-white/[0.06] space-y-2 group"
                    >
                      <div className="h-28 rounded-lg overflow-hidden relative">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="text-xs font-medium text-neutral-200 truncate">{preset.name}</div>
                      <div className="text-[10px] text-neutral-500">{preset.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BACKUP TAB */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-white mb-1">Layout Backup & Reset</h3>
                  <p className="text-xs text-neutral-400">Save your custom layout or restore the reference screenshot arrangement.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onExportLayout}
                    className="p-4 rounded-xl bg-[#111318] hover:bg-[#1e222c] border border-white/[0.06] hover:border-white/20 transition-all text-left flex flex-col justify-between"
                  >
                    <Download size={20} className="text-neutral-300 mb-2" />
                    <div>
                      <div className="text-xs font-semibold text-white">Export Layout JSON</div>
                      <div className="text-[11px] text-neutral-400">Save widget positions & configs to a file</div>
                    </div>
                  </button>

                  <button
                    onClick={onImportLayout}
                    className="p-4 rounded-xl bg-[#111318] hover:bg-[#1e222c] border border-white/[0.06] hover:border-white/20 transition-all text-left flex flex-col justify-between"
                  >
                    <Upload size={20} className="text-neutral-300 mb-2" />
                    <div>
                      <div className="text-xs font-semibold text-white">Import Layout JSON</div>
                      <div className="text-[11px] text-neutral-400">Load previously saved layout from file</div>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-amber-300">Reset to Reference Screenshot Layout</div>
                      <div className="text-[11px] text-amber-400/80">Restores all widgets, art, and coordinates to exact reference setup</div>
                    </div>

                    <button
                      onClick={onResetLayout}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Layout</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => window.electronAPI?.quitApp()}
                    className="w-full p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Power size={14} />
                    <span>Quit LapWids Completely</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
