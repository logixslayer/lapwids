import React, { useState, useEffect } from 'react';
import type { ClockConfig } from '../../types/widgets';

interface FlipClockProps {
  config: ClockConfig;
  width?: number;
  height?: number;
}

export const FlipClockWidget: React.FC<FlipClockProps> = ({ config, width, height }) => {
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

  // Base dimensions of the standard clock casing
  const baseW = config.showSeconds ? 310 : 220;
  const baseH = 112;

  const currentW = width ?? 230;
  const currentH = height ?? 130;

  // Compute uniform scale so it always fits perfectly with margin, factoring in user fontSize multiplier
  const fontMultiplier = config.fontSize ?? 1;
  const scale = Math.min((currentW - 16) / baseW, (currentH - 16) / baseH) * fontMultiplier;
  const finalScale = Math.max(0.2, Math.min(scale, 4.0));

  const bgTransparency = config.backgroundTransparency ?? 0;
  const isFullyInvisible = bgTransparency >= 0.99;

  const casingBg = isFullyInvisible
    ? 'bg-transparent border-transparent shadow-none'
    : bgTransparency > 0
    ? `bg-black/${Math.round(40 * (1 - bgTransparency))} border-white/[${(0.08 * (1 - bgTransparency)).toFixed(2)}]`
    : 'bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.5)]';

  const cardBg = isFullyInvisible
    ? 'bg-transparent border-transparent shadow-none'
    : bgTransparency > 0
    ? `bg-[#161822]/${Math.round(80 * (1 - bgTransparency))} border-white/[${(0.12 * (1 - bgTransparency)).toFixed(2)}]`
    : 'bg-[#161822]/80 backdrop-blur-md border border-white/[0.12] shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)]';

  return (
    <div className="w-full h-full flex items-center justify-center select-none overflow-hidden p-1">
      <div
        style={{
          transform: `scale(${finalScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s ease-out',
        }}
        className="flex-shrink-0"
      >
        {/* Outer casing */}
        <div className={`relative flex items-center justify-center gap-2 p-2 rounded-2xl ${casingBg}`}>
        {/* Left Side Casing Ear/Hinge */}
        {!isFullyInvisible && (
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-white/[0.08] backdrop-blur-sm rounded-l-md border-l border-y border-white/[0.1]" />
        )}
        {/* Right Side Casing Ear/Hinge */}
        {!isFullyInvisible && (
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-white/[0.08] backdrop-blur-sm rounded-r-md border-r border-y border-white/[0.1]" />
        )}

        {/* Hours Card */}
        {(() => {
          const effectiveFontWeight = config.fontWeight === 'bolder' ? '800' : config.fontWeight === 'bold' ? '700' : config.fontWeight === 'medium' ? '500' : config.fontWeight === 'normal' ? '400' : config.fontWeight || '300';
          return (
            <>
              <div className={`w-[94px] h-[96px] ${cardBg} rounded-xl flex items-center justify-center relative overflow-hidden`}>
                {/* Horizontal center split cut */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#0c0d12] z-20 shadow-[0_1px_1px_rgba(255,255,255,0.06)]" />
                
                {/* Top Half subtle shade */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] pointer-events-none z-10" />

                {/* Digit Text */}
                <span 
                  style={{ 
                    color: config.fontColor || '#f0f2f5',
                    fontWeight: effectiveFontWeight,
                  }}
                  className="text-[58px] tracking-tight z-10 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  {hoursStr}
                </span>
              </div>

              {/* Minutes Card */}
              <div className={`w-[94px] h-[96px] ${cardBg} rounded-xl flex items-center justify-center relative overflow-hidden`}>
                {/* Horizontal center split cut */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#0c0d12] z-20 shadow-[0_1px_1px_rgba(255,255,255,0.06)]" />
                
                {/* Top Half subtle shade */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] pointer-events-none z-10" />

                {/* Digit Text */}
                <span 
                  style={{ 
                    color: config.fontColor || '#f0f2f5',
                    fontWeight: effectiveFontWeight,
                  }}
                  className="text-[58px] tracking-tight z-10 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  {minutesStr}
                </span>

                {/* AM / PM in bottom right */}
                {config.showAmPm !== false && !config.format24 && (
                  <span 
                    style={{ 
                      color: config.fontColor ? `${config.fontColor}cc` : undefined,
                      fontWeight: effectiveFontWeight,
                    }}
                    className="absolute bottom-1.5 right-2 text-[10px] text-neutral-400 z-20 uppercase tracking-wider"
                  >
                    {ampm}
                  </span>
                )}
              </div>

              {/* Optional Seconds Card */}
              {config.showSeconds && (
                <div className={`w-[68px] h-[96px] ${cardBg} rounded-xl flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#0c0d12] z-20 shadow-[0_1px_1px_rgba(255,255,255,0.06)]" />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] pointer-events-none z-10" />
                  <span 
                    style={{ 
                      color: config.fontColor || '#f0f2f5',
                      fontWeight: effectiveFontWeight,
                    }}
                    className="text-[44px] tracking-tight z-10 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    {secondsStr}
                  </span>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  </div>
);
};
