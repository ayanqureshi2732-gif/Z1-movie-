import React from 'react';
import { AndroidAppId } from './types';
import { X, Trash2 } from 'lucide-react';

interface AndroidRecentAppsProps {
  recentApps: AndroidAppId[];
  onSelectApp: (appId: AndroidAppId) => void;
  onCloseApp: (appId: AndroidAppId) => void;
  onClearAll: () => void;
  onCloseRecents: () => void;
}

export const AndroidRecentApps: React.FC<AndroidRecentAppsProps> = ({
  recentApps,
  onSelectApp,
  onCloseApp,
  onClearAll,
  onCloseRecents,
}) => {
  const getAppMeta = (id: AndroidAppId) => {
    switch (id) {
      case 'z1movies':
        return {
          title: 'Z1 MOVIES',
          color: 'bg-red-600',
          previewBg: 'bg-[#08080b]',
          previewText: 'Streaming Movies & Live TV in 4K HDR',
        };
      case 'chrome':
        return {
          title: 'Google Chrome',
          color: 'bg-blue-600',
          previewBg: 'bg-neutral-900',
          previewText: 'Web Browser & Search',
        };
      case 'settings':
        return {
          title: 'Settings',
          color: 'bg-neutral-700',
          previewBg: 'bg-neutral-950',
          previewText: 'System, Network & Display',
        };
      case 'files':
        return {
          title: 'Files',
          color: 'bg-blue-500',
          previewBg: 'bg-neutral-900',
          previewText: 'Downloads: Z1-Movies-debug.apk',
        };
      case 'gallery':
        return {
          title: 'Gallery',
          color: 'bg-pink-600',
          previewBg: 'bg-black',
          previewText: 'Cinema Stills & Posters',
        };
      case 'calculator':
        return {
          title: 'Calculator',
          color: 'bg-teal-600',
          previewBg: 'bg-neutral-900',
          previewText: 'Scientific & Basic Calculator',
        };
    }
  };

  if (recentApps.length === 0) {
    return (
      <div
        onClick={onCloseRecents}
        className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer"
      >
        <p className="text-neutral-400 text-sm">No recent apps</p>
        <span className="text-xs text-neutral-600 mt-1">Tap anywhere to return Home</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-2xl flex flex-col justify-between py-6 px-4 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Active Apps ({recentApps.length})
        </span>
        <button
          type="button"
          onClick={onCloseRecents}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300"
          title="Close Recents"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Carousel of App Cards */}
      <div className="flex-1 flex items-center justify-center gap-4 overflow-x-auto py-4 px-2 no-scrollbar">
        {recentApps.map((appId) => {
          const meta = getAppMeta(appId);
          return (
            <div
              key={appId}
              className="relative flex-shrink-0 w-60 h-96 rounded-3xl bg-neutral-900 border border-white/15 shadow-2xl flex flex-col overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer group"
              onClick={() => onSelectApp(appId)}
            >
              {/* App Card Header */}
              <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-lg ${meta.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                    {meta.title[0]}
                  </div>
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {meta.title}
                  </span>
                </div>
                {/* Close Card Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseApp(appId);
                  }}
                  className="p-1 rounded-full hover:bg-white/20 text-neutral-400 hover:text-white"
                  title="Close App"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mock App Screenshot / View */}
              <div className={`flex-1 ${meta.previewBg} p-4 flex flex-col items-center justify-center text-center`}>
                <div className={`w-14 h-14 rounded-2xl ${meta.color} flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg`}>
                  {meta.title.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="text-sm font-semibold text-white">{meta.title}</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-[180px] leading-relaxed">
                  {meta.previewText}
                </p>
                <span className="mt-4 px-3 py-1 rounded-full bg-white/10 text-[10px] text-white/80 font-medium">
                  Tap to resume
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-center pt-2">
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white/90 border border-white/15 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          Clear all
        </button>
      </div>
    </div>
  );
};
