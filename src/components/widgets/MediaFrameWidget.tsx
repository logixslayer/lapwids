import React, { useState } from 'react';
import type { MediaConfig } from '../../types/widgets';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface MediaFrameProps {
  config: MediaConfig;
  width?: number;
  height?: number;
  onUpdateConfig?: (newConfig: Partial<MediaConfig>) => void;
}

export const MediaFrameWidget: React.FC<MediaFrameProps> = ({ config, width, height, onUpdateConfig }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const currentW = width ?? 200;
  const currentH = height ?? 200;
  const isCompact = currentW < 140 || currentH < 140;

  // Filter class mappings
  const filterClasses = {
    none: '',
    grayscale: 'grayscale contrast-125',
    contrast: 'grayscale contrast-[180%] brightness-90',
    noir: 'grayscale contrast-[220%] brightness-85',
    vintage: 'sepia-[30%] contrast-125 brightness-90',
  };

  const activeFilter = config.filter ? filterClasses[config.filter] : filterClasses.contrast;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateConfig) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateConfig({ imageUrl: event.target.result as string });
          setImgError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={`relative w-full h-full ${isCompact ? 'p-1' : 'p-1.5'} group overflow-hidden select-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full h-full ${isCompact ? 'rounded-xl' : 'rounded-2xl'} overflow-hidden bg-black/30 backdrop-blur-md border border-white/[0.08] relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`}>
        {!imgError ? (
          <img
            src={config.imageUrl}
            alt={config.title || 'Monochrome media art'}
            onError={() => setImgError(true)}
            className={`w-full h-full object-${config.fit || 'cover'} ${activeFilter} pointer-events-none`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 bg-black/40 p-4 text-center">
            <ImageIcon size={28} className="opacity-30" />
          </div>
        )}

        {/* Small "00" timestamp overlay for weeping angel frame if title is 00 or config matches */}
        {config.title === '00' && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 font-mono text-[10px] text-white font-bold shadow-lg">
            00
          </div>
        )}

        {/* Upload icon on hover */}
        {isHovered && onUpdateConfig && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xl p-1.5 rounded-lg border border-white/20 shadow-xl z-20">
            <label className="cursor-pointer text-neutral-300 hover:text-white transition-colors" title="Upload Image">
              <Upload size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
