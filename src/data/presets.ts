import type { WidgetInstance } from '../types/widgets';

export const ART_PRESETS = [
  {
    id: 'shark-monochrome',
    name: 'Meg Shark Depth',
    category: 'Gothic / Dark Nature',
    url: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=600&q=80',
    filter: 'noir' as const,
  },
  {
    id: 'bat-graphic',
    name: 'Nocturnal Bat Art',
    category: 'Illustration',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    filter: 'contrast' as const,
  },
  {
    id: 'vintage-portrait',
    name: 'Vintage Noir Portrait',
    category: 'Vintage',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    filter: 'grayscale' as const,
  },
  {
    id: 'weeping-angel',
    name: 'Stone Angel Statue',
    category: 'Classical Goth',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    filter: 'noir' as const,
  },
  {
    id: 'stage-performance',
    name: 'Monochrome Motion',
    category: 'Cinematic',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    filter: 'grayscale' as const,
  },
  {
    id: 'cyber-neo-os',
    name: 'NEO_OS // 2099',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    filter: 'contrast' as const,
  },
  {
    id: 'lofi-midnight',
    name: 'Midnight Coffee & City',
    category: 'Lo-Fi Aesthetic',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    filter: 'vintage' as const,
  },
  {
    id: 'editorial-exhibition',
    name: 'Exhibition N° 1 Gallery',
    category: 'Fine Art Museum',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    filter: 'noir' as const,
  },
  {
    id: 'sculptural-studies',
    name: 'Sculptural Studies',
    category: 'Fine Art Museum',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    filter: 'grayscale' as const,
  },
];

export const CLOCK_STYLE_PRESETS = [
  {
    id: 'digital-date-time',
    name: 'Digital Time & Date',
    description: 'Header with weekday, day, month and bold time digits',
    config: {
      clockType: 'minimal-digital' as const,
      format24: false,
      showSeconds: false,
      showAmPm: true,
      showDate: true,
      dateColor: '#2563eb',
      timeColor: '#f1f3f5',
      cardBgColor: '#46484a',
      fontStyle: 'Inter',
    },
  },
  {
    id: 'classic-12h',
    name: 'Classic 12H Flip',
    description: '12-hour AM/PM mechanical split card',
    config: { clockType: 'flip' as const, format24: false, showSeconds: false, showAmPm: true, fontStyle: '' },
  },
  {
    id: 'cyber-hud',
    name: 'Cyberpunk 24H HUD',
    description: '24-hour seconds display with Orbitron font',
    config: { format24: true, showSeconds: true, showAmPm: false, fontStyle: 'Orbitron' },
  },
  {
    id: 'minimal-nordic',
    name: 'Nordic Minimalist',
    description: 'Clean compact time with Outfit font',
    config: { format24: false, showSeconds: false, showAmPm: true, fontStyle: 'Outfit' },
  },
  {
    id: 'developer-mono',
    name: 'Developer Terminal',
    description: '24-hour seconds with JetBrains Mono',
    config: { format24: true, showSeconds: true, showAmPm: false, fontStyle: 'JetBrains Mono' },
  },
  {
    id: 'lofi-handwritten',
    name: 'Lo-Fi Dreamy',
    description: 'Soft 12-hour display with Caveat font',
    config: { format24: false, showSeconds: false, showAmPm: true, fontStyle: 'Caveat' },
  },
];

export const WEATHER_STYLE_PRESETS = [
  {
    id: 'default-noir',
    name: 'Noir Reference',
    description: 'New York overcast clouds in Fahrenheit',
    config: { city: 'New York', customLocationName: 'Overcast clouds', unit: 'fahrenheit' as const, latitude: 40.7128, longitude: -74.0060, fontStyle: '' },
  },
  {
    id: 'cyber-telemetry',
    name: 'Cyberpunk Acid Rain',
    description: 'Night City acid rain telemetry in Celsius with Orbitron',
    config: { city: 'Night City', customLocationName: 'Acid Rain / 14°C', unit: 'celsius' as const, latitude: 35.6762, longitude: 139.6503, fontStyle: 'Orbitron' },
  },
  {
    id: 'nordic-mist',
    name: 'Nordic Mist Stockholm',
    description: 'Stockholm cool mist in Celsius with Outfit',
    config: { city: 'Stockholm', customLocationName: 'Nordic Mist', unit: 'celsius' as const, latitude: 59.3293, longitude: 18.0686, fontStyle: 'Outfit' },
  },
  {
    id: 'dev-clear',
    name: 'Dev Studio SF',
    description: 'San Francisco clear sky with JetBrains Mono',
    config: { city: 'San Francisco', customLocationName: 'Clear Sky', unit: 'celsius' as const, latitude: 37.7749, longitude: -122.4194, fontStyle: 'JetBrains Mono' },
  },
  {
    id: 'tokyo-shibuya',
    name: 'Tokyo Night Lo-Fi',
    description: 'Rainy Shibuya atmospheric weather with Caveat',
    config: { city: 'Tokyo', customLocationName: 'Rainy Shibuya', unit: 'celsius' as const, latitude: 35.6762, longitude: 139.6503, fontStyle: 'Caveat' },
  },
];

export const CALENDAR_STYLE_PRESETS = [
  {
    id: 'gothic-standard',
    name: 'Gothic Classical',
    description: 'Clean gothic font with Monday start',
    config: { showWeekNumbers: false, startMonday: true, fontStyle: 'Cinzel', todayColor: '#38bdf8' },
  },
  {
    id: 'cyber-matrix',
    name: 'Cyberpunk Grid',
    description: 'Tech style with Orbitron font and blue active date',
    config: { showWeekNumbers: false, startMonday: true, fontStyle: 'Orbitron', todayColor: '#38bdf8' },
  },
  {
    id: 'minimal-clean',
    name: 'Nordic Clean',
    description: 'Compact clean layout with Outfit font',
    config: { showWeekNumbers: false, startMonday: true, fontStyle: 'Outfit', todayColor: '#38bdf8' },
  },
  {
    id: 'dev-sprint',
    name: 'Developer Sprint Calendar',
    description: 'Sprint week tracking with JetBrains Mono',
    config: { showWeekNumbers: false, startMonday: true, fontStyle: 'JetBrains Mono', todayColor: '#38bdf8' },
  },
  {
    id: 'editorial-serif',
    name: 'Editorial Museum',
    description: 'Playfair Display serif date matrix',
    config: { showWeekNumbers: false, startMonday: true, fontStyle: 'Playfair Display', todayColor: '#38bdf8' },
  },
];

export const TODO_STYLE_PRESETS = [
  {
    id: 'gothic-list',
    name: 'Gothic To-Be List',
    description: 'Classical "to be list: ˚ʚ♡ɞ˚"',
    config: {
      headerTitle: 'to be list:',
      headerDecor: '˚ʚ♡ɞ˚',
      fontStyle: 'Cinzel',
      items: [
        { id: '1', text: 'Digital Camera', completed: false },
        { id: '2', text: 'Biology Text book', completed: false },
      ],
    },
  },
  {
    id: 'cyber-netrunner',
    name: 'Netrunner Log',
    description: 'High-tech sci-fi tasks with Orbitron',
    config: {
      headerTitle: 'NETRUNNER LOG:',
      headerDecor: '// 0x7F',
      fontStyle: 'Orbitron',
      items: [
        { id: '1', text: 'Bypass Arasaka Subnet', completed: true },
        { id: '2', text: 'Calibrate Cyberware Optic', completed: false },
        { id: '3', text: 'Download ICEbreaker firmware', completed: false },
      ],
    },
  },
  {
    id: 'nordic-focus',
    name: 'Nordic Daily Focus',
    description: 'Distraction-free minimalism with Outfit',
    config: {
      headerTitle: 'daily focus:',
      headerDecor: '—',
      fontStyle: 'Outfit',
      items: [
        { id: '1', text: 'Morning Espresso', completed: true },
        { id: '2', text: 'Deep Work Session', completed: false },
        { id: '3', text: 'Evening Reading', completed: false },
      ],
    },
  },
  {
    id: 'dev-backlog',
    name: 'Developer Backlog',
    description: 'Sprint git commits with JetBrains Mono',
    config: {
      headerTitle: 'sprint backlog:',
      headerDecor: 'git commit',
      fontStyle: 'JetBrains Mono',
      items: [
        { id: '1', text: 'Optimize render loop', completed: true },
        { id: '2', text: 'Electron IPC benchmark', completed: false },
        { id: '3', text: 'Push release tags', completed: false },
      ],
    },
  },
  {
    id: 'lofi-beats',
    name: 'Lo-Fi Beats List',
    description: 'Cozy handwritten vibe with Caveat',
    config: {
      headerTitle: 'lo-fi beats list:',
      headerDecor: '☁️ ♫',
      fontStyle: 'Caveat',
      items: [
        { id: '1', text: 'Listen to jazz hop', completed: true },
        { id: '2', text: 'Draw doodle sketches', completed: false },
        { id: '3', text: 'Warm green tea', completed: false },
      ],
    },
  },
];

export const INITIAL_WIDGETS: WidgetInstance[] = [
  // 1. Flip Clock Widget (Top Left)
  {
    id: 'widget-clock-1',
    type: 'clock',
    x: 30,
    y: 25,
    width: 230,
    height: 130,
    zIndex: 10,
    isLocked: false,
    isVisible: true,
    config: {
      format24: false,
      showSeconds: false,
      showAmPm: true,
      theme: 'dark-slate',
      opacity: 1,
      scale: 1,
    }
  },
  // 2. Weather Widget (Below Clock)
  {
    id: 'widget-weather-1',
    type: 'weather',
    x: 30,
    y: 170,
    width: 230,
    height: 230,
    zIndex: 10,
    isLocked: false,
    isVisible: true,
    config: {
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      unit: 'fahrenheit',
      customLocationName: 'Overcast clouds',
      opacity: 1,
      scale: 1,
    }
  },
  // 3. Calendar Widget (Below Weather)
  {
    id: 'widget-calendar-1',
    type: 'calendar',
    x: 30,
    y: 415,
    width: 230,
    height: 260,
    zIndex: 10,
    isLocked: false,
    isVisible: true,
    config: {
      showWeekNumbers: false,
      startMonday: true,
      todayColor: '#38bdf8',
      notes: {
        '2026-02-21': 'Selected',
      },
      opacity: 1,
      scale: 1,
    }
  },
  // 4. Vertical Frame (Shark)
  {
    id: 'widget-media-shark',
    type: 'media',
    x: 275,
    y: 25,
    width: 195,
    height: 310,
    zIndex: 9,
    isLocked: false,
    isVisible: true,
    config: {
      imageUrl: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 'portrait',
      fit: 'cover',
      filter: 'noir',
      opacity: 1,
    }
  },
  // 5. Square Bat Art Frame (Below Shark)
  {
    id: 'widget-media-bat',
    type: 'media',
    x: 275,
    y: 350,
    width: 200,
    height: 220,
    zIndex: 9,
    isLocked: false,
    isVisible: true,
    config: {
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 'square',
      fit: 'cover',
      filter: 'contrast',
      opacity: 1,
    }
  },
  // 6. To-Do List Widget (Top Right Area)
  {
    id: 'widget-todo-1',
    type: 'todo',
    x: 490,
    y: 25,
    width: 215,
    height: 170,
    zIndex: 10,
    isLocked: false,
    isVisible: true,
    config: {
      headerTitle: 'to be list:',
      headerDecor: '˚ʚ♡ɞ˚',
      items: [
        { id: '1', text: 'Digital Camera', completed: false },
        { id: '2', text: 'Biology Text book', completed: false },
      ],
      opacity: 1,
    }
  },
  // 7. Middle Square Frame (Retro Portrait)
  {
    id: 'widget-media-portrait',
    type: 'media',
    x: 490,
    y: 210,
    width: 160,
    height: 160,
    zIndex: 9,
    isLocked: false,
    isVisible: true,
    config: {
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 'square',
      fit: 'cover',
      filter: 'grayscale',
      opacity: 1,
    }
  },
  // 8. Angel Statue Frame (with '00')
  {
    id: 'widget-media-angel',
    type: 'media',
    x: 490,
    y: 385,
    width: 160,
    height: 160,
    zIndex: 9,
    isLocked: false,
    isVisible: true,
    config: {
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 'square',
      fit: 'cover',
      filter: 'noir',
      title: '00',
      opacity: 1,
    }
  },
  // 9. Horizontal Stage/Cinematic Frame
  {
    id: 'widget-media-wide',
    type: 'media',
    x: 490,
    y: 560,
    width: 160,
    height: 95,
    zIndex: 9,
    isLocked: false,
    isVisible: true,
    config: {
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 'landscape',
      fit: 'cover',
      filter: 'grayscale',
      opacity: 1,
    }
  }
];
