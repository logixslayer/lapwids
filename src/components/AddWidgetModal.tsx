import React from 'react';
import type { WidgetType, WidgetInstance, AnyWidgetConfig } from '../types/widgets';
import { Clock, CloudSun, Calendar as CalIcon, Image, CheckSquare, X, Sparkles } from 'lucide-react';
import { ART_PRESETS } from '../data/presets';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (newWidget: Omit<WidgetInstance, 'id' | 'zIndex'>) => void;
}

interface TemplateItem {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  width: number;
  height: number;
  config: AnyWidgetConfig;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAddWidget }) => {
  if (!isOpen) return null;

  const widgetTemplates: TemplateItem[] = [
    {
      type: 'clock',
      title: 'Digital Time & Date',
      description: 'Clean modern clock with weekday, date and AM/PM',
      icon: Clock,
      width: 280,
      height: 125,
      config: {
        clockType: 'minimal-digital',
        format24: false,
        showSeconds: false,
        showAmPm: true,
        showDate: true,
        dateColor: '#2563eb',
        timeColor: '#f1f3f5',
        cardBgColor: '#46484a',
        theme: 'dark-slate',
        opacity: 0.95,
      },
    },
    {
      type: 'clock',
      title: 'Flip Clock',
      description: 'Vintage split-card mechanical clock with AM/PM',
      icon: Clock,
      width: 250,
      height: 140,
      config: {
        clockType: 'flip',
        format24: false,
        showSeconds: false,
        showAmPm: true,
        theme: 'dark-slate',
        opacity: 0.95,
      },
    },
    {
      type: 'weather',
      title: 'Weather & Forecast',
      description: 'Live conditions with 5-day forecast columns',
      icon: CloudSun,
      width: 250,
      height: 250,
      config: {
        city: 'New York',
        latitude: 40.7128,
        longitude: -74.006,
        unit: 'fahrenheit',
        customLocationName: 'Overcast clouds',
        opacity: 0.95,
      },
    },
    {
      type: 'calendar',
      title: 'Monthly Calendar',
      description: 'Calendar matrix with week indices and today quick jump',
      icon: CalIcon,
      width: 250,
      height: 275,
      config: {
        showWeekNumbers: true,
        startMonday: true,
        notes: {},
        opacity: 0.95,
      },
    },
    {
      type: 'todo',
      title: 'To-Be List / Sticky Note',
      description: 'Aesthetic checklist with cute goth header tags',
      icon: CheckSquare,
      width: 220,
      height: 180,
      config: {
        headerTitle: 'to be list:',
        headerDecor: '˚ʚ♡ɞ˚',
        items: [
          { id: '1', text: 'Daily Priorities', completed: false },
          { id: '2', text: 'Study session', completed: false },
        ],
        opacity: 0.95,
      },
    },
    {
      type: 'media',
      title: 'Vertical Poster Frame',
      description: 'High-contrast vertical art / photo display',
      icon: Image,
      width: 200,
      height: 330,
      config: {
        imageUrl: ART_PRESETS[0].url,
        aspectRatio: 'portrait',
        fit: 'cover',
        filter: 'noir',
        title: 'DEPTH',
        opacity: 0.95,
      },
    },
    {
      type: 'media',
      title: 'Square Media Frame',
      description: 'Square aesthetic photo / gothic illustration frame',
      icon: Image,
      width: 220,
      height: 220,
      config: {
        imageUrl: ART_PRESETS[1].url,
        aspectRatio: 'square',
        fit: 'cover',
        filter: 'contrast',
        title: 'BAT INK',
        opacity: 0.95,
      },
    },
  ];

  const handleSelect = (tmpl: TemplateItem) => {
    // Center new widget roughly in view
    const spawnX = 100 + Math.floor(Math.random() * 150);
    const spawnY = 80 + Math.floor(Math.random() * 100);

    onAddWidget({
      type: tmpl.type,
      x: spawnX,
      y: spawnY,
      width: tmpl.width,
      height: tmpl.height,
      isLocked: false,
      isVisible: true,
      config: tmpl.config,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#14171e] border border-white/15 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-cyan-400" />
            <h2 className="text-base font-medium text-white">Add Widget to Desktop</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Catalog Grid */}
        <div className="p-5 grid grid-cols-2 gap-3.5 max-h-[70vh] overflow-y-auto">
          {widgetTemplates.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-cyan-300 group-hover:scale-105 transition-transform">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white group-hover:text-cyan-200 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
