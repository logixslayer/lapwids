import React, { useState } from 'react';
import type { CalendarConfig } from '../../types/widgets';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
  config: CalendarConfig;
  width?: number;
  height?: number;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ config, width, height }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 1, 1));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 1, 21));

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
  const hasWeekNumbers = currentW >= 195 && config.showWeekNumbers !== false;
  const showBottomToday = currentH >= 220;

  // Ultra-compact Day Glance Mode
  if (isUltraCompact) {
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    return (
      <div className="flex flex-col justify-between p-2.5 h-full text-neutral-300 select-none overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1 py-0.5 rounded bg-[#131419]/60 border border-white/[0.04]">
          <button onClick={handlePrevMonth} className="p-0.5 text-neutral-400 hover:text-white">
            <ChevronLeft size={11} />
          </button>
          <span className="font-medium text-neutral-200 text-[10px]">
            {monthNames[month].slice(0, 3)} {year}
          </span>
          <button onClick={handleNextMonth} className="p-0.5 text-neutral-400 hover:text-white">
            <ChevronRight size={11} />
          </button>
        </div>

        {/* Center: Big Day */}
        <div className="flex flex-col items-center justify-center my-auto py-1">
          <span className="text-[32px] font-light text-white leading-none tracking-tight">
            {selectedDate.getDate()}
          </span>
          <span className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-medium">
            {dayName}
          </span>
        </div>

        {/* Mini Today indicator */}
        <div className="flex justify-center">
          <button
            onClick={handleToday}
            className="text-[9px] px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 hover:text-white"
          >
            Today
          </button>
        </div>
      </div>
    );
  }

  // If height is between 150 and 220, or width is tight, scale the grid cleanly so it never clips
  const baseCalH = showBottomToday ? 250 : 210;
  const baseCalW = hasWeekNumbers ? 220 : 190;
  const needsScale = currentH < baseCalH || currentW < baseCalW;
  const scale = needsScale 
    ? Math.min((currentW - 12) / baseCalW, (currentH - 12) / baseCalH)
    : 1;

  const content = (
    <div 
      style={{
        width: `${baseCalW}px`,
        transform: needsScale ? `scale(${scale})` : undefined,
        transformOrigin: 'center center',
      }}
      className="flex flex-col justify-between text-neutral-300 select-none text-[11px]"
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between px-2 py-1 mb-1 rounded-lg bg-white/[0.05] backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        <button
          onClick={handlePrevMonth}
          className="p-0.5 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={12} />
        </button>

        <span className="font-normal text-neutral-200 tracking-wide text-[11px]">
          {monthNames[month]} {year}
        </span>

        <div className="flex items-center gap-1">
          {!showBottomToday && (
            <button
              onClick={handleToday}
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
      <div className={`grid ${hasWeekNumbers ? 'grid-cols-[16px_repeat(7,1fr)]' : 'grid-cols-7'} gap-1 text-center text-[10px] text-neutral-400 pb-1 border-b border-white/[0.05]`}>
        {hasWeekNumbers && <span className="text-neutral-400"></span>}
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
          <div key={wIdx} className={`grid ${hasWeekNumbers ? 'grid-cols-[16px_repeat(7,1fr)]' : 'grid-cols-7'} gap-1 items-center text-center`}>
            {hasWeekNumbers && (
              <span className="text-[9px] text-neutral-400 font-mono">
                {week.weekNumber}
              </span>
            )}

            {/* 7 Days */}
            {week.days.map((dayItem, dIdx) => {
              const isSelected = isSameDay(dayItem.date, selectedDate);
              const isWeekend = dIdx >= 5;

              return (
                <button
                  key={dIdx}
                  onClick={() => setSelectedDate(dayItem.date)}
                  className={`
                    w-5 h-5 mx-auto rounded flex items-center justify-center transition-all text-[10px]
                    ${!dayItem.currentMonth ? 'text-neutral-400 opacity-40' : isWeekend ? 'text-[#e05252]' : 'text-neutral-200'}
                    ${isSelected
                      ? 'border border-white/30 bg-white/20 text-white font-medium shadow-[0_2px_8px_rgba(255,255,255,0.12)] backdrop-blur-sm'
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

      {/* Bottom Center "Today" button if enough height */}
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
