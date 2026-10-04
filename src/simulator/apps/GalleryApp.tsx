import React, { useState } from 'react';
import { ArrowLeft, Share2, Heart, Check, X, Wallpaper as WallpaperIcon } from 'lucide-react';
import { PhoneSettings } from '../types';

interface GalleryAppProps {
  onUpdateSettings: (updater: (prev: PhoneSettings) => PhoneSettings) => void;
}

interface GalleryPhoto {
  id: string;
  title: string;
  category: string;
  gradient: string;
  tag: string;
}

const GALLERY_ITEMS: GalleryPhoto[] = [
  {
    id: '1',
    title: 'Interstellar Odyssey',
    category: 'Sci-Fi Movie Stills',
    gradient: 'from-blue-900 via-indigo-950 to-black',
    tag: 'Z1 4K HDR',
  },
  {
    id: '2',
    title: 'Cyberpunk Neon City',
    category: 'Action Movie Stills',
    gradient: 'from-fuchsia-900 via-purple-950 to-black',
    tag: 'Z1 Exclusive',
  },
  {
    id: '3',
    title: 'The Crimson King',
    category: 'Drama / Thriller',
    gradient: 'from-red-950 via-zinc-900 to-black',
    tag: 'Trending #1',
  },
  {
    id: '4',
    title: 'Deep Abyss Explorer',
    category: 'Documentary',
    gradient: 'from-emerald-950 via-teal-950 to-black',
    tag: 'IMAX Enhanced',
  },
  {
    id: '5',
    title: 'Solar Eclipse Horizon',
    category: 'Space Cinema',
    gradient: 'from-amber-950 via-neutral-900 to-black',
    tag: '4K Ultra',
  },
  {
    id: '6',
    title: 'Midnight Stealth Protocol',
    category: 'Spy Action',
    gradient: 'from-slate-900 via-zinc-950 to-black',
    tag: 'Blockbuster',
  },
];

export const GalleryApp: React.FC<GalleryAppProps> = ({ onUpdateSettings }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [wallpaperSetSuccess, setWallpaperSetSuccess] = useState(false);

  const handleSetWallpaper = (photo: GalleryPhoto) => {
    // Dynamically change home wallpaper index
    onUpdateSettings((prev) => ({
      ...prev,
      wallpaperIndex: (prev.wallpaperIndex + 1) % 4,
    }));
    setWallpaperSetSuccess(true);
    setTimeout(() => setWallpaperSetSuccess(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#0E0F14] text-white flex flex-col justify-between select-none overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-[#14151E] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <h2 className="text-base font-bold text-white">Gallery</h2>
        <span className="text-xs text-neutral-400 font-medium">{GALLERY_ITEMS.length} Photos</span>
      </header>

      {/* Photos Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2.5">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className={`h-40 rounded-2xl bg-gradient-to-br ${item.gradient} p-3 border border-white/10 flex flex-col justify-between cursor-pointer group active:scale-95 transition-all shadow-md relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white">
                  {item.tag}
                </span>
                <Heart className="w-3.5 h-3.5 text-white/50 group-hover:text-red-500 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white drop-shadow truncate">{item.title}</h4>
                <p className="text-[10px] text-neutral-300 drop-shadow">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Photo Modal */}
      {selectedPhoto && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90"
              title="Close"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <span className="text-xs font-semibold text-white/90">{selectedPhoto.title}</span>
            <button type="button" className="p-2 rounded-full bg-white/10 hover:bg-white/20">
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Photo Center Card */}
          <div
            className={`w-full max-w-[280px] h-80 mx-auto rounded-3xl bg-gradient-to-br ${selectedPhoto.gradient} p-5 border border-white/20 shadow-2xl flex flex-col justify-between`}
          >
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/40 backdrop-blur-md self-start text-white border border-white/10">
              {selectedPhoto.tag}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white drop-shadow">{selectedPhoto.title}</h3>
              <p className="text-xs text-neutral-300 mt-1">{selectedPhoto.category}</p>
            </div>
          </div>

          {/* Bottom Action: Set as Phone Wallpaper */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleSetWallpaper(selectedPhoto)}
              className="w-full max-w-[260px] py-2.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all"
            >
              {wallpaperSetSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Wallpaper Applied!</span>
                </>
              ) : (
                <>
                  <WallpaperIcon className="w-4 h-4 text-white" />
                  <span>Set as Phone Wallpaper</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
