import React, { useState, useEffect } from 'react';
import type { WidgetInstance, ClockConfig, WeatherConfig, CalendarConfig, TodoConfig, MediaConfig } from '../types/widgets';
import { X, Sliders, Eye, Type, Sparkles, Palette } from 'lucide-react';
import { ART_PRESETS } from '../data/presets';

interface SettingsModalProps {
  widget: WidgetInstance | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newConfig: any) => void;
  onUpdateDimensions?: (id: string, newWidth: number, newHeight: number) => void;
}

const AVAILABLE_FONTS = [
  { id: '', label: 'Default (Global Theme Font)' },
  { id: 'Inter', label: 'Inter (Clean & Modern)' },
  { id: 'Poppins', label: 'Poppins (Soft & Friendly)' },
  { id: 'Outfit', label: 'Outfit (Sleek Geometric)' },
  { id: 'Nunito', label: 'Nunito (Rounded Elegance)' },
  { id: 'Orbitron', label: 'Orbitron (Sci-Fi HUD)' },
  { id: 'Playfair Display', label: 'Playfair Display (Editorial Serif)' },
  { id: 'Cinzel', label: 'Cinzel (Roman Classical)' },
  { id: 'Caveat', label: 'Caveat (Handwritten Lo-Fi)' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Developer)' },
];

const FONT_COLOR_PRESETS = [
  { name: 'Default', value: '' },
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Soft Cream', value: '#f4ede4' },
  { name: 'Cyan Neon', value: '#22d3ee' },
  { name: 'Emerald', value: '#34d399' },
  { name: 'Amber Gold', value: '#fbbf24' },
  { name: 'Rose Coral', value: '#fb7185' },
  { name: 'Electric Violet', value: '#a78bfa' },
  { name: 'Slate Gray', value: '#94a3b8' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  widget,
  isOpen,
  onClose,
  onSave,
  onUpdateDimensions,
}) => {
  if (!isOpen || !widget) return null;

  const [config, setConfig] = useState({ ...widget.config });

  useEffect(() => {
    if (widget) {
      setConfig({ ...widget.config });
    }
  }, [widget]);

  const handleFieldChange = (key: string, value: any) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      if (widget) {
        onSave(widget.id, next);
      }
      return next;
    });
  };

  const handleFontSizeChange = (newMultiplier: number) => {
    const oldMultiplier = config.fontSize ?? 1;
    handleFieldChange('fontSize', newMultiplier);

    // Dynamically adjust widget container size proportionally so contents never get cramped
    if (onUpdateDimensions && widget && oldMultiplier > 0) {
      const ratio = newMultiplier / oldMultiplier;
      const targetW = Math.round(Math.max(140, widget.width * ratio));
      const targetH = Math.round(Math.max(80, widget.height * ratio));
      onUpdateDimensions(widget.id, targetW, targetH);
    }
  };

  const handleSave = () => {
    onSave(widget.id, config);
    onClose();
  };

  const bgTransparency = config.backgroundTransparency ?? 0;
  const cardOpacity = config.opacity ?? 0.95;
  const fontSizeMultiplier = config.fontSize ?? 1;

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[110] p-4 select-none"
      onClick={onClose}
    >
      <div 
        className="bg-[#14171e] border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {widget.type} Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-[13px] text-neutral-300">
          {/* Visual Appearance Section */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3.5">
            <div className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Appearance & Transparency</span>
            </div>

            {/* Background Transparency (0% to 100% invisible) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <span>Background Transparency</span>
                </label>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-cyan-300">
                  {Math.round(bgTransparency * 100)}%{bgTransparency >= 0.98 ? ' (Invisible)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgTransparency}
                onChange={(e) => handleFieldChange('backgroundTransparency', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5 font-mono">
                <span>Default Glass</span>
                <span className="text-cyan-400">100% Transparent</span>
              </div>
            </div>

            {/* Overall Opacity Control */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Eye size={13} />
                  <span>Widget Opacity</span>
                </label>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neutral-200">
                  {Math.round(cardOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={cardOpacity}
                onChange={(e) => handleFieldChange('opacity', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Font Style */}
            <div>
              <label className="text-neutral-300 font-medium flex items-center gap-1.5 mb-1.5">
                <Type size={13} />
                <span>Font Style</span>
              </label>
              <select
                value={config.fontStyle || ''}
                onChange={(e) => handleFieldChange('fontStyle', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-cyan-400"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.id} style={{ fontFamily: font.id || 'inherit' }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Weight */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Type size={13} className="text-cyan-400" />
                  <span>Font Weight</span>
                </label>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neutral-200 capitalize">
                  {config.fontWeight || 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Bold', value: 'bold' },
                  { label: 'Bolder', value: 'bolder' },
                ].map((wt) => {
                  const isSelected = (config.fontWeight || 'normal') === wt.value;
                  return (
                    <button
                      key={wt.value}
                      type="button"
                      onClick={() => handleFieldChange('fontWeight', wt.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs transition-all border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                          : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {wt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Scaling */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <span>Font / Text Size</span>
                </label>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neutral-200">
                  {Math.round(fontSizeMultiplier * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.8"
                step="0.05"
                value={fontSizeMultiplier}
                onChange={(e) => handleFontSizeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5 font-mono">
                <span>75% (Small)</span>
                <span>100%</span>
                <span>160% (Large)</span>
              </div>
            </div>

            {/* Font Color */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Palette size={13} className="text-cyan-400" />
                  <span>{widget.type === 'clock' ? 'Time / Digits Font Color' : 'Font Color'}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={config.fontColor || '#ffffff'}
                    onChange={(e) => handleFieldChange('fontColor', e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                    title="Choose custom font color"
                  />
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neutral-200 uppercase">
                    {config.fontColor || 'Theme'}
                  </span>
                  {config.fontColor && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('fontColor', '')}
                      className="text-[10px] text-neutral-400 hover:text-white underline ml-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Color Swatches */}
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {FONT_COLOR_PRESETS.map((preset) => {
                  const isSelected = (config.fontColor || '') === preset.value;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleFieldChange('fontColor', preset.value)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] transition-all truncate ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 text-white font-medium'
                          : 'border-white/10 bg-black/40 text-neutral-300 hover:bg-white/5'
                      }`}
                      title={preset.name}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/20"
                        style={{ backgroundColor: preset.value || '#e5e5e5' }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Type Specific Fields & Presets */}
          {widget.type === 'clock' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              {/* Digital Mode Specific Settings */}
              {(config as ClockConfig).clockType === 'minimal-digital' && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="text-xs font-semibold text-cyan-300 font-mono uppercase tracking-wider flex items-center justify-between">
                    <span>Date Header & Typography</span>
                  </div>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-neutral-200">Show Date Header (e.g. MONDAY 12 OCT)</span>
                    <input
                      type="checkbox"
                      checked={(config as ClockConfig).showDate !== false}
                      onChange={(e) => handleFieldChange('showDate', e.target.checked)}
                      className="rounded bg-black/40 border-white/20 accent-cyan-400"
                    />
                  </label>

                  {/* Date Font Family */}
                  <div>
                    <label className="text-neutral-300 text-xs block mb-1">Date Font Family</label>
                    <select
                      value={(config as ClockConfig).dateFontStyle || ''}
                      onChange={(e) => handleFieldChange('dateFontStyle', e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-white text-xs font-sans focus:outline-none focus:border-cyan-400"
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font.id} value={font.id} style={{ fontFamily: font.id || 'inherit' }}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Size & Color Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-neutral-300 text-xs">Date Size</label>
                        <span className="font-mono text-[11px] text-cyan-300">
                          {Math.round(((config as ClockConfig).dateFontSize || 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.8"
                        step="0.05"
                        value={(config as ClockConfig).dateFontSize || 1}
                        onChange={(e) => handleFieldChange('dateFontSize', parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-300 text-xs block mb-1">Date Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={(config as ClockConfig).dateColor || '#2563eb'}
                          onChange={(e) => handleFieldChange('dateColor', e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                        />
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neutral-200 uppercase truncate">
                          {(config as ClockConfig).dateColor || '#2563EB'}
                        </span>
                        {(config as ClockConfig).dateColor && (
                          <button
                            type="button"
                            onClick={() => handleFieldChange('dateColor', '#2563eb')}
                            className="text-[10px] text-neutral-400 hover:text-white underline ml-0.5"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center justify-between cursor-pointer pt-1">
                <span>24-Hour Format</span>
                <input
                  type="checkbox"
                  checked={(config as ClockConfig).format24}
                  onChange={(e) => handleFieldChange('format24', e.target.checked)}
                  className="rounded bg-black/40 border-white/20 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Show Seconds</span>
                <input
                  type="checkbox"
                  checked={(config as ClockConfig).showSeconds}
                  onChange={(e) => handleFieldChange('showSeconds', e.target.checked)}
                  className="rounded bg-black/40 border-white/20 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Show AM/PM Badge</span>
                <input
                  type="checkbox"
                  checked={(config as ClockConfig).showAmPm}
                  onChange={(e) => handleFieldChange('showAmPm', e.target.checked)}
                  className="rounded bg-black/40 border-white/20 accent-cyan-400"
                />
              </label>
            </div>
          )}

          {widget.type === 'weather' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-neutral-400 block mb-1.5 font-medium">Weather Style Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'Noir NY Reference', city: 'New York', loc: 'Overcast clouds', u: 'fahrenheit', lat: 40.7128, lon: -74.006, font: '' },
                    { name: 'Cyber Acid Rain', city: 'Night City', loc: 'Acid Rain / 14°C', u: 'celsius', lat: 35.6762, lon: 139.6503, font: 'Orbitron' },
                    { name: 'Nordic Mist Stockholm', city: 'Stockholm', loc: 'Nordic Mist', u: 'celsius', lat: 59.3293, lon: 18.0686, font: 'Outfit' },
                    { name: 'Developer SF', city: 'San Francisco', loc: 'Clear Sky', u: 'celsius', lat: 37.7749, lon: -122.4194, font: 'JetBrains Mono' },
                    { name: 'Tokyo Night Lo-Fi', city: 'Tokyo', loc: 'Rainy Shibuya', u: 'celsius', lat: 35.6762, lon: 139.6503, font: 'Caveat' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleFieldChange('city', p.city);
                        handleFieldChange('customLocationName', p.loc);
                        handleFieldChange('unit', p.u);
                        handleFieldChange('latitude', p.lat);
                        handleFieldChange('longitude', p.lon);
                        if (p.font) handleFieldChange('fontStyle', p.font);
                      }}
                      className="p-2 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.04] text-left transition-all"
                    >
                      <div className="text-xs font-medium text-white">{p.name}</div>
                      <div className="text-[10px] text-neutral-400">{p.loc} • {p.u === 'celsius' ? '°C' : '°F'}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">City / Region Label</label>
                <input
                  type="text"
                  value={(config as WeatherConfig).city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="e.g. New York, London, Tokyo"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Custom Status Description</label>
                <input
                  type="text"
                  value={(config as WeatherConfig).customLocationName || ''}
                  onChange={(e) => handleFieldChange('customLocationName', e.target.value)}
                  placeholder="e.g. Acid Rain / 14°C or Overcast clouds"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={(config as WeatherConfig).latitude}
                    onChange={(e) => handleFieldChange('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={(config as WeatherConfig).longitude}
                    onChange={(e) => handleFieldChange('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Temperature Unit</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('unit', 'fahrenheit')}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        (config as WeatherConfig).unit === 'fahrenheit'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('unit', 'celsius')}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        (config as WeatherConfig).unit === 'celsius'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                  </div>
                </div>

                {/* Temperature Degrees Color */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                    <Palette size={13} className="text-cyan-400" />
                    <span>Temperature (° Degrees) Color</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={(config as WeatherConfig).tempColor || config.fontColor || '#ffffff'}
                      onChange={(e) => handleFieldChange('tempColor', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                      title="Choose custom temperature degree color"
                    />
                    {(config as WeatherConfig).tempColor && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('tempColor', '')}
                        className="text-[10px] text-neutral-400 hover:text-white underline font-mono"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Weather Icon Color */}
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                    <Palette size={13} className="text-amber-400" />
                    <span>Weather Icon Color</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={(config as WeatherConfig).iconColor || config.fontColor || '#e5e5e5'}
                      onChange={(e) => handleFieldChange('iconColor', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                      title="Choose custom weather icon color"
                    />
                    {(config as WeatherConfig).iconColor && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('iconColor', '')}
                        className="text-[10px] text-neutral-400 hover:text-white underline font-mono"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          {widget.type === 'calendar' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-neutral-400 block mb-1.5 font-medium">Calendar Style Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'Gothic Classical', weekNums: true, mon: true, font: 'Cinzel' },
                    { name: 'Cyberpunk Grid', weekNums: true, mon: true, font: 'Orbitron' },
                    { name: 'Nordic Clean', weekNums: false, mon: true, font: 'Outfit' },
                    { name: 'Dev Sprint Matrix', weekNums: true, mon: true, font: 'JetBrains Mono' },
                    { name: 'Editorial Serif', weekNums: false, mon: true, font: 'Playfair Display' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleFieldChange('showWeekNumbers', p.weekNums);
                        handleFieldChange('startMonday', p.mon);
                        if (p.font) handleFieldChange('fontStyle', p.font);
                      }}
                      className="p-2 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.04] text-left transition-all"
                    >
                      <div className="text-xs font-medium text-white">{p.name}</div>
                      <div className="text-[10px] text-neutral-400">{p.weekNums ? 'Week Nums' : 'Minimal'} • {p.font}</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-1">
                <span>Show Week Numbers on Left</span>
                <input
                  type="checkbox"
                  checked={(config as CalendarConfig).showWeekNumbers === true}
                  onChange={(e) => handleFieldChange('showWeekNumbers', e.target.checked)}
                  className="rounded bg-black/40 border-white/20 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Start Week on Monday</span>
                <input
                  type="checkbox"
                  checked={(config as CalendarConfig).startMonday !== false}
                  onChange={(e) => handleFieldChange('startMonday', e.target.checked)}
                  className="rounded bg-black/40 border-white/20 accent-cyan-400"
                />
              </label>

              {/* Month / Year Title Font Style */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <label className="text-neutral-300 font-medium flex items-center justify-between">
                  <span>Month & Year Title Font</span>
                  {(config as CalendarConfig).headerFontStyle && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('headerFontStyle', '')}
                      className="text-[10px] text-neutral-400 hover:text-white underline font-mono"
                    >
                      Use Base Font
                    </button>
                  )}
                </label>
                <select
                  value={(config as CalendarConfig).headerFontStyle || ''}
                  onChange={(e) => handleFieldChange('headerFontStyle', e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Same as Calendar Font</option>
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.id} value={font.id} style={{ fontFamily: font.id || 'inherit' }}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month / Year Title Font Color */}
              <div className="flex items-center justify-between">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Palette size={13} className="text-cyan-400" />
                  <span>Month & Year Title Color</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={(config as CalendarConfig).headerFontColor || '#ffffff'}
                    onChange={(e) => handleFieldChange('headerFontColor', e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                    title="Choose custom title color"
                  />
                  {(config as CalendarConfig).headerFontColor && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('headerFontColor', '')}
                      className="text-[10px] text-neutral-400 hover:text-white underline font-mono"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Today Date Text Highlight Color */}
              <div className="flex items-center justify-between">
                <label className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Palette size={13} className="text-blue-400" />
                  <span>Today's Date Text Color</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={(config as CalendarConfig).todayColor || '#38bdf8'}
                    onChange={(e) => handleFieldChange('todayColor', e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                    title="Choose custom today date color"
                  />
                  {(config as CalendarConfig).todayColor && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('todayColor', '')}
                      className="text-[10px] text-neutral-400 hover:text-white underline font-mono"
                    >
                      Reset (Blue)
                    </button>
                  )}
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-1">
                <span>Show "Today" Button</span>
                <input
                  type="checkbox"
                  checked={(config as CalendarConfig).showTodayButton === true}
                  onChange={(e) => handleFieldChange('showTodayButton', e.target.checked)}
                  className="rounded bg-black/40 border-white/20 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Show Adjacent Month Dates</span>
                <input
                  type="checkbox"
                  checked={(config as CalendarConfig).showAdjacentDays === true}
                  onChange={(e) => handleFieldChange('showAdjacentDays', e.target.checked)}
                  className="rounded bg-black/40 border-white/20 accent-cyan-400"
                />
              </label>
            </div>
          )}

          {widget.type === 'todo' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-neutral-400 block mb-1.5 font-medium">To-Do Style Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'Gothic To-Be List', title: 'to be list:', decor: '˚ʚ♡ɞ˚', font: 'Cinzel' },
                    { name: 'Netrunner Log', title: 'NETRUNNER LOG:', decor: '// 0x7F', font: 'Orbitron' },
                    { name: 'Nordic Focus', title: 'daily focus:', decor: '—', font: 'Outfit' },
                    { name: 'Dev Sprint Backlog', title: 'sprint backlog:', decor: 'git commit', font: 'JetBrains Mono' },
                    { name: 'Lo-Fi Beats List', title: 'lo-fi beats list:', decor: '☁️ ♫', font: 'Caveat' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleFieldChange('headerTitle', p.title);
                        handleFieldChange('headerDecor', p.decor);
                        if (p.font) handleFieldChange('fontStyle', p.font);
                      }}
                      className="p-2 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.04] text-left transition-all"
                    >
                      <div className="text-xs font-medium text-white">{p.name}</div>
                      <div className="text-[10px] text-neutral-400">{p.decor} • {p.font}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Title Text</label>
                <input
                  type="text"
                  value={(config as TodoConfig).headerTitle || ''}
                  onChange={(e) => handleFieldChange('headerTitle', e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>

              {/* Title Font Size & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-neutral-400">Title Size</label>
                    <span className="font-mono text-[11px] text-cyan-300">
                      {Math.round(((config as TodoConfig).headerFontSize || 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.8"
                    step="0.05"
                    value={(config as TodoConfig).headerFontSize || 1}
                    onChange={(e) => handleFieldChange('headerFontSize', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Title Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={(config as TodoConfig).headerColor || '#ffffff'}
                      onChange={(e) => handleFieldChange('headerColor', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                    />
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neutral-200 uppercase truncate">
                      {(config as TodoConfig).headerColor || 'Default'}
                    </span>
                    {(config as TodoConfig).headerColor && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('headerColor', '')}
                        className="text-[10px] text-neutral-400 hover:text-white underline ml-0.5"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Aesthetic ASCII Decor</label>
                <input
                  type="text"
                  value={(config as TodoConfig).headerDecor || ''}
                  onChange={(e) => handleFieldChange('headerDecor', e.target.value)}
                  placeholder="e.g. ˚ʚ♡ɞ˚ or ♰ ♱ or ✦"
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {widget.type === 'media' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-neutral-400 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={(config as MediaConfig).imageUrl || ''}
                  onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Visual Filter Style</label>
                <select
                  value={(config as MediaConfig).filter || 'noir'}
                  onChange={(e) => handleFieldChange('filter', e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-white text-xs font-mono"
                >
                  <option value="none">None (Natural Color)</option>
                  <option value="grayscale">Grayscale Smooth</option>
                  <option value="contrast">High Contrast Ink</option>
                  <option value="noir">Gothic Dark Noir</option>
                  <option value="vintage">Vintage Sepia</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1.5">Preset Artwork (from all styles)</label>
                <div className="grid grid-cols-3 gap-2">
                  {ART_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        handleFieldChange('imageUrl', preset.url);
                        handleFieldChange('filter', preset.filter);
                        handleFieldChange('title', preset.name.toUpperCase());
                      }}
                      className="group relative h-16 rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400 transition-all"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover grayscale group-hover:scale-110 transition-transform" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] font-mono text-neutral-300 truncate px-1 py-0.5">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg hover:bg-white/10 text-neutral-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-lg shadow-cyan-900/30"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
