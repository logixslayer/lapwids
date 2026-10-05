import React, { useState } from 'react';
import type { TodoConfig } from '../../types/widgets';
import { Plus, Trash2 } from 'lucide-react';

interface TodoListProps {
  config: TodoConfig;
  width?: number;
  height?: number;
  onUpdateConfig?: (newConfig: Partial<TodoConfig>) => void;
}

export const TodoListWidget: React.FC<TodoListProps> = ({ config, width, height, onUpdateConfig }) => {
  const [newText, setNewText] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const items = config.items || [];

  const currentW = width ?? 200;
  const currentH = height ?? 240;

  const isTightW = currentW < 165;
  const isTightH = currentH < 140;

  const handleToggle = (id: string) => {
    const updated = items.map((it) => {
      if (it.id === id) {
        return { ...it, completed: !it.completed };
      }
      return it;
    });

    if (onUpdateConfig) {
      onUpdateConfig({ items: updated });
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter((it) => it.id !== id);
    if (onUpdateConfig) {
      onUpdateConfig({ items: updated });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newText.trim(),
      completed: false,
    };

    if (onUpdateConfig) {
      onUpdateConfig({ items: [...items, newItem] });
    }
    setNewText('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full text-neutral-200 select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between ${isTightH ? 'px-2.5 py-1.5' : 'px-3.5 py-2'} bg-white/[0.04] backdrop-blur-md border-b border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] shrink-0`}>
        <div className="flex items-center gap-1.5 text-neutral-200 truncate">
          <span className="font-serif italic font-normal text-[12px] tracking-wide truncate">
            {isTightW ? 'to do:' : (config.headerTitle || 'to be list:')}
          </span>
          {!isTightW && (
            <span className="text-[10px] text-neutral-400 select-none shrink-0">
              {config.headerDecor || '˚ʚ♡ɞ˚'}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Add Item"
        >
          <Plus size={isTightH ? 12 : 13} />
        </button>
      </div>

      {/* Inline Add Input */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-2 border-b border-white/[0.08]">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Type item..."
            autoFocus
            className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white placeholder-neutral-400 focus:outline-none focus:border-white/30 backdrop-blur-sm"
          />
        </form>
      )}

      {/* Dashed / Minimal List */}
      <div className={`flex-1 overflow-y-auto ${isTightH ? 'px-2.5 py-1 space-y-0.5' : 'px-3.5 py-2 space-y-1'}`}>
        {items.length === 0 ? (
          <div className="text-[10px] text-neutral-500 italic text-center py-2">
            No tasks yet
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`flex items-center justify-between group cursor-pointer ${isTightH ? 'text-[11px]' : 'text-[12px]'} py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-neutral-500 font-mono">-</span>
                <span
                  className={`truncate ${
                    item.completed ? 'line-through text-neutral-500 opacity-60' : 'text-neutral-300'
                  }`}
                >
                  {item.text}
                </span>
              </div>

              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-500 hover:text-rose-400 transition-opacity ml-1 shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
