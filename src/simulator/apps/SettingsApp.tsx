import React, { useState } from 'react';
import {
  Wifi,
  Sun,
  Volume2,
  Grid,
  HardDrive,
  Battery,
  Info,
  ChevronRight,
  ArrowLeft,
  Check,
  Smartphone,
  Shield,
  Trash2,
} from 'lucide-react';
import { PhoneSettings } from '../types';
import { WALLPAPERS } from '../wallpapers';

interface SettingsAppProps {
  settings: PhoneSettings;
  onUpdateSettings: (updater: (prev: PhoneSettings) => PhoneSettings) => void;
}

type SettingsSection = 'main' | 'network' | 'display' | 'sound' | 'apps' | 'storage' | 'battery' | 'about';

export const SettingsApp: React.FC<SettingsAppProps> = ({ settings, onUpdateSettings }) => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [appCacheCleared, setAppCacheCleared] = useState(false);

  const toggleSetting = (key: keyof PhoneSettings) => {
    onUpdateSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'network':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Wi-Fi</h4>
                  <p className="text-xs text-neutral-400">Connected to Home_Fiber_5G</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wifiEnabled}
                  onChange={() => toggleSetting('wifiEnabled')}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Mobile Data (5G)</h4>
                  <p className="text-xs text-neutral-400">Jio / Airtel 5G Ultra</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mobileDataEnabled}
                  onChange={() => toggleSetting('mobileDataEnabled')}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Airplane Mode</h4>
                  <p className="text-xs text-neutral-400">Turn off all wireless signals</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.airplaneMode}
                  onChange={() => toggleSetting('airplaneMode')}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-5">
            {/* Brightness */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Brightness Level</span>
                <span className="text-neutral-400">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={settings.brightness}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdateSettings((prev) => ({ ...prev, brightness: val }));
                }}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Navigation Mode */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                System Navigation Style
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings((prev) => ({ ...prev, navMode: 'gestures' }))}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    settings.navMode === 'gestures'
                      ? 'bg-red-600/20 border-red-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-neutral-400'
                  }`}
                >
                  <p>Gesture Navigation</p>
                  <span className="text-[10px] font-normal text-neutral-400 block mt-0.5">Bottom swipe bar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings((prev) => ({ ...prev, navMode: 'buttons' }))}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    settings.navMode === 'buttons'
                      ? 'bg-red-600/20 border-red-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-neutral-400'
                  }`}
                >
                  <p>3-Button Navigation</p>
                  <span className="text-[10px] font-normal text-neutral-400 block mt-0.5">Back, Home, Recents</span>
                </button>
              </div>
            </div>

            {/* Wallpapers */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Choose Home Wallpaper
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {WALLPAPERS.map((wp, idx) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => onUpdateSettings((prev) => ({ ...prev, wallpaperIndex: idx }))}
                    className={`h-20 rounded-xl ${wp.thumbnail} border-2 flex items-center justify-center text-xs font-semibold text-white shadow-md relative overflow-hidden transition-transform active:scale-95 ${
                      settings.wallpaperIndex === idx ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/10 opacity-70'
                    }`}
                  >
                    <span>{wp.name}</span>
                    {settings.wallpaperIndex === idx && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'sound':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Media Volume</span>
                  <span className="text-neutral-400">{settings.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onUpdateSettings((prev) => ({ ...prev, volume: val }));
                  }}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Do Not Disturb</h4>
                  <p className="text-xs text-neutral-400">Mute notifications and calls</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.doNotDisturb}
                  onChange={() => toggleSetting('doNotDisturb')}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      case 'apps':
        return (
          <div className="space-y-4">
            {/* Z1 Movies App Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-black italic text-lg text-white">
                  Z1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Z1 MOVIES</h4>
                  <p className="text-xs text-neutral-400">Package: com.z1movies.app</p>
                  <span className="text-[10px] text-emerald-400 font-medium">Installed • Version 1.0</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Storage Used</span>
                  <span className="font-mono text-neutral-400">42.8 MB</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Permissions</span>
                  <span className="text-emerald-400">Internet, Storage, WakeLock</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAppCacheCleared(true);
                  setTimeout(() => setAppCacheCleared(false), 2000);
                }}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>{appCacheCleared ? 'Cache Cleared!' : 'Clear App Cache'}</span>
              </button>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Internal Storage</span>
                <span className="text-neutral-400">48.2 GB / 128 GB</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
                <div className="w-[30%] h-full bg-red-600" title="Apps" />
                <div className="w-[15%] h-full bg-blue-500" title="Videos" />
                <div className="w-[10%] h-full bg-purple-500" title="Images" />
                <div className="w-[8%] h-full bg-amber-500" title="System" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>Apps: 24.1 GB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Videos: 12.4 GB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Images: 5.6 GB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>System: 6.1 GB</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'battery':
        return (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <span className="text-4xl font-extralight text-emerald-400">88%</span>
              <p className="text-xs text-neutral-300">About 14 hours remaining</p>
              <p className="text-[11px] text-neutral-500">Fast charging supported • Health: Good</p>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Device Name</span>
                <span className="text-white font-semibold">Pixel 9 Pro — Z1 Edition</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Android Version</span>
                <span className="text-white font-semibold">Android 16 (API 36)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Build Number</span>
                <span className="text-white font-mono">Z1-MOVIES-DEBUG-2026.10</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Processor</span>
                <span className="text-white">Octa-Core 3.4 GHz</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-400">RAM / Storage</span>
                <span className="text-white">12 GB / 128 GB</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const mainSections: { id: SettingsSection; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'network',
      title: 'Network & Internet',
      subtitle: settings.wifiEnabled ? 'Wi-Fi, 5G Mobile' : 'Offline',
      icon: <Wifi className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'display',
      title: 'Display & Navigation',
      subtitle: `Brightness: ${settings.brightness}%, ${settings.navMode === 'gestures' ? 'Gestures' : '3-Button'}`,
      icon: <Sun className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'sound',
      title: 'Sound & Vibration',
      subtitle: `Volume: ${settings.volume}%`,
      icon: <Volume2 className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'apps',
      title: 'Apps & Permissions',
      subtitle: 'Z1 MOVIES, Chrome & system apps',
      icon: <Grid className="w-5 h-5 text-red-400" />,
    },
    {
      id: 'storage',
      title: 'Storage',
      subtitle: '48.2 GB used of 128 GB',
      icon: <HardDrive className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'battery',
      title: 'Battery',
      subtitle: '88% • 14 hr remaining',
      icon: <Battery className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'about',
      title: 'About Phone',
      subtitle: 'Pixel 9 Pro • Android 16',
      icon: <Info className="w-5 h-5 text-purple-400" />,
    },
  ];

  return (
    <div className="w-full h-full bg-[#12131A] text-white flex flex-col justify-between select-none overflow-hidden">
      {/* Top Header */}
      <header className="p-4 bg-[#181922] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {currentSection !== 'main' && (
            <button
              type="button"
              onClick={() => setCurrentSection('main')}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-90"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          )}
          <h2 className="text-base font-bold text-white capitalize">
            {currentSection === 'main' ? 'Settings' : currentSection}
          </h2>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {currentSection === 'main' ? (
          mainSections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setCurrentSection(sec.id)}
              className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer active:scale-98 transition-all text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                  {sec.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{sec.title}</h4>
                  <p className="text-[11px] text-neutral-400">{sec.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>
          ))
        ) : (
          renderSectionContent()
        )}
      </div>
    </div>
  );
};
