import React from 'react';
import { Lock, Phone, Camera, ChevronUp, Bell } from 'lucide-react';
import { AppNotification } from './types';

interface AndroidLockScreenProps {
  timeStr: string;
  onUnlock: () => void;
  notifications: AppNotification[];
  wallpaperGradient: string;
}

export const AndroidLockScreen: React.FC<AndroidLockScreenProps> = ({
  timeStr,
  onUnlock,
  notifications,
  wallpaperGradient,
}) => {
  const currentDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div
      onClick={onUnlock}
      className={`absolute inset-0 z-40 bg-gradient-to-b ${wallpaperGradient} text-white flex flex-col justify-between p-6 select-none cursor-pointer transition-all duration-300 animate-in fade-in`}
    >
      {/* Top Lock Indicator */}
      <div className="flex justify-center pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Swipe or tap to unlock</span>
        </div>
      </div>

      {/* Center Clock & Date */}
      <div className="flex flex-col items-center justify-center my-auto">
        <h1 className="text-7xl font-extralight tracking-tighter text-white/95 drop-shadow-md">
          {timeStr}
        </h1>
        <p className="text-sm font-medium text-white/80 mt-1 tracking-wide">
          {currentDateStr} • 26°C Sunny
        </p>

        {/* Peek Notification */}
        {notifications.length > 0 && (
          <div className="mt-8 max-w-[280px] w-full p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-left shadow-lg">
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mb-1">
              <Bell className="w-3 h-3" />
              <span>{notifications[0].title}</span>
            </div>
            <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
              {notifications[0].message}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Shortcuts */}
      <div className="flex items-end justify-between pb-4">
        {/* Left: Phone Emergency / Dial */}
        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80">
          <Phone className="w-5 h-5" />
        </div>

        {/* Center: Swipe Up Indicator */}
        <div className="flex flex-col items-center gap-1 text-white/60 animate-bounce">
          <ChevronUp className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase font-semibold">Unlock</span>
        </div>

        {/* Right: Camera Shortcut */}
        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80">
          <Camera className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
