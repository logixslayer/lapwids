export type WidgetType = 'clock' | 'weather' | 'calendar' | 'media' | 'todo' | 'system';

export interface BaseWidgetConfig {
  title?: string;
  opacity?: number;
  scale?: number;
}

export interface ClockConfig extends BaseWidgetConfig {
  format24: boolean;
  showSeconds: boolean;
  showAmPm: boolean;
  theme: 'dark-slate' | 'matte-black' | 'cyberpunk' | 'monochrome';
}

export interface WeatherConfig extends BaseWidgetConfig {
  city: string;
  latitude: number;
  longitude: number;
  unit: 'fahrenheit' | 'celsius';
  customLocationName?: string;
}

export interface CalendarConfig extends BaseWidgetConfig {
  showWeekNumbers: boolean;
  startMonday: boolean;
  notes?: Record<string, string>; // YYYY-MM-DD -> note
}

export interface MediaConfig extends BaseWidgetConfig {
  imageUrl: string;
  aspectRatio: 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';
  fit: 'cover' | 'contain';
  title?: string;
  caption?: string;
  filter?: 'none' | 'vibrant' | 'warm' | 'cool' | 'cinematic' | 'noir' | 'grayscale' | 'contrast' | 'vintage';
  autoCycle?: boolean;
  cycleIntervalSec?: number;
  galleryUrls?: string[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoConfig extends BaseWidgetConfig {
  headerTitle: string; // e.g. "to be list: ˚ʚ♡ɞ˚"
  items: TodoItem[];
  headerDecor: string;
}

export interface SystemMonitorConfig extends BaseWidgetConfig {
  showCpu: boolean;
  showMemory: boolean;
  showStorage: boolean;
  showBattery: boolean;
}

export type AnyWidgetConfig = 
  | ClockConfig 
  | WeatherConfig 
  | CalendarConfig 
  | MediaConfig 
  | TodoConfig 
  | SystemMonitorConfig;

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  config: AnyWidgetConfig;
}

export interface AppSettings {
  backgroundMode: 'transparent' | 'solid-dark' | 'mesh-gradient' | 'wallpaper' | 'desktop-mimic';
  wallpaperPreset?: 'renaissance' | 'smoke' | 'none';
  customWallpaperUrl?: string;
  gridSnap: boolean;
  gridSnapSize: number;
  lockAll: boolean;
  accentColor: string;
  globalScale: number;
  isPinnedBehind?: boolean;
  fontFamily?: string;
}

export interface DesktopTemplate {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  wallpaperUrl?: string;
  wallpaperPreset?: 'renaissance' | 'smoke' | 'none';
  backgroundMode?: AppSettings['backgroundMode'];
  fontFamily: string;
  accentColor: string;
  widgets: WidgetInstance[];
  isCustom?: boolean;
}

declare global {
  interface Window {
    electronAPI?: {
      openSettings?: () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      setAlwaysOnTop: (flag: boolean) => void;
      pinToDesktop: (flag: boolean) => void;
      moveBottom?: () => void;
      moveTop?: () => void;
      setIgnoreMouseEvents: (ignore: boolean, forward?: boolean) => void;
      quitApp: () => void;
      syncSettings?: (settings: AppSettings) => void;
      onSettingsSync?: (callback: (settings: AppSettings) => void) => () => void;
      syncWidgets?: (widgets: WidgetInstance[]) => void;
      onWidgetsSync?: (callback: (widgets: WidgetInstance[]) => void) => () => void;
    };
  }
}

