import React, { useState } from 'react';
import type { WidgetInstance, ClockConfig, WeatherConfig, TodoConfig, MediaConfig } from '../types/widgets';
import { X, Sliders, Eye } from 'lucide-react';
import { ART_PRESETS } from '../data/presets';

interface SettingsModalProps {
  widget: WidgetInstance | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newConfig: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  widget,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !widget) return null;

  const [config, setConfig] = useState({ ...widget.config });

  const handleFieldChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(widget.id, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <div className="bg-[#14171e] border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-cyan-400" />
            <h2 className="text-sm font-medium text-white uppercase tracking-wider">
              {widget.type} Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-[13px] text-neutral-300">
          {/* Opacity Control */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-neutral-400 flex items-center gap-1.5">
                <Eye size={13} />
                <span>Card Opacity</span>
              </label>
              <span className="font-mono text-xs">{Math.round((config.opacity ?? 0.95) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={config.opacity ?? 0.95}
              onChange={(e) => handleFieldChange('opacity', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Type Specific Fields */}
          {widget.type === 'clock' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="flex items-center justify-between cursor-pointer">
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
                <label className="text-neutral-400 block mb-1">City / Region Label</label>
                <input
                  type="text"
                  value={(config as WeatherConfig).city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="e.g. New York, London, Tokyo"
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
            </div>
          )}

          {widget.type === 'todo' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-neutral-400 block mb-1">Title Text</label>
                <input
                  type="text"
                  value={(config as TodoConfig).headerTitle || ''}
                  onChange={(e) => handleFieldChange('headerTitle', e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                />
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
                <label className="text-neutral-400 block mb-1.5">Preset Artwork</label>
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
