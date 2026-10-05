import React from 'react';

interface GothicWallpaperArtProps {
  preset?: 'renaissance' | 'smoke' | 'none';
  customUrl?: string;
}

export const GothicWallpaperArt: React.FC<GothicWallpaperArtProps> = ({
  preset = 'renaissance',
  customUrl,
}) => {
  const getWallpaperSrc = () => {
    if (customUrl) return customUrl;
    if (preset === 'smoke') return '/wallpapers/dark_smoke.jpg';
    if (preset === 'none') return null;
    return '/wallpapers/dark_renaissance.jpg';
  };

  const imageSrc = getWallpaperSrc();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Deep pure pitch black backdrop */}
      <div className="absolute inset-0 bg-[#060709]" />

      {/* High-definition aesthetic artwork */}
      {imageSrc && (
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
          <img
            src={imageSrc}
            alt="Atmospheric Wallpaper"
            className="w-full h-full object-cover object-right select-none pointer-events-none"
            loading="eager"
          />
        </div>
      )}

      {/* Atmospheric left-side darkening overlay so widgets have maximum contrast and legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060709] via-[#060709]/70 to-transparent w-[65vw] pointer-events-none" />

      {/* Subtle global cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
    </div>
  );
};

