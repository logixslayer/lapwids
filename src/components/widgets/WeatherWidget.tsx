import React, { useState, useEffect } from 'react';
import type { WeatherConfig } from '../../types/widgets';
import { Cloud, CloudRain, CloudSun, Sun, CloudFog, CloudLightning, Snowflake } from 'lucide-react';

interface WeatherWidgetProps {
  config: WeatherConfig;
  width?: number;
  height?: number;
}

interface ForecastDay {
  day: string;
  code: number;
  tempMax: number;
  tempMin: number;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ config, width, height }) => {
  const [currentTemp, setCurrentTemp] = useState<number>(68);
  const [conditionText, setConditionText] = useState<string>(config?.customLocationName || 'Overcast clouds');
  const [windSpeed, setWindSpeed] = useState<number>(5);
  const [weatherCode, setWeatherCode] = useState<number>(3);
  const [forecast, setForecast] = useState<ForecastDay[]>([
    { day: 'Fri', code: 3, tempMax: 68, tempMin: 52 },
    { day: 'Sat', code: 61, tempMax: 65, tempMin: 50 },
    { day: 'Sun', code: 61, tempMax: 62, tempMin: 48 },
    { day: 'Mon', code: 2, tempMax: 66, tempMin: 50 },
    { day: 'Tue', code: 0, tempMax: 70, tempMin: 53 },
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const lat = config?.latitude ?? 40.7128;
        const lon = config?.longitude ?? -74.0060;
        const tempUnit = config?.unit === 'celsius' ? 'celsius' : 'fahrenheit';
        const windUnit = config?.unit === 'celsius' ? 'kmh' : 'mph';
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&forecast_days=5&timezone=auto`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        
        if (isMounted && data.current && data.daily) {
          setCurrentTemp(Math.round(data.current.temperature_2m));
          setWindSpeed(Math.round(data.current.wind_speed_10m));
          setWeatherCode(data.current.weather_code);
          setConditionText(config?.customLocationName || getWmoDescription(data.current.weather_code));
          
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const newForecast: ForecastDay[] = data.daily.time.map((timeStr: string, idx: number) => {
            const dateObj = new Date(timeStr + 'T00:00:00');
            return {
              day: daysOfWeek[dateObj.getDay()],
              code: data.daily.weather_code[idx],
              tempMax: Math.round(data.daily.temperature_2m_max[idx]),
              tempMin: Math.round(data.daily.temperature_2m_min[idx]),
            };
          });
          setForecast(newForecast);
        }
      } catch (err) {
        console.warn('Using offline/cached weather data', err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config?.latitude, config?.longitude, config?.unit, config?.customLocationName]);

  const effectiveTempColor = config?.tempColor || config?.fontColor || '#ffffff';
  const effectiveIconColor = config?.iconColor || config?.fontColor || undefined;

  // Clean minimalist weather icons with dynamic iconColor support
  const getWeatherIcon = (code: number, size = 20) => {
    const iconStyle = effectiveIconColor ? { color: effectiveIconColor } : undefined;
    const defaultClass = effectiveIconColor ? '' : 'text-neutral-200';

    if (code === 0) return <Sun size={size} style={iconStyle} className={defaultClass} strokeWidth={1.5} />;
    if (code === 1 || code === 2) return <CloudSun size={size} style={iconStyle} className={defaultClass} strokeWidth={1.5} />;
    if (code === 3) return <Cloud size={size} style={iconStyle} className={defaultClass} strokeWidth={1.5} />;
    if (code >= 45 && code <= 48) return <CloudFog size={size} style={iconStyle} className={effectiveIconColor ? '' : 'text-neutral-300'} strokeWidth={1.5} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return (
        <div className="flex flex-col items-center">
          <Cloud size={size} style={iconStyle} className={defaultClass} strokeWidth={1.5} />
          <div className="flex gap-0.5 mt-0.5">
            <span style={iconStyle ? { backgroundColor: effectiveIconColor } : undefined} className="w-0.5 h-1 bg-cyan-400/80 rounded-full" />
            <span style={iconStyle ? { backgroundColor: effectiveIconColor } : undefined} className="w-0.5 h-1 bg-cyan-400/80 rounded-full" />
            <span style={iconStyle ? { backgroundColor: effectiveIconColor } : undefined} className="w-0.5 h-1 bg-cyan-400/80 rounded-full" />
          </div>
        </div>
      );
    }
    if (code >= 71 && code <= 77) return <Snowflake size={size} style={iconStyle} className={defaultClass} strokeWidth={1.5} />;
    if (code >= 95) return <CloudLightning size={size} style={iconStyle} className={defaultClass} strokeWidth={1.5} />;
    return <CloudRain size={size} style={iconStyle} className={defaultClass} strokeWidth={1.5} />;
  };

  const getWmoDescription = (code: number): string => {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast clouds';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Light drizzle';
    if (code >= 61 && code <= 65) return 'Rain showers';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 95) return 'Thunderstorm';
    return 'Overcast clouds';
  };

  const unitSymbol = '°';
  const windUnit = config?.unit === 'celsius' ? 'km/h' : 'mph';

  const currentW = width ?? 230;
  const currentH = height ?? 230;

  // Compact mode: when widget is small, show only temperature + icon
  const isCompact = currentW < 170 || currentH < 160;

  const effectiveFontWeight = config?.fontWeight === 'bolder' ? '800' : config?.fontWeight === 'bold' ? '700' : config?.fontWeight === 'medium' ? '500' : config?.fontWeight === 'normal' ? '400' : config?.fontWeight || undefined;

  if (isCompact) {
    const compactBaseW = 100;
    const compactBaseH = 80;
    const compactScale = Math.min((currentW - 8) / compactBaseW, (currentH - 8) / compactBaseH);
    const finalCompactScale = Math.max(0.5, Math.min(compactScale, 3.0));

    return (
      <div className="w-full h-full flex items-center justify-center select-none overflow-hidden">
        <div
          style={{
            width: `${compactBaseW}px`,
            height: `${compactBaseH}px`,
            transform: `scale(${finalCompactScale})`,
            transformOrigin: 'center center',
          }}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-1 text-neutral-300"
        >
          <div>
            {getWeatherIcon(weatherCode, 28)}
          </div>
          <div 
            style={{ 
              color: effectiveTempColor,
              fontWeight: effectiveFontWeight || '300',
            }}
            className="text-[32px] tracking-tight leading-none"
          >
            {currentTemp}{unitSymbol}
          </div>
          <div 
            style={{ fontWeight: effectiveFontWeight }}
            className="text-[9px] text-neutral-400 truncate max-w-[90px] text-center"
          >
            {conditionText}
          </div>
        </div>
      </div>
    );
  }

  // Check if user stretched the widget into a wide horizontal banner
  const isWideBanner = currentW >= 240 && currentH <= 165;

  const fontMultiplier = config.fontSize ?? 1;

  if (isWideBanner) {
    const bannerW = 280;
    const bannerH = 120;
    const bannerScale = Math.min((currentW - 12) / bannerW, (currentH - 12) / bannerH) * fontMultiplier;
    const finalBannerScale = Math.max(0.3, Math.min(bannerScale, 3.5));

    return (
      <div className="w-full h-full flex items-center justify-center select-none overflow-hidden p-1">
        <div
          style={{
            width: `${bannerW}px`,
            height: `${bannerH}px`,
            transform: `scale(${finalBannerScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out',
          }}
          className="flex-shrink-0 flex items-center justify-between p-3 text-neutral-300"
        >
          {/* Left: Current Weather */}
          <div className="flex items-center gap-3 shrink-0 pr-3 border-r border-white/[0.06]">
            <div>
              {getWeatherIcon(weatherCode, 34)}
            </div>
            <div>
              <div 
                style={{ 
                  color: effectiveTempColor,
                  fontWeight: effectiveFontWeight || '300',
                }}
                className="text-[30px] tracking-tight leading-none"
              >
                {currentTemp}{unitSymbol}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Wind: {windSpeed} {windUnit}
              </div>
              <div 
                style={{ 
                  color: config.fontColor || undefined,
                  fontWeight: effectiveFontWeight || '500',
                }}
                className="text-[11px] text-neutral-200 truncate max-w-[90px] mt-0.5"
              >
                {conditionText}
              </div>
            </div>
          </div>

          {/* Right: 5-Day Forecast Grid */}
          <div className="grid grid-cols-5 gap-2 text-center pl-2">
            {forecast.slice(0, 5).map((f, i) => (
              <div key={i} className="flex flex-col items-center">
                <span 
                  style={{ fontWeight: effectiveFontWeight }}
                  className="text-[10px] text-neutral-400 mb-0.5"
                >
                  {f.day}
                </span>
                <div className="h-5 flex items-center justify-center my-0.5">
                  {getWeatherIcon(f.code, 15)}
                </div>
                <div 
                  style={{ 
                    color: effectiveTempColor,
                    fontWeight: effectiveFontWeight,
                  }}
                  className="text-[11px] font-normal"
                >
                  {f.tempMax}°
                </div>
                <div 
                  style={{ fontWeight: effectiveFontWeight }}
                  className="text-[9px] font-normal text-neutral-500"
                >
                  {f.tempMin}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Standard square / portrait layout with uniform auto-scaling
  const baseW = 215;
  const baseH = 205;
  const scale = Math.min((currentW - 12) / baseW, (currentH - 12) / baseH) * fontMultiplier;
  const finalScale = Math.max(0.3, Math.min(scale, 4.0));

  return (
    <div className="w-full h-full flex items-center justify-center select-none overflow-hidden p-1">
      <div
        style={{
          width: `${baseW}px`,
          height: `${baseH}px`,
          transform: `scale(${finalScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s ease-out',
        }}
        className="flex-shrink-0 flex flex-col justify-between p-3.5 text-neutral-300"
      >
        {/* Top Section: Icon, Temperature, Wind and Condition */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              {getWeatherIcon(weatherCode, 38)}
            </div>

            <div>
              <div 
                style={{ 
                  color: effectiveTempColor,
                  fontWeight: effectiveFontWeight || '300',
                }}
                className="text-[34px] tracking-tight leading-none"
              >
                {currentTemp}{unitSymbol}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Wind: {windSpeed} {windUnit}
              </div>
            </div>
          </div>

          <div 
            style={{ 
              color: config.fontColor || undefined,
              fontWeight: effectiveFontWeight || '500',
            }}
            className="text-[12px] text-neutral-200 text-right max-w-[95px] leading-tight"
          >
            {conditionText}
          </div>
        </div>

        {/* 5-Day Forecast Grid */}
        <div className="py-1">
          <div className="grid grid-cols-5 gap-1 text-center">
            {forecast.slice(0, 5).map((f, i) => (
              <div key={i} className="flex flex-col items-center">
                <span 
                  style={{ fontWeight: effectiveFontWeight }}
                  className="text-[11px] text-neutral-400 mb-0.5"
                >
                  {f.day}
                </span>
                <div className="h-6 flex items-center justify-center my-0.5">
                  {getWeatherIcon(f.code, 16)}
                </div>
                <div 
                  style={{ 
                    color: effectiveTempColor,
                    fontWeight: effectiveFontWeight,
                  }}
                  className="text-[12px] font-normal"
                >
                  {f.tempMax}°
                </div>
                <div 
                  style={{ fontWeight: effectiveFontWeight }}
                  className="text-[10px] font-normal text-neutral-500"
                >
                  {f.tempMin}°
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="text-right text-[8px] text-neutral-500">
          Powered by Weatherbit.io
        </div>
      </div>
    </div>
  );
};
