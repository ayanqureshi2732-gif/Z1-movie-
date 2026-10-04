import React from 'react';
import { Wifi, Signal, Battery, Bell } from 'lucide-react';

interface AndroidStatusBarProps {
  timeStr: string;
  wifiEnabled: boolean;
  batteryLevel: number;
  unreadNotificationsCount: number;
  onOpenShade: () => void;
  isDarkTheme?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  timeStr,
  wifiEnabled,
  batteryLevel,
  unreadNotificationsCount,
  onOpenShade,
  isDarkTheme = true,
}) => {
  return (
    <header
      onClick={onOpenShade}
      className={`relative z-50 flex items-center justify-between w-full h-8 px-6 text-xs font-semibold select-none cursor-pointer transition-colors ${
        isDarkTheme ? 'text-white/90 bg-transparent' : 'text-neutral-900 bg-white/20'
      }`}
      title="Tap to pull down Quick Settings"
    >
      {/* Left: Time & notification icon */}
      <div className="flex items-center gap-2">
        <span className="font-medium tracking-tight text-[11px]">{timeStr}</span>
        {unreadNotificationsCount > 0 && (
          <div className="flex items-center gap-0.5 opacity-80">
            <Bell className="w-3 h-3 text-red-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Center: Punch Hole Front Camera Cutout */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1.5 flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 shadow-inner flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#051122]/90 ring-1 ring-cyan-900/30" />
        </div>
      </div>

      {/* Right: Network, Wi-Fi, Battery */}
      <div className="flex items-center gap-2 text-[11px]">
        {wifiEnabled ? (
          <Wifi className="w-3.5 h-3.5" />
        ) : (
          <Signal className="w-3.5 h-3.5 opacity-60" />
        )}
        <span className="text-[10px] font-bold tracking-tighter opacity-90">5G</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">{batteryLevel}%</span>
          <div className="relative flex items-center">
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
