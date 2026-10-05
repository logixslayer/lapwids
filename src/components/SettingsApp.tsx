import React, { useState, useEffect } from 'react';
import type { AppSettings, WidgetInstance, WidgetType, AnyWidgetConfig } from '../types/widgets';
import { INITIAL_WIDGETS, ART_PRESETS } from '../data/presets';
import { 
  Sliders, 
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
  Power,
  Eye,
  Settings as SettingsIcon,
  Sparkles,
  Check,
  Palette,
  Bookmark,
  BookmarkPlus,
  CheckCircle2,
  X
} from 'lucide-react';
import { subscribeToSync, broadcastSettings, broadcastWidgets, applyFontToDOM } from '../utils/syncChannel';
import { BUILTIN_TEMPLATES, loadCustomTemplates, saveCustomTemplate, deleteCustomTemplate } from '../data/templates';
import type { DesktopTemplate } from '../types/widgets';

const STORAGE_KEY_WIDGETS = 'lapwids_widgets_layout_v1';
const STORAGE_KEY_SETTINGS = 'lapwids_app_settings_v1';

type TabType = 'templates' | 'general' | 'widgets' | 'weather' | 'clock' | 'calendar' | 'todo' | 'art' | 'backup';

export const SettingsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WIDGETS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WIDGETS;
  });

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

  const [customTemplates, setCustomTemplates] = useState<DesktopTemplate[]>(loadCustomTemplates);
  const [templateCategory, setTemplateCategory] = useState<string>('All');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateTagline, setSaveTemplateTagline] = useState('');
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);

  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];

  const handleApplyTemplate = (template: DesktopTemplate) => {
    const updates: Partial<AppSettings> = {
      fontFamily: template.fontFamily,
      accentColor: template.accentColor,
      backgroundMode: template.backgroundMode || (template.wallpaperUrl ? 'wallpaper' : 'desktop-mimic'),
      wallpaperPreset: template.wallpaperPreset || 'renaissance',
      customWallpaperUrl: template.wallpaperUrl || '',
    };

    const clonedWidgets = template.widgets.map((w, idx) => ({
      ...w,
      id: `widget-${w.type}-${Date.now()}-${idx}`,
    }));

    handleUpdateSettings(updates);
    setWidgets(clonedWidgets);
    broadcastWidgets(clonedWidgets);
    applyFontToDOM(template.fontFamily);
    setAppliedTemplateId(template.id);
  };

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTemplateName.trim()) return;

    const newCustomTemplate: DesktopTemplate = {
      id: `custom-${Date.now()}`,
      name: saveTemplateName.trim(),
      tagline: saveTemplateTagline.trim() || 'Custom Saved Desktop Setup',
      category: 'My Saved',
      description: `Custom layout with ${widgets.length} widgets and ${settings.fontFamily || 'Inter'} typography.`,
      wallpaperUrl: settings.customWallpaperUrl,
      wallpaperPreset: settings.wallpaperPreset,
      backgroundMode: settings.backgroundMode,
      fontFamily: settings.fontFamily || 'Inter',
      accentColor: settings.accentColor || '#ffffff',
      widgets: widgets,
      isCustom: true,
    };

    const updated = saveCustomTemplate(newCustomTemplate);
    setCustomTemplates(updated);
    setIsSaveModalOpen(false);
    setSaveTemplateName('');
    setSaveTemplateTagline('');
    setAppliedTemplateId(newCustomTemplate.id);
  };

  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this custom saved template?')) {
      const updated = deleteCustomTemplate(id);
      setCustomTemplates(updated);
      if (appliedTemplateId === id) setAppliedTemplateId(null);
    }
  };

  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      broadcastSettings(next);
      return next;
    });
    if (updates.isPinnedBehind !== undefined) {
      window.electronAPI?.pinToDesktop(updates.isPinnedBehind);
    }
  };

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

  const handleAddWidgetByType = (type: WidgetType) => {
    const baseW = INITIAL_WIDGETS.find((w) => w.type === type);
    const highestZ = Math.max(...widgets.map((w) => w.zIndex), 10);
    const created: WidgetInstance = {
      id: `widget-${Date.now()}`,
      type: type,
      x: 60 + Math.random() * 80,
      y: 60 + Math.random() * 80,
      width: baseW ? baseW.width : 200,
      height: baseW ? baseW.height : 160,
      zIndex: highestZ + 1,
      isLocked: false,
      isVisible: true,
      config: baseW ? { ...baseW.config } : ({ opacity: 1 } as AnyWidgetConfig),
    };
    setWidgets((prev) => {
      const next = [...prev, created];
      broadcastWidgets(next);
      return next;
    });
  };

  const handleResetLayout = () => {
    if (window.confirm('Reset all desktop widgets to the reference layout?')) {
      setWidgets(INITIAL_WIDGETS);
      broadcastWidgets(INITIAL_WIDGETS);
      handleUpdateSettings({ backgroundMode: 'desktop-mimic', lockAll: false });
    }
  };

  const handleExportLayout = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(widgets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lapwids-layout-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setWidgets(parsed);
            broadcastWidgets(parsed);
          }
        } catch {
          alert('Invalid layout JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const backgroundOptions: { id: AppSettings['backgroundMode']; label: string; desc: string }[] = [
    { id: 'desktop-mimic', label: 'Aesthetic Dark Artwork', desc: 'High-definition dark artwork wallpaper with widgets on the left' },
    { id: 'solid-dark', label: 'Matte Pure Black', desc: 'Minimal clean solid black background with zero art' },
    { id: 'mesh-gradient', label: 'Dark Atmospheric Vignette', desc: 'Subtle charcoal gradient with smooth vignette' },
    { id: 'transparent', label: 'Pure Desktop Overlay', desc: '100% transparent overlay directly on top of your Windows desktop' },
  ];

  return (
    <div className="w-screen h-screen bg-[#111317] text-neutral-200 flex flex-col select-none font-sans overflow-hidden">
      {/* Top App Header */}
      <div className="h-14 bg-[#161820] border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-[#222530] border border-white/10 flex items-center justify-center text-white">
            <SettingsIcon size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-wide">LapWids Settings App</div>
            <div className="text-[11px] text-neutral-400 font-mono">Desktop Widget Engine • Background Active</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.04]">
            {widgets.length} Active Widgets
          </span>
          <button
            onClick={handleResetLayout}
            className="px-3 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2c303e] text-xs font-medium text-neutral-300 border border-white/10 transition-colors flex items-center gap-1.5"
            title="Reset to Reference Screenshot Layout"
          >
            <RotateCcw size={13} />
            <span>Reset Layout</span>
          </button>
        </div>
      </div>

      {/* Main Layout Area: Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-[#13151b] border-r border-white/[0.06] p-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-3 py-1">
            Themes & Presets
          </div>

          <button
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-200 font-medium shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                : 'text-neutral-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sparkles size={14} className="text-cyan-400 shrink-0" />
            <span>Desktop Templates</span>
            <span className="ml-auto text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-500/30">
              {allTemplates.length}
            </span>
          </button>

          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-3 py-1 pt-2">
            General
          </div>

          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
              activeTab === 'general' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
            }`}
          >
            <Sliders size={14} />
            <span>Desktop & Controls</span>
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

          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-3 py-1 pt-3">
            Individual Widgets
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

          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-3 py-1 pt-3">
            Profiles & System
          </div>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
              activeTab === 'backup' ? 'bg-[#222530] text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
            }`}
          >
            <Download size={14} />
            <span>Export & Backup</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 text-sm text-neutral-300">
          
          {/* TAB 0: DESKTOP TEMPLATES & THEMES */}
          {activeTab === 'templates' && (
            <div className="space-y-6 max-w-4xl">
              {/* Header Banner */}
              <div className="flex items-start justify-between p-5 rounded-2xl bg-gradient-to-r from-[#171b26] via-[#141824] to-[#12141c] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={18} className="text-cyan-400" />
                    <h2 className="text-lg font-bold text-white tracking-wide">Desktop Templates & Themes</h2>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Curated Styles
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 max-w-xl">
                    One-click coordinated desktop setups with matched aesthetic wallpapers, distinct typography, and tailored widget combinations.
                  </p>
                </div>

                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/15 font-medium transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <BookmarkPlus size={14} className="text-cyan-400" />
                  <span>Save Current Setup</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Cyberpunk', 'Gothic Noir', 'Minimalist', 'Developer', 'Lo-Fi Aesthetic', 'Fine Art', 'My Saved'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      templateCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'bg-[#151720] text-neutral-400 border border-white/[0.06] hover:text-neutral-200 hover:border-white/15'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allTemplates
                  .filter((t) => {
                    if (templateCategory === 'All') return true;
                    if (templateCategory === 'My Saved') return t.isCustom;
                    return t.category.toLowerCase().includes(templateCategory.toLowerCase());
                  })
                  .map((t) => {
                    const isCurrentlyActive =
                      appliedTemplateId === t.id ||
                      (settings.fontFamily === t.fontFamily &&
                        (t.wallpaperPreset ? settings.wallpaperPreset === t.wallpaperPreset : true));

                    const thumbSrc =
                      t.wallpaperUrl ||
                      (t.wallpaperPreset === 'smoke'
                        ? '/wallpapers/dark_smoke.jpg'
                        : t.wallpaperPreset === 'renaissance'
                        ? '/wallpapers/dark_renaissance.jpg'
                        : null);

                    const uniqueWidgetTypes = Array.from(new Set(t.widgets.map((w) => w.type)));

                    return (
                      <div
                        key={t.id}
                        className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between group ${
                          isCurrentlyActive
                            ? 'bg-[#171b26] border-cyan-400/40 shadow-[0_0_24px_rgba(6,182,212,0.12)]'
                            : 'bg-[#14161f] border-white/[0.08] hover:border-white/20 hover:bg-[#181a25]'
                        }`}
                      >
                        {/* Wallpaper Banner Preview */}
                        <div className="h-36 relative overflow-hidden bg-black/80 flex items-center justify-center">
                          {thumbSrc ? (
                            <img
                              src={thumbSrc}
                              alt={t.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : t.backgroundMode === 'mesh-gradient' ? (
                            <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-[#0c0e14]" />
                          ) : (
                            <div className="w-full h-full bg-[#08090d] flex items-center justify-center text-neutral-600 font-mono text-xs">
                              Matte Pitch Black
                            </div>
                          )}

                          {/* Dark overlay for contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#14161f] via-black/40 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent w-[60%]" />

                          {/* Category badge */}
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-neutral-300">
                            {t.category}
                          </div>

                          {/* Floating widget badges over preview */}
                          <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 flex-wrap">
                            {uniqueWidgetTypes.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-neutral-300 uppercase tracking-wider"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Template Details */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="text-sm font-bold text-white">{t.name}</h3>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: t.accentColor || '#ffffff' }}
                                  title="Theme Accent"
                                />
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {t.widgets.length} widgets
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] font-medium text-cyan-400/90 mb-1.5">{t.tagline}</p>
                            <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                              {t.description}
                            </p>
                          </div>

                          {/* Typography and styling meta pills */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                style={{ fontFamily: `'${t.fontFamily}', sans-serif` }}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-neutral-200"
                              >
                                Aa {t.fontFamily}
                              </div>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {t.backgroundMode === 'solid-dark'
                                  ? 'Matte Dark'
                                  : t.backgroundMode === 'mesh-gradient'
                                  ? 'Mesh Gradient'
                                  : 'Wallpaper'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {t.isCustom && (
                                <button
                                  onClick={(e) => handleDeleteCustomTemplate(t.id, e)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-colors"
                                  title="Delete Custom Template"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}

                              <button
                                onClick={() => handleApplyTemplate(t)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                                  isCurrentlyActive
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                                }`}
                              >
                                {isCurrentlyActive ? (
                                  <>
                                    <CheckCircle2 size={13} className="text-emerald-400" />
                                    <span>Active Theme</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={13} />
                                    <span>Apply Theme</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 1: GENERAL & DESKTOP */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Desktop & Wallpaper Modes</h2>
                <p className="text-xs text-neutral-400">Choose the canvas background underneath your desktop widgets.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {backgroundOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleUpdateSettings({ backgroundMode: opt.id })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      settings.backgroundMode === opt.id
                        ? 'bg-[#1e222c] border-white/30 text-white'
                        : 'bg-[#15171f] border-white/[0.06] hover:border-white/15 text-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-neutral-200">{opt.label}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{opt.desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      settings.backgroundMode === opt.id ? 'border-white bg-white' : 'border-white/30'
                    }`}>
                      {settings.backgroundMode === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                ))}
              </div>

              {settings.backgroundMode === 'desktop-mimic' && (
                <div className="p-4 rounded-xl bg-[#15171f] border border-white/[0.06] space-y-3">
                  <div className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                    Artwork Preset
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateSettings({ wallpaperPreset: 'renaissance', customWallpaperUrl: '' })}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                        (settings.wallpaperPreset === 'renaissance' || !settings.wallpaperPreset) && !settings.customWallpaperUrl
                          ? 'border-white/40 bg-[#222530] text-white shadow-lg'
                          : 'border-white/[0.06] bg-[#1a1c24] hover:border-white/20 text-neutral-400'
                      }`}
                    >
                      <div className="w-full h-16 rounded overflow-hidden bg-black/50 border border-white/5 relative">
                        <img src="/wallpapers/dark_renaissance.jpg" alt="Renaissance" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-200">Renaissance</div>
                        <div className="text-[10px] text-neutral-400">Classical sculpture</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateSettings({ wallpaperPreset: 'smoke', customWallpaperUrl: '' })}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                        settings.wallpaperPreset === 'smoke' && !settings.customWallpaperUrl
                          ? 'border-white/40 bg-[#222530] text-white shadow-lg'
                          : 'border-white/[0.06] bg-[#1a1c24] hover:border-white/20 text-neutral-400'
                      }`}
                    >
                      <div className="w-full h-16 rounded overflow-hidden bg-black/50 border border-white/5 relative">
                        <img src="/wallpapers/dark_smoke.jpg" alt="Smoke" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-200">Silk Smoke</div>
                        <div className="text-[10px] text-neutral-400">Minimal fluid light</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateSettings({ wallpaperPreset: 'none', customWallpaperUrl: '' })}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                        settings.wallpaperPreset === 'none' && !settings.customWallpaperUrl
                          ? 'border-white/40 bg-[#222530] text-white shadow-lg'
                          : 'border-white/[0.06] bg-[#1a1c24] hover:border-white/20 text-neutral-400'
                      }`}
                    >
                      <div className="w-full h-16 rounded overflow-hidden bg-black border border-white/5 flex items-center justify-center text-neutral-500 text-[10px] font-mono">
                        Pure Dark
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-200">No Artwork</div>
                        <div className="text-[10px] text-neutral-400">Zero graphics</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1.5">
                      Or Custom Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={settings.customWallpaperUrl || ''}
                      onChange={(e) => handleUpdateSettings({ customWallpaperUrl: e.target.value })}
                      className="w-full bg-[#111317] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                  Widget Font Style
                </h3>
                <p className="text-[11px] text-neutral-400">Choose a global font for all your desktop widgets.</p>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'Inter', label: 'Inter', desc: 'Modern & clean', fallback: 'system-ui, sans-serif' },
                    { id: 'Poppins', label: 'Poppins', desc: 'Soft & friendly', fallback: 'sans-serif' },
                    { id: 'Outfit', label: 'Outfit', desc: 'Sleek & geometric', fallback: 'sans-serif' },
                    { id: 'Nunito', label: 'Nunito', desc: 'Elegant & rounded', fallback: 'sans-serif' },
                    { id: 'Orbitron', label: 'Orbitron', desc: 'Futuristic & sci-fi', fallback: 'sans-serif' },
                    { id: 'Playfair Display', label: 'Playfair Display', desc: 'Classic editorial serif', fallback: 'serif' },
                    { id: 'Cinzel', label: 'Cinzel', desc: 'Ancient Roman stone', fallback: 'serif' },
                    { id: 'Caveat', label: 'Caveat', desc: 'Handwritten & artsy', fallback: 'cursive' },
                    { id: 'JetBrains Mono', label: 'JetBrains Mono', desc: 'Techy monospace code', fallback: 'monospace' },
                  ].map((font) => {
                    const isSelected = (settings.fontFamily || 'Inter') === font.id;
                    return (
                      <div
                        key={font.id}
                        onClick={() => handleUpdateSettings({ fontFamily: font.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-b from-cyan-950/40 to-[#161d27] border-cyan-400/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.18)]'
                            : 'bg-[#15171f] border-white/[0.06] hover:border-white/20 text-neutral-400 hover:bg-[#191c25]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-sm">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                        <div
                          style={{ fontFamily: `'${font.id}', ${font.fallback}` }}
                          className={`text-[20px] leading-tight mb-1.5 truncate ${isSelected ? 'text-cyan-200' : 'text-neutral-100'}`}
                        >
                          Aa 12:45
                        </div>
                        <div className={`text-[11px] font-medium ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                          {font.label}
                        </div>
                        <div className="text-[10px] text-neutral-500">{font.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                  Widget Canvas Controls
                </h3>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#15171f] border border-white/[0.06] cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">Wallpaper Mode (Pin Behind All Windows)</div>
                    <div className="text-[11px] text-neutral-400">Widgets remain at the lowest layer behind other apps</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.isPinnedBehind ?? true}
                    onChange={(e) => handleUpdateSettings({ isPinnedBehind: e.target.checked })}
                    className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#15171f] border border-white/[0.06] cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">Lock All Widgets</div>
                    <div className="text-[11px] text-neutral-400">Disable dragging and resizing on desktop</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.lockAll}
                    onChange={(e) => handleUpdateSettings({ lockAll: e.target.checked })}
                    className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#15171f] border border-white/[0.06] cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">Grid Snapping (10px)</div>
                    <div className="text-[11px] text-neutral-400">Align widgets automatically to a 10px snap grid</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.gridSnap}
                    onChange={(e) => handleUpdateSettings({ gridSnap: e.target.checked })}
                    className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE WIDGETS */}
          {activeTab === 'widgets' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-0.5">Desktop Widgets</h2>
                  <p className="text-xs text-neutral-400">Add or manage widgets positioned on your screen.</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddWidgetByType('clock')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Clock</span>
                  </button>
                  <button
                    onClick={() => handleAddWidgetByType('weather')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Weather</span>
                  </button>
                  <button
                    onClick={() => handleAddWidgetByType('calendar')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Calendar</span>
                  </button>
                  <button
                    onClick={() => handleAddWidgetByType('todo')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>To-Do</span>
                  </button>
                  <button
                    onClick={() => handleAddWidgetByType('media')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2d3140] text-xs text-neutral-200 border border-white/10 transition-colors flex items-center gap-1"
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
                    className="p-3.5 rounded-xl bg-[#15171f] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-neutral-500 w-5">{idx + 1}.</span>
                      <div>
                        <div className="text-xs font-semibold text-white capitalize">{w.type} Widget</div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          X: {w.x}px • Y: {w.y}px • Width: {w.width}px • Height: {w.height}px
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateWidget(w.id, { isLocked: !w.isLocked })}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                        title={w.isLocked ? 'Unlock position' : 'Lock position'}
                      >
                        {w.isLocked ? <Lock size={13} className="text-amber-400" /> : <Unlock size={13} />}
                      </button>

                      <button
                        onClick={() => handleDeleteWidget(w.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Delete from Desktop"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FLIP CLOCK */}
          {activeTab === 'clock' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white mb-0.5">Flip Clock Settings</h2>
                <p className="text-xs text-neutral-400">Configure time format and mechanical flip card display.</p>
              </div>

              {widgets.filter((w) => w.type === 'clock').map((clockW) => {
                const cfg = clockW.config as any;
                return (
                  <div key={clockW.id} className="p-4 rounded-xl bg-[#15171f] border border-white/[0.06] space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-neutral-300">24-Hour Format</span>
                      <input
                        type="checkbox"
                        checked={cfg.format24}
                        onChange={(e) =>
                          handleUpdateWidget(clockW.id, {
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
                          handleUpdateWidget(clockW.id, {
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

          {/* TAB 4: WEATHER */}
          {activeTab === 'weather' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white mb-0.5">Weather Configuration</h2>
                <p className="text-xs text-neutral-400">Configure local location and forecast options.</p>
              </div>

              {widgets.filter((w) => w.type === 'weather').map((weatherW) => {
                const cfg = weatherW.config as any;
                return (
                  <div key={weatherW.id} className="p-4 rounded-xl bg-[#15171f] border border-white/[0.06] space-y-3">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">City / Region Label</label>
                      <input
                        type="text"
                        value={cfg.city || ''}
                        onChange={(e) =>
                          handleUpdateWidget(weatherW.id, {
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
                            handleUpdateWidget(weatherW.id, {
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
                            handleUpdateWidget(weatherW.id, {
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
                            handleUpdateWidget(weatherW.id, {
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
                            handleUpdateWidget(weatherW.id, {
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

          {/* TAB 5: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white mb-0.5">Calendar Settings</h2>
                <p className="text-xs text-neutral-400">Manage calendar week starts and event reminders.</p>
              </div>

              {widgets.filter((w) => w.type === 'calendar').map((calW) => {
                const cfg = calW.config as any;
                return (
                  <div key={calW.id} className="p-4 rounded-xl bg-[#15171f] border border-white/[0.06] space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-neutral-300">Show Week Numbers on Left</span>
                      <input
                        type="checkbox"
                        checked={cfg.showWeekNumbers}
                        onChange={(e) =>
                          handleUpdateWidget(calW.id, {
                            config: { ...cfg, showWeekNumbers: e.target.checked },
                          })
                        }
                        className="rounded bg-black border-white/20 accent-neutral-300 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-neutral-300">Start Week on Monday</span>
                      <input
                        type="checkbox"
                        checked={cfg.startMonday}
                        onChange={(e) =>
                          handleUpdateWidget(calW.id, {
                            config: { ...cfg, startMonday: e.target.checked },
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

          {/* TAB 6: TO-DO LIST */}
          {activeTab === 'todo' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white mb-0.5">To-Do List Settings</h2>
                <p className="text-xs text-neutral-400">Configure title header and ASCII aesthetic decor.</p>
              </div>

              {widgets.filter((w) => w.type === 'todo').map((todoW) => {
                const cfg = todoW.config as any;
                return (
                  <div key={todoW.id} className="p-4 rounded-xl bg-[#15171f] border border-white/[0.06] space-y-3">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Header Title</label>
                      <input
                        type="text"
                        value={cfg.headerTitle || ''}
                        onChange={(e) =>
                          handleUpdateWidget(todoW.id, {
                            config: { ...cfg, headerTitle: e.target.value },
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-sans text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">ASCII Kaomoji / Decor</label>
                      <input
                        type="text"
                        value={cfg.headerDecor || ''}
                        onChange={(e) =>
                          handleUpdateWidget(todoW.id, {
                            config: { ...cfg, headerDecor: e.target.value },
                          })
                        }
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-sans text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 7: ART PRESETS */}
          {activeTab === 'art' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white mb-0.5">Monochrome Art Presets</h2>
                <p className="text-xs text-neutral-400">Curated high-contrast gothic and film presets.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {ART_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-2.5 rounded-xl bg-[#15171f] border border-white/[0.06] space-y-2 group"
                  >
                    <div className="h-32 rounded-lg overflow-hidden relative">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs font-medium text-neutral-200 truncate">{preset.name}</div>
                    <div className="text-[10px] text-neutral-400">{preset.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: BACKUP & SYSTEM */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Backup, Import & Export</h2>
                <p className="text-xs text-neutral-400">Manage layout JSON files and application lifecycle.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportLayout}
                  className="p-4 rounded-xl bg-[#15171f] hover:bg-[#1e222c] border border-white/[0.06] hover:border-white/20 transition-all text-left flex flex-col justify-between"
                >
                  <Download size={20} className="text-neutral-300 mb-2" />
                  <div>
                    <div className="text-xs font-semibold text-white">Export Layout JSON</div>
                    <div className="text-[11px] text-neutral-400">Save widget positions & configs to a file</div>
                  </div>
                </button>

                <label className="p-4 rounded-xl bg-[#15171f] hover:bg-[#1e222c] border border-white/[0.06] hover:border-white/20 transition-all text-left flex flex-col justify-between cursor-pointer">
                  <Upload size={20} className="text-neutral-300 mb-2" />
                  <div>
                    <div className="text-xs font-semibold text-white">Import Layout JSON</div>
                    <div className="text-[11px] text-neutral-400">Load previously saved layout from file</div>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileImport}
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-amber-300">Reset to Reference Screenshot Layout</div>
                    <div className="text-[11px] text-amber-400/80">Restores all widgets and coordinates to exact reference setup</div>
                  </div>

                  <button
                    onClick={handleResetLayout}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => window.electronAPI?.quitApp()}
                  className="w-full p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Power size={14} />
                  <span>Quit LapWids Background Process</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Save Custom Template Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-[#141720] border border-white/15 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Save Current Setup as Template</h3>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Template Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Neon Workspace"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Tagline / Aesthetic Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focused Dark Setup with 5 Widgets"
                  value={saveTemplateTagline}
                  onChange={(e) => setSaveTemplateTagline(e.target.value)}
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-[11px] text-neutral-400">
                <div className="flex justify-between">
                  <span>Widgets Captured:</span>
                  <span className="font-mono text-neutral-200 font-medium">{widgets.length} widgets</span>
                </div>
                <div className="flex justify-between">
                  <span>Typography Style:</span>
                  <span className="font-mono text-neutral-200 font-medium">{settings.fontFamily || 'Inter'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Background Canvas:</span>
                  <span className="font-mono text-neutral-200 font-medium">{settings.backgroundMode}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-semibold text-black transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

