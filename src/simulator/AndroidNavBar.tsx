import React from 'react';
import { NavMode } from './types';

interface AndroidNavBarProps {
  navMode: NavMode;
  onBack: () => void;
  onHome: () => void;
  onRecents: () => void;
  isDarkTheme?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  navMode,
  onBack,
  onHome,
  onRecents,
  isDarkTheme = true,
}) => {
  return (
    <footer
      className={`relative z-50 flex items-center justify-center w-full h-11 px-8 select-none transition-colors ${
        isDarkTheme ? 'bg-black/80 backdrop-blur-md text-white' : 'bg-white/80 backdrop-blur-md text-neutral-900'
      }`}
    >
      {navMode === 'buttons' ? (
        <div className="flex items-center justify-between w-full max-w-[280px]">
          {/* Back Button (Triangle/Chevron) */}
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all text-white/80 hover:text-white"
            title="Back"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 12a1 1 0 0 1-1 1H8.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L8.414 11H18a1 1 0 0 1 1 1z" />
            </svg>
          </button>

          {/* Home Button (Circle) */}
          <button
            type="button"
            onClick={onHome}
            className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all text-white/80 hover:text-white"
            title="Home"
          >
            <div className="w-4 h-4 rounded-full border-2 border-current" />
          </button>

          {/* Recent Apps Button (Square) */}
          <button
            type="button"
            onClick={onRecents}
            className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all text-white/80 hover:text-white"
            title="Recent Apps"
          >
            <div className="w-3.5 h-3.5 rounded-[3px] border-2 border-current" />
          </button>
        </div>
      ) : (
        /* Gesture Navigation Bar */
        <div className="flex items-center justify-between w-full">
          {/* Subtle back triggers on edges for convenience */}
          <button
            type="button"
            onClick={onBack}
            className="text-[10px] uppercase font-bold tracking-widest text-white/30 hover:text-white/70 px-2 py-1"
            title="Swipe Back"
          >
            ◀ Back
          </button>

          {/* Center Gesture Pill */}
          <button
            type="button"
            onClick={onHome}
            onContextMenu={(e) => {
              e.preventDefault();
              onRecents();
            }}
            className="group relative flex items-center justify-center py-2 px-8"
            title="Tap for Home, Right-click or long-press for Recents"
          >
            <div className="w-32 h-1.5 rounded-full bg-white/70 group-hover:bg-white group-active:scale-95 group-active:w-28 transition-all shadow-sm" />
          </button>

          {/* Recents trigger */}
          <button
            type="button"
            onClick={onRecents}
            className="text-[10px] uppercase font-bold tracking-widest text-white/30 hover:text-white/70 px-2 py-1"
            title="Recent Apps"
          >
            Apps ⏹
          </button>
        </div>
      )}
    </footer>
  );
};
