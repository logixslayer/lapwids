import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { WidgetInstance } from '../types/widgets';
import { FlipClockWidget } from './widgets/FlipClockWidget';
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
      case 'clock':
        return (
          <FlipClockWidget
            config={widget.config as any}
            width={widget.width}
            height={widget.height}
          />
        );
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

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => { if (!isDraggingRef.current) setIsHovered(true); }}
      onMouseLeave={() => { if (!isDraggingRef.current) setIsHovered(false); }}
      style={{
        transform: `translate3d(${isDraggingRef.current ? latestPosRef.current.x : widget.x}px, ${isDraggingRef.current ? latestPosRef.current.y : widget.y}px, 0)`,
        width: `${isResizingRef.current ? latestSizeRef.current.w : widget.width}px`,
        height: `${isResizingRef.current ? latestSizeRef.current.h : widget.height}px`,
        zIndex: widget.zIndex,
        opacity: widget.config.opacity ?? 1,
        '--widget-font-family': `'${fontFamily || 'Inter'}', system-ui, -apple-system, sans-serif`,
        fontFamily: `'${fontFamily || 'Inter'}', system-ui, -apple-system, sans-serif`,
      } as React.CSSProperties}
      className={`
        absolute top-0 left-0 widget-card select-none group
        ${!isLocked ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        ${isDraggingState ? 'is-dragging' : ''}
        ${isHovered && !isLocked ? 'ring-1 ring-white/10' : ''}
      `}
    >
      {/* Widget Main Body */}
      <div className="w-full h-full overflow-hidden rounded-[18px] pointer-events-auto relative">
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
  );
};
