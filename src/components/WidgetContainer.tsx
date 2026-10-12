import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { WidgetInstance } from '../types/widgets';
import { FlipClockWidget } from './widgets/FlipClockWidget';
import { MinimalDigitalClockWidget } from './widgets/MinimalDigitalClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { MediaFrameWidget } from './widgets/MediaFrameWidget';
import { TodoListWidget } from './widgets/TodoListWidget';
import { Lock, Unlock, Trash2, Settings, Copy, GripVertical } from 'lucide-react';

interface WidgetContainerProps {
  widget: WidgetInstance;
  isAllLocked: boolean;
  gridSnap: boolean;
  gridSnapSize: number;
  fontFamily?: string;
  onUpdate: (id: string, updates: Partial<WidgetInstance>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (widget: WidgetInstance) => void;
  onBringToFront: (id: string) => void;
  onOpenSettings: (widget: WidgetInstance) => void;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  isAllLocked,
  gridSnap,
  gridSnapSize,
  fontFamily,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onOpenSettings,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Use refs for drag/resize state to avoid re-renders on every pointer move
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const initialResizeRef = useRef({ w: 0, h: 0, x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const latestPosRef = useRef({ x: widget.x, y: widget.y });
  const latestSizeRef = useRef({ w: widget.width, h: widget.height });
  const pointerIdRef = useRef<number | null>(null);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isLocked = isAllLocked || widget.isLocked;

  // Keep latestPosRef/latestSizeRef in sync with widget prop when NOT actively dragging/resizing
  useEffect(() => {
    if (!isDraggingRef.current) {
      latestPosRef.current = { x: widget.x, y: widget.y };
    }
    if (!isResizingRef.current) {
      latestSizeRef.current = { w: widget.width, h: widget.height };
    }
  }, [widget.x, widget.y, widget.width, widget.height]);

  // Apply position directly to DOM during drag for zero-lag movement
  const applyPositionToDOM = useCallback(() => {
    if (containerRef.current) {
      const { x, y } = latestPosRef.current;
      containerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, []);

  const applySizeToDOM = useCallback(() => {
    if (containerRef.current) {
      const { w, h } = latestSizeRef.current;
      containerRef.current.style.width = `${w}px`;
      containerRef.current.style.height = `${h}px`;
    }
  }, []);

  // Handle Dragging
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isLocked) return;
    if ((e.target as HTMLElement).closest('button, input, textarea, a, select, label')) {
      return;
    }

    onBringToFront(widget.id);
    isDraggingRef.current = true;
    setIsDraggingState(true);
    dragOffsetRef.current = {
      x: e.clientX - widget.x,
      y: e.clientY - widget.y,
    };
    pointerIdRef.current = e.pointerId;
    // Capture on the container itself, not a random child
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [isLocked, widget.id, widget.x, widget.y, onBringToFront]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      let nextX = e.clientX - dragOffsetRef.current.x;
      let nextY = e.clientY - dragOffsetRef.current.y;

      if (gridSnap) {
        nextX = Math.round(nextX / gridSnapSize) * gridSnapSize;
        nextY = Math.round(nextY / gridSnapSize) * gridSnapSize;
      }

      nextX = Math.max(0, nextX);
      nextY = Math.max(0, nextY);

      latestPosRef.current = { x: nextX, y: nextY };

      // Use rAF to batch DOM writes — avoids layout thrashing
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(applyPositionToDOM);
    } else if (isResizingRef.current) {
      const ir = initialResizeRef.current;
      const deltaX = e.clientX - ir.x;
      const deltaY = e.clientY - ir.y;

      let nextW = Math.max(120, ir.w + deltaX);
      let nextH = Math.max(80, ir.h + deltaY);

      if (gridSnap) {
        nextW = Math.round(nextW / gridSnapSize) * gridSnapSize;
        nextH = Math.round(nextH / gridSnapSize) * gridSnapSize;
      }

      latestSizeRef.current = { w: nextW, h: nextH };

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(applySizeToDOM);
    }
  }, [gridSnap, gridSnapSize, applyPositionToDOM, applySizeToDOM]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDraggingState(false);
      // Cancel any pending rAF
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Commit final position to React state
      onUpdate(widget.id, { x: latestPosRef.current.x, y: latestPosRef.current.y });
      try {
        containerRef.current?.releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (isResizingRef.current) {
      isResizingRef.current = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Commit final size to React state
      onUpdate(widget.id, { width: latestSizeRef.current.w, height: latestSizeRef.current.h });
    }
  }, [widget.id, onUpdate]);

  // Handle Resizing
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    if (isLocked) return;
    e.stopPropagation();
    isResizingRef.current = true;
    initialResizeRef.current = {
      w: widget.width,
      h: widget.height,
      x: e.clientX,
      y: e.clientY,
    };
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [isLocked, widget.width, widget.height]);

  // Render Widget Core Component
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'clock': {
        const clockCfg = widget.config as any;
        if (clockCfg.clockType === 'minimal-digital') {
          return (
            <MinimalDigitalClockWidget
              config={clockCfg}
              width={widget.width}
              height={widget.height}
            />
          );
        }
        return (
          <FlipClockWidget
            config={clockCfg}
            width={widget.width}
            height={widget.height}
          />
        );
      }
      case 'weather':
        return (
          <WeatherWidget
            config={widget.config as any}
            width={widget.width}
            height={widget.height}
          />
        );
      case 'calendar':
        return (
          <CalendarWidget
            config={widget.config as any}
            width={widget.width}
            height={widget.height}
          />
        );
      case 'media':
        return (
          <MediaFrameWidget
            config={widget.config as any}
            width={widget.width}
            height={widget.height}
            onUpdateConfig={(updates) =>
              onUpdate(widget.id, {
                config: { ...widget.config, ...updates },
              })
            }
          />
        );
      case 'todo':
        return (
          <TodoListWidget
            config={widget.config as any}
            width={widget.width}
            height={widget.height}
            onUpdateConfig={(updates) =>
              onUpdate(widget.id, {
                config: { ...widget.config, ...updates },
              })
            }
          />
        );
      default:
        return <div className="p-4 text-neutral-400">Widget: {widget.type}</div>;
    }
  };

  const bgTransparency = widget.config.backgroundTransparency ?? 0;
  const isFullyInvisibleBg = bgTransparency >= 0.99;
  const effectiveFont = widget.config.fontStyle || fontFamily || 'Inter';
  const fontSizeFactor = widget.config.fontSize ?? 1;
  const effectiveFontColor = widget.config.fontColor;

  // Compute inline card background and border based on backgroundTransparency
  const cardStyle: React.CSSProperties & Record<string, string | number | undefined> = {
    transform: `translate3d(${isDraggingRef.current ? latestPosRef.current.x : widget.x}px, ${isDraggingRef.current ? latestPosRef.current.y : widget.y}px, 0)`,
    width: `${isResizingRef.current ? latestSizeRef.current.w : widget.width}px`,
    height: `${isResizingRef.current ? latestSizeRef.current.h : widget.height}px`,
    zIndex: widget.zIndex,
    opacity: widget.config.opacity ?? 1,
    '--widget-font-family': `'${effectiveFont}', system-ui, -apple-system, sans-serif`,
    fontFamily: `'${effectiveFont}', system-ui, -apple-system, sans-serif`,
    ...(effectiveFontColor ? { color: effectiveFontColor } : {}),
  };

  if (bgTransparency > 0) {
    if (isFullyInvisibleBg) {
      cardStyle['--widget-card-bg'] = 'transparent';
      cardStyle['--widget-card-backdrop'] = 'none';
      cardStyle['--widget-card-border'] = '1px solid transparent';
      cardStyle['--widget-card-shadow'] = 'none';
    } else {
      const alphaGlass = (0.65 * (1 - bgTransparency)).toFixed(3);
      const alphaBorder = (0.12 * (1 - bgTransparency)).toFixed(3);
      const blurAmount = Math.max(0, Math.round(24 * (1 - bgTransparency)));
      cardStyle['--widget-card-bg'] = `rgba(18, 20, 26, ${alphaGlass})`;
      cardStyle['--widget-card-backdrop'] = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none';
      cardStyle['--widget-card-border'] = `1px solid rgba(255, 255, 255, ${alphaBorder})`;
      cardStyle['--widget-card-shadow'] = `0 10px 30px rgba(0, 0, 0, ${(0.6 * (1 - bgTransparency)).toFixed(3)})`;
    }
  }

  // Right-click context menu handler
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Right-click context menu handler: invokes native Windows context menu in Electron
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBringToFront(widget.id);

    if (window.electronAPI?.showWidgetContextMenu) {
      // Direct native Windows Menu popup above the widget
      window.electronAPI.showWidgetContextMenu({
        widgetId: widget.id,
        isLocked,
      });
      return;
    }

    // In web browser fallback mode, show the matching Windows 11 style popup
    const menuWidth = 210;
    const menuHeight = 180;
    const posX = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const posY = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({ x: posX, y: posY });
  };

  // Close context menu on outside click or scroll
  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    window.addEventListener('contextmenu', closeMenu);
    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('contextmenu', closeMenu);
    };
  }, [contextMenu]);

  return (
    <>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => { if (!isDraggingRef.current) setIsHovered(true); }}
        onMouseLeave={() => { if (!isDraggingRef.current) setIsHovered(false); }}
        style={cardStyle}
        className={`
          absolute top-0 left-0 widget-card select-none group
          ${!isLocked ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
          ${isDraggingState ? 'is-dragging' : ''}
          ${isHovered && !isLocked && !isFullyInvisibleBg ? 'ring-1 ring-white/10' : ''}
          ${isHovered && isFullyInvisibleBg ? 'outline outline-1 outline-white/10' : ''}
        `}
      >
        {/* Widget Main Body with font scaling wrapper */}
        <div 
          className="w-full h-full overflow-hidden rounded-[18px] pointer-events-auto relative"
          style={{ fontSize: fontSizeFactor !== 1 ? `${fontSizeFactor * 100}%` : undefined }}
        >
          {renderWidgetContent()}
        </div>



        {/* Corner Resize Handle */}
        {!isLocked && (
          <div
            onPointerDown={handleResizeStart}
            className={`
              absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-40
              ${isHovered ? 'opacity-60' : 'opacity-0'} transition-opacity hover:opacity-100
            `}
          >
            <div className="w-2 h-2 border-r border-b border-neutral-400 rounded-br-[2px]" />
          </div>
        )}
      </div>

      {/* Windows 11 Native Aesthetic Context Menu Popup */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-[200] min-w-[210px] py-1.5 px-1.5 rounded-2xl bg-[#1e2025]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)] text-[#e2e4e9] text-[13px] font-sans antialiased select-none animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Widget Settings Option */}
          <button
            onClick={() => {
              setContextMenu(null);
              onOpenSettings(widget);
            }}
            className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#2b2e37] hover:text-white transition-colors flex items-center justify-between text-[#e4e6eb] font-normal"
          >
            <span>Widget Settings</span>
          </button>

          {/* Lock / Unlock Widget */}
          <button
            onClick={() => {
              setContextMenu(null);
              onUpdate(widget.id, { isLocked: !widget.isLocked });
            }}
            className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#2b2e37] hover:text-white transition-colors flex items-center justify-between text-[#e4e6eb] font-normal"
          >
            <span>{widget.isLocked ? 'Unlock Widget' : 'Lock Widget'}</span>
          </button>

          {/* Open Settings & Control Panel (like the tray menu in user screenshot) */}
          <button
            onClick={() => {
              setContextMenu(null);
              if (window.electronAPI?.openSettings) {
                window.electronAPI.openSettings();
              }
            }}
            className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#2b2e37] hover:text-white transition-colors flex items-center justify-between text-[#e4e6eb] font-normal"
          >
            <span>Open Settings & Control Panel</span>
          </button>

          {/* Duplicate Widget */}
          <button
            onClick={() => {
              setContextMenu(null);
              onDuplicate(widget);
            }}
            className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#2b2e37] hover:text-white transition-colors flex items-center justify-between text-[#e4e6eb] font-normal"
          >
            <span>Duplicate Widget</span>
          </button>

          {/* Separator line matching Windows flyout */}
          <div className="my-1.5 mx-1 border-t border-white/[0.08]" />

          {/* Delete Widget */}
          <button
            onClick={() => {
              setContextMenu(null);
              onDelete(widget.id);
            }}
            className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors flex items-center justify-between font-normal"
          >
            <span>Delete Widget</span>
          </button>
        </div>
      )}
    </>
  );
};
