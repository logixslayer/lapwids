import { WidgetBoard } from './components/WidgetBoard';
import { SettingsApp } from './components/SettingsApp';

export function App() {
  const isSettings = 
    window.location.search.includes('mode=settings') || 
    window.location.hash === '#settings';

  if (isSettings) {
    return <SettingsApp />;
  }

  return (
    <div className="w-full h-full min-h-screen">
      <WidgetBoard />
    </div>
  );
}

export default App;
