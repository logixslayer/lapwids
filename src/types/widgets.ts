export type WidgetType = 'clock' | 'weather' | 'calendar' | 'media' | 'todo' | 'system';

export interface BaseWidgetConfig {
  title?: string;
  opacity?: number;
  scale?: number;
  fontStyle?: string;
  fontSize?: number; // scale multiplier e.g. 0.8 - 1.5, default 1
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'bolder' | string; // font weight e.g. normal, medium, bold, bolder
  fontColor?: string; // hex color or custom color string
  backgroundTransparency?: number; // 0 = default glass card, 1 = 100% invisible background
}

export interface ClockConfig extends BaseWidgetConfig {
  format24: boolean;
  showSeconds: boolean;
  showAmPm: boolean;
  theme: 'dark-slate' | 'matte-black' | 'cyberpunk' | 'monochrome';
  clockType?: 'flip' | 'minimal-digital'; // 'flip' or 'minimal-digital' (digital text with date header)
  showDate?: boolean;
  dateColor?: string; // e.g. '#2563eb' or custom
  dateFontSize?: number; // scale multiplier e.g. 0.8 - 2.0
  dateFontStyle?: string; // custom font family for the date header
  timeColor?: string; // time digits color
  dateFormat?: 'uppercase' | 'normal' | 'short'; // 'WEDNESDAY 21 MAY' etc
  cardBgColor?: string; // custom card background color e.g. '#444444'
}

export interface WeatherConfig extends BaseWidgetConfig {
  city: string;
  latitude: number;
  longitude: number;
  unit: 'fahrenheit' | 'celsius';
  customLocationName?: string;
  tempColor?: string; // Color specifically for temperature degrees text
  iconColor?: string; // Color specifically for weather icons
}

export interface CalendarConfig extends BaseWidgetConfig {
  showWeekNumbers: boolean;
  startMonday: boolean;
  notes?: Record<string, string>; // YYYY-MM-DD -> note
  headerFontStyle?: string; // Font style specifically for Month and Year title
  headerFontColor?: string; // Font color specifically for Month and Year title
  showTodayButton?: boolean; // Whether to display the Today jump button (default false per user request)
  todayColor?: string; // Text color for today's date (defaults to blue)
  showAdjacentDays?: boolean; // Whether to display days from previous/next months (default false per user request)
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
  headerFontSize?: number; // scale multiplier e.g. 0.8 - 1.8
  headerColor?: string; // custom title color
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
      showWidgetContextMenu?: (params: { widgetId: string; isLocked: boolean }) => void;
      onWidgetActionDelete?: (callback: (widgetId: string) => void) => () => void;
      onWidgetActionToggleLock?: (callback: (widgetId: string) => void) => () => void;
      onWidgetActionDuplicate?: (callback: (widgetId: string) => void) => () => void;
      onWidgetActionSettings?: (callback: (widgetId: string) => void) => () => void;
    };
  }
}

