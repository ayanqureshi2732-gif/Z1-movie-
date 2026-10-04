import React from 'react';
import { AndroidAppId } from './types';
import { Settings, Folder, Image, Calculator, Globe, Search, Mic } from 'lucide-react';

interface AndroidHomeScreenProps {
  onOpenApp: (appId: AndroidAppId) => void;
  wallpaperGradient: string;
}

export const AndroidHomeScreen: React.FC<AndroidHomeScreenProps> = ({
  onOpenApp,
  wallpaperGradient,
}) => {
  const currentDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const appItems: { id: AndroidAppId; name: string; renderIcon: () => React.ReactNode }[] = [
    {
      id: 'z1movies',
      name: 'Z1 MOVIES',
      renderIcon: () => (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E50914] via-[#B20710] to-[#5a0206] shadow-lg shadow-red-950/60 flex items-center justify-center p-1.5 border border-red-500/30 group-hover:scale-105 active:scale-95 transition-transform">
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-white font-black italic tracking-tighter text-lg drop-shadow">Z1</span>
            <span className="text-[8px] font-black text-white/90 tracking-widest uppercase">MOVIES</span>
          </div>
        </div>
      ),
    },
    {
      id: 'chrome',
      name: 'Chrome',
      renderIcon: () => (
        <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center p-2.5 group-hover:scale-105 active:scale-95 transition-transform">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-red-500 to-emerald-500 p-2 flex items-center justify-center relative overflow-hidden">
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
          </div>
        </div>
      ),
    },
    {
      id: 'settings',
      name: 'Settings',
      renderIcon: () => (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 border border-neutral-600 shadow-md flex items-center justify-center text-neutral-200 group-hover:scale-105 active:scale-95 transition-transform">
          <Settings className="w-7 h-7 text-neutral-200" />
        </div>
      ),
    },
    {
      id: 'files',
      name: 'Files',
      renderIcon: () => (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
          <Folder className="w-7 h-7" />
        </div>
      ),
    },
    {
      id: 'gallery',
      name: 'Gallery',
      renderIcon: () => (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
          <Image className="w-7 h-7" />
        </div>
      ),
    },
    {
      id: 'calculator',
      name: 'Calculator',
      renderIcon: () => (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
          <Calculator className="w-7 h-7" />
        </div>
      ),
    },
  ];

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-b ${wallpaperGradient} text-white flex flex-col justify-between p-5 select-none overflow-hidden`}
    >
      {/* Top Section: Date & At-a-Glance */}
      <div className="pt-3">
        <div className="flex items-center justify-between text-white/90">
          <div>
            <span className="text-xl font-medium tracking-tight drop-shadow">{currentDateStr}</span>
            <p className="text-xs text-white/70 drop-shadow">26°C • Clear skies</p>
          </div>
        </div>

        {/* Google Style Pill Search Widget */}
        <div
          onClick={() => onOpenApp('chrome')}
          className="mt-5 w-full h-11 px-4 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 shadow-md flex items-center justify-between cursor-pointer hover:bg-white/20 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5">
            {/* G logo */}
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-xs text-blue-600">
              G
            </div>
            <span className="text-xs text-white/80 font-medium">Search or type URL</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Mic className="w-4 h-4 hover:text-white" />
            <Search className="w-4 h-4 hover:text-white" />
          </div>
        </div>
      </div>

      {/* Main Apps Grid (3 columns) */}
      <div className="grid grid-cols-3 gap-y-7 gap-x-4 my-auto px-1">
        {appItems.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => onOpenApp(app.id)}
            className="group flex flex-col items-center justify-center gap-2 cursor-pointer focus:outline-none"
          >
            {app.renderIcon()}
            <span className="text-xs font-medium text-white/95 tracking-tight drop-shadow truncate max-w-[80px]">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Favorites Dock */}
      <div className="pb-1">
        <div className="w-full p-2.5 rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/10 flex items-center justify-around shadow-2xl">
          {/* Quick Chrome */}
          <button
            type="button"
            onClick={() => onOpenApp('chrome')}
            className="p-2 rounded-2xl hover:bg-white/10 active:scale-90 transition-transform"
            title="Chrome"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </button>

          {/* Quick Z1 Movies Favorite Center Button */}
          <button
            type="button"
            onClick={() => onOpenApp('z1movies')}
            className="p-1 rounded-2xl hover:bg-white/10 active:scale-90 transition-transform"
            title="Open Z1 MOVIES"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E50914] to-[#B20710] border border-red-400/40 shadow-lg flex items-center justify-center">
              <span className="text-white font-black italic text-base">Z1</span>
            </div>
          </button>

          {/* Quick Settings */}
          <button
            type="button"
            onClick={() => onOpenApp('settings')}
            className="p-2 rounded-2xl hover:bg-white/10 active:scale-90 transition-transform"
            title="Settings"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Settings className="w-6 h-6" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
