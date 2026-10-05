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
      showWeekNumbers: true,
      startMonday: true,
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
