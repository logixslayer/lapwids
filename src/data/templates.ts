import type { DesktopTemplate, WidgetInstance } from '../types/widgets';
import { INITIAL_WIDGETS } from './presets';

export const BUILTIN_TEMPLATES: DesktopTemplate[] = [
  {
    id: 'template-porsche-001',
    name: 'Porsche 001',
    tagline: 'Precision Engineering & Monochrome Noir',
    category: 'Performance Noir',
    description: 'Minimalist high-performance desktop aesthetics inspired by Porsche engineering. Features classical typography, deep glassmorphic widgets, and balanced telemetry layout.',
    fontFamily: 'Outfit',
    accentColor: '#d4af37',
    widgets: INITIAL_WIDGETS,
  },
  {
    id: 'template-mhfg',
    name: 'MHFG',
    tagline: 'Modern Tactical HUD & Focus Layout',
    category: 'Tactical Studio',
    description: 'Precision coordinated setup featuring high-contrast clock, telemetry weather, full monthly agenda, and integrated focus log.',
    fontFamily: 'Orbitron',
    accentColor: '#06b6d4',
    widgets: [
      {
        id: 'widget-mhfg-clock',
        type: 'clock',
        x: 30,
        y: 25,
        width: 280,
        height: 130,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        config: {
          format24: true,
          showSeconds: true,
          showAmPm: false,
          theme: 'dark-slate',
          opacity: 0.95,
          scale: 1,
        },
      },
      {
        id: 'widget-mhfg-weather',
        type: 'weather',
        x: 30,
        y: 170,
        width: 280,
        height: 140,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        config: {
          city: 'MHFG HQ',
          latitude: 35.6762,
          longitude: 139.6503,
          unit: 'celsius',
          customLocationName: 'MHFG Telemetry / 14°C',
          opacity: 0.95,
          scale: 1,
        },
      },
      {
        id: 'widget-mhfg-calendar',
        type: 'calendar',
        x: 30,
        y: 325,
        width: 280,
        height: 250,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        config: {
          showWeekNumbers: true,
          startMonday: true,
          opacity: 0.95,
        },
      },
      {
        id: 'widget-mhfg-todo',
        type: 'todo',
        x: 330,
        y: 25,
        width: 250,
        height: 250,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        config: {
          headerTitle: 'MHFG OPS LOG:',
          headerDecor: '// 0x7F',
          items: [
            { id: '1', text: 'Calibrate Telemetry Sensors', completed: true },
            { id: '2', text: 'Synchronize Flight Path', completed: false },
            { id: '3', text: 'System Diagnostics Check', completed: false },
          ],
          opacity: 0.95,
        },
      },
      {
        id: 'widget-mhfg-media',
        type: 'media',
        x: 330,
        y: 290,
        width: 250,
        height: 285,
        zIndex: 9,
        isLocked: false,
        isVisible: true,
        config: {
          imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          aspectRatio: 'portrait',
          fit: 'cover',
          filter: 'contrast',
          title: 'MHFG // PROTOCOL',
          opacity: 0.95,
        },
      },
    ],
  },
];

const CUSTOM_TEMPLATES_KEY = 'lapwids_custom_templates_v1';

export function loadCustomTemplates(): DesktopTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load custom templates:', err);
  }
  return [];
}

export function saveCustomTemplate(template: DesktopTemplate): DesktopTemplate[] {
  const existing = loadCustomTemplates().filter((t) => t.id !== template.id);
  const updated = [template, ...existing];
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom template:', err);
  }
  return updated;
}

export function deleteCustomTemplate(id: string): DesktopTemplate[] {
  const existing = loadCustomTemplates().filter((t) => t.id !== id);
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to delete custom template:', err);
  }
  return existing;
}
