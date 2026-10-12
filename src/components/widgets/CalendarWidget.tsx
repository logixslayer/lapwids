import React, { useState } from 'react';
import type { CalendarConfig } from '../../types/widgets';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
  config: CalendarConfig;
  width?: number;
  height?: number;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ config, width, height }) => {
  // Always default to today's real current date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Keep today's date updated in case day rolls over
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // If day changed, keep selectedDate and view synced
      setSelectedDate((prev) => {
        if (prev.getDate() !== now.getDate() || prev.getMonth() !== now.getMonth() || prev.getFullYear() !== now.getFullYear()) {
          setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
          return now;
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Generate days grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Calculate day of week offset for Monday start (0: Mon, ..., 6: Sun)
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const daysInMonth = lastDayOfMonth.getDate();
  
  // Previous month padding
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const prevDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevDays.push({
      day: prevMonthLastDate - i,
      currentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDate - i),
    });
  }

  // Current month days
  const currentDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push({
      day: i,
      currentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month padding
  const totalCellsNeeded = Math.ceil((prevDays.length + currentDays.length) / 7) * 7;
  const nextDaysCount = totalCellsNeeded - (prevDays.length + currentDays.length);
  const nextDays = [];
  for (let i = 1; i <= nextDaysCount; i++) {
    nextDays.push({
      day: i,
      currentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const allDays = [...prevDays, ...currentDays, ...nextDays];

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push({
      weekNumber: getWeekNumber(allDays[i].date),
      days: allDays.slice(i, i + 7),
    });
  }

  function getWeekNumber(d: Date): number {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const currentW = width ?? 230;
  const currentH = height ?? 260;

  const isUltraCompact = currentH < 150 || currentW < 145;
  // Only show Today button if explicitly enabled (default false per user request)
  const showTodayButton = config.showTodayButton === true;
  const showBottomToday = showTodayButton && currentH >= 220;

  // Real today reference
  const realToday = new Date();
  const todayHighlightColor = config.todayColor || '#38bdf8'; // Blue highlight color

  // Ultra-compact Day Glance Mode
  if (isUltraCompact) {
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = isSameDay(selectedDate, realToday);
    return (
      <div className="flex flex-col justify-between p-2.5 h-full text-neutral-300 select-none overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1 py-0.5 rounded bg-[#131419]/60 border border-white/[0.04]">
          <button onClick={handlePrevMonth} className="p-0.5 text-neutral-400 hover:text-white">
            <ChevronLeft size={11} />
          </button>
          <span 
            style={{ 
              fontFamily: config.headerFontStyle ? `'${config.headerFontStyle}', sans-serif` : undefined,
              color: config.headerFontColor || config.fontColor || undefined
            }}
            className="font-medium text-neutral-200 text-[10px]"
          >
            {monthNames[month].slice(0, 3)} {year}
          </span>
          <button onClick={handleNextMonth} className="p-0.5 text-neutral-400 hover:text-white">
            <ChevronRight size={11} />
          </button>
        </div>

        {/* Center: Big Day */}
        <div className="flex flex-col items-center justify-center my-auto py-1">
          <span 
            style={{ color: isToday ? todayHighlightColor : undefined }}
            className={`text-[32px] font-light leading-none tracking-tight ${isToday ? 'font-medium' : 'text-white'}`}
          >
            {selectedDate.getDate()}
          </span>
          <span className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-medium">
            {dayName}
          </span>
        </div>

        {/* Mini Today indicator only if explicitly turned on */}
        {showTodayButton && (
          <div className="flex justify-center">
            <button
              onClick={handleToday}
              className="text-[9px] px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 hover:text-white"
            >
              Today
            </button>
          </div>
        )}
      </div>
    );
  }

  // If height is between 150 and 220, or width is tight, scale the grid cleanly so it never clips
  const fontMultiplier = config.fontSize ?? 1;
  const baseCalH = showBottomToday ? 250 : 210;
  const baseCalW = 195;
  const needsScale = currentH < baseCalH || currentW < baseCalW || fontMultiplier !== 1;
  const scale = (needsScale 
    ? Math.min((currentW - 12) / baseCalW, (currentH - 12) / baseCalH)
    : 1) * fontMultiplier;

  const bgTransparency = config.backgroundTransparency ?? 0;
  const isFullyInvisible = bgTransparency >= 0.99;

    const effectiveFontWeight = config.fontWeight === 'bolder' ? '800' : config.fontWeight === 'bold' ? '700' : config.fontWeight === 'medium' ? '500' : config.fontWeight === 'normal' ? '400' : config.fontWeight || undefined;

    const content = (
    <div 
      style={{
        width: `${baseCalW}px`,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'center center',
        fontWeight: effectiveFontWeight,
      }}
      className="flex flex-col justify-between text-neutral-300 select-none text-[11px]"
    >
      {/* Month & Year Navigation Header */}
      <div className={`flex items-center justify-between px-2 py-1 mb-1 rounded-lg ${
        isFullyInvisible 
          ? 'bg-transparent border-transparent shadow-none' 
          : 'bg-white/[0.05] backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
      }`}>
        <button
          onClick={handlePrevMonth}
          className="p-0.5 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={12} />
        </button>

        <span 
          style={{ 
            fontFamily: config.headerFontStyle ? `'${config.headerFontStyle}', sans-serif` : undefined,
            color: config.headerFontColor || config.fontColor || undefined,
            fontWeight: effectiveFontWeight || '500',
          }}
          className="tracking-wide text-[11px]"
        >
          {monthNames[month]} {year}
        </span>

        <div className="flex items-center gap-1">
          {showTodayButton && !showBottomToday && (
            <button
              onClick={handleToday}
              style={{ color: config.fontColor || undefined }}
              className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] hover:bg-white/[0.15] text-neutral-200 transition-colors border border-white/[0.08]"
            >
              Today
            </button>
          )}
          <button
            onClick={handleNextMonth}
            className="p-0.5 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Weekday headers: M T W T F S S */}
      <div 
        style={{ 
          color: config.fontColor ? `${config.fontColor}99` : undefined,
          fontWeight: effectiveFontWeight,
        }}
        className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400 pb-1 border-b border-white/[0.05]"
      >
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span className="text-[#e05252]">S</span>
        <span className="text-[#e05252]">S</span>
      </div>

      {/* Days Grid */}
      <div className="space-y-0.5 my-1">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1 items-center text-center">

            {/* 7 Days */}
            {week.days.map((dayItem, dIdx) => {
              if (!dayItem.currentMonth && config.showAdjacentDays !== true) {
                return <div key={dIdx} className="w-5 h-5 mx-auto" />;
              }

              const isToday = isSameDay(dayItem.date, realToday);
              const isSelected = isSameDay(dayItem.date, selectedDate);
              const isWeekend = dIdx >= 5;

              return (
                <button
                  key={dIdx}
                  onClick={() => setSelectedDate(dayItem.date)}
                  style={{
                    color: isToday
                      ? todayHighlightColor
                      : isSelected && !isToday
                      ? '#ffffff'
                      : !dayItem.currentMonth
                      ? undefined
                      : isWeekend
                      ? undefined
                      : config.fontColor || undefined,
                  }}
                  className={`
                    w-5 h-5 mx-auto rounded flex items-center justify-center transition-all text-[10px]
                    ${!dayItem.currentMonth ? 'text-neutral-500 opacity-40' : isWeekend ? 'text-[#e05252]' : 'text-neutral-200'}
                    ${isToday 
                      ? 'font-bold' 
                      : isSelected 
                      ? 'font-semibold text-white' 
                      : 'hover:bg-white/10 active:bg-white/20'}
                  `}
                >
                  {dayItem.day}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Center "Today" button only if explicitly enabled */}
      {showBottomToday && (
        <div className="flex items-center justify-center pt-1 border-t border-white/[0.04]">
          <button
            onClick={handleToday}
            className="px-3 py-0.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-[10px] text-neutral-200 border border-white/[0.1] backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full p-2.5 flex items-center justify-center overflow-hidden">
      {content}
    </div>
  );
};
