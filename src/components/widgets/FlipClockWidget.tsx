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

  // Compute uniform scale so it always fits perfectly with margin
  const scale = Math.min((currentW - 16) / baseW, (currentH - 16) / baseH);
  const finalScale = Math.max(0.3, Math.min(scale, 3.5));

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
        <div className="relative flex items-center justify-center gap-2 p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.5)]">
        {/* Left Side Casing Ear/Hinge */}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-white/[0.08] backdrop-blur-sm rounded-l-md border-l border-y border-white/[0.1]" />
        {/* Right Side Casing Ear/Hinge */}
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-white/[0.08] backdrop-blur-sm rounded-r-md border-r border-y border-white/[0.1]" />

        {/* Hours Card */}
        <div className="w-[94px] h-[96px] bg-[#161822]/80 backdrop-blur-md rounded-xl border border-white/[0.12] shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] flex items-center justify-center relative overflow-hidden">
          {/* Horizontal center split cut */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#0c0d12] z-20 shadow-[0_1px_1px_rgba(255,255,255,0.06)]" />
          
          {/* Top Half subtle shade */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] pointer-events-none z-10" />

          {/* Digit Text */}
          <span className="text-[58px] font-light tracking-tight text-[#f0f2f5] z-10 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {hoursStr}
          </span>
        </div>

        {/* Minutes Card */}
        <div className="w-[94px] h-[96px] bg-[#161822]/80 backdrop-blur-md rounded-xl border border-white/[0.12] shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] flex items-center justify-center relative overflow-hidden">
          {/* Horizontal center split cut */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#0c0d12] z-20 shadow-[0_1px_1px_rgba(255,255,255,0.06)]" />
          
          {/* Top Half subtle shade */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] pointer-events-none z-10" />

          {/* Digit Text */}
          <span className="text-[58px] font-light tracking-tight text-[#f0f2f5] z-10 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {minutesStr}
          </span>

          {/* AM / PM in bottom right */}
          {config.showAmPm !== false && !config.format24 && (
            <span className="absolute bottom-1.5 right-2 text-[10px] font-medium text-neutral-400 z-20 uppercase tracking-wider">
              {ampm}
            </span>
          )}
        </div>

        {/* Optional Seconds Card */}
        {config.showSeconds && (
          <div className="w-[68px] h-[96px] bg-[#161822]/80 backdrop-blur-md rounded-xl border border-white/[0.12] shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#0c0d12] z-20 shadow-[0_1px_1px_rgba(255,255,255,0.06)]" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] pointer-events-none z-10" />
            <span className="text-[44px] font-light tracking-tight text-[#f0f2f5] z-10 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {secondsStr}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);
};
