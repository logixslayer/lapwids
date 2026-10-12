import React, { useState, useEffect } from 'react';
import type { ClockConfig } from '../../types/widgets';

interface MinimalDigitalClockProps {
  config: ClockConfig;
  width?: number;
  height?: number;
}

export const MinimalDigitalClockWidget: React.FC<MinimalDigitalClockProps> = ({ config, width, height }) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let hoursNum = time.getHours();
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';

  if (!config.format24) {
    hoursNum = hoursNum % 12 || 12;
  }

  const hoursStr = String(hoursNum).padStart(2, '0');
  const minutesStr = String(time.getMinutes()).padStart(2, '0');
  const secondsStr = String(time.getSeconds()).padStart(2, '0');

  // Format Date: e.g. "WEDNESDAY 21 MAY"
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const dayName = dayNames[time.getDay()];
  const dateNum = time.getDate();
  const monthName = monthNames[time.getMonth()];
  const dateString = `${dayName} ${dateNum} ${monthName}`;

  // Default colors from the requested image design:
  // Background: warm graphite gray (#4a4b49 or rgba(74, 75, 73, ...))
  // Date header: rich vibrant blue (#2255a4 or config.dateColor)
  // Digits: soft clean white/cream (#e8eaed or config.fontColor / config.timeColor)
  // AM/PM: clean sans bold / medium
  const effectiveDateColor = config.dateColor || '#1d4ed8'; // deep vibrant royal blue matching image
  const effectiveTimeColor = config.fontColor || config.timeColor || '#f1f3f5';
  const customCardBg = config.cardBgColor || '#46484a';

  // Compute ideal content dimensions based on active display options
  const hasAmPm = config.showAmPm !== false && !config.format24;
  const baseW = config.showSeconds ? 320 : hasAmPm ? 250 : 210;
  const baseH = config.showDate !== false ? 95 : 75;

  const currentW = width ?? (baseW + 20);
  const currentH = height ?? (baseH + 20);

  const fontMultiplier = config.fontSize ?? 1;
  // Uniform scale so content fills the card while respecting margins
  const scale = Math.min((currentW - 16) / baseW, (currentH - 14) / baseH) * fontMultiplier;
  const finalScale = Math.max(0.3, Math.min(scale, 4.0));

  const bgTransparency = config.backgroundTransparency ?? 0;
  const isFullyInvisible = bgTransparency >= 0.99;

  const dateFontMultiplier = config.dateFontSize ?? 1;

  return (
    <div 
      className="w-full h-full flex items-center justify-center select-none overflow-hidden p-1"
      style={{
        backgroundColor: isFullyInvisible ? 'transparent' : customCardBg,
      }}
    >
      <div
        style={{
          width: `${baseW}px`,
          height: `${baseH}px`,
          transform: `scale(${finalScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s ease-out',
        }}
        className="flex-shrink-0 flex flex-col justify-center px-2 py-1"
      >
        {/* Date Row (e.g. MONDAY 12 OCT) */}
        {config.showDate !== false && (
          <div 
            style={{ 
              color: effectiveDateColor,
              fontFamily: config.dateFontStyle ? `'${config.dateFontStyle}', sans-serif` : undefined,
              fontSize: `${13.5 * dateFontMultiplier}px`,
            }}
            className="font-semibold tracking-wider uppercase leading-none mb-1 select-none truncate"
          >
            <span>{dateString}</span>
          </div>
        )}

        {/* Time Row (e.g. 08:27 PM or 21:05) */}
        {(() => {
          const effectiveFontWeight = config.fontWeight === 'bolder' ? '800' : config.fontWeight === 'bold' ? '700' : config.fontWeight === 'medium' ? '500' : config.fontWeight === 'normal' ? '400' : config.fontWeight || '700';
          return (
            <div className="flex items-baseline leading-none select-none whitespace-nowrap">
              <div 
                style={{ 
                  color: effectiveTimeColor,
                  fontWeight: effectiveFontWeight,
                }}
                className="text-[58px] tracking-tight leading-none flex items-center shrink-0"
              >
                <span>{hoursStr}</span>
                <span className="mx-0.5 relative -top-1 opacity-90">:</span>
                <span>{minutesStr}</span>
                {config.showSeconds && (
                  <>
                    <span className="mx-0.5 relative -top-1 opacity-90">:</span>
                    <span className="text-[40px] opacity-90">{secondsStr}</span>
                  </>
                )}
              </div>

              {/* AM / PM badge */}
              {hasAmPm && (
                <span 
                  style={{ 
                    color: effectiveTimeColor,
                    fontWeight: effectiveFontWeight,
                  }}
                  className="text-[25px] tracking-tight uppercase leading-none opacity-95 ml-1.5 self-baseline shrink-0"
                >
                  {ampm}
                </span>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
