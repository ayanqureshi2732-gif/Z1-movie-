import React from 'react';
import { Wifi, Signal, Bluetooth, Flashlight, Moon, Volume2, Sun, ChevronUp, Trash2, Settings, Bell } from 'lucide-react';
import { PhoneSettings, AppNotification, AndroidAppId } from './types';

interface AndroidNotificationShadeProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PhoneSettings;
  onUpdateSettings: (updater: (prev: PhoneSettings) => PhoneSettings) => void;
  notifications: AppNotification[];
  onClearNotifications: () => void;
  onOpenApp: (appId: AndroidAppId) => void;
  timeStr: string;
}

export const AndroidNotificationShade: React.FC<AndroidNotificationShadeProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  notifications,
  onClearNotifications,
  onOpenApp,
  timeStr,
}) => {
  if (!isOpen) return null;

  const toggleSetting = (key: keyof PhoneSettings) => {
    onUpdateSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdateSettings((prev) => ({ ...prev, brightness: val }));
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0c0d14]/95 backdrop-blur-2xl text-white flex flex-col justify-between animate-in fade-in duration-200 select-none">
      {/* Top Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="text-2xl font-light tracking-tight">{timeStr}</span>
          <p className="text-xs text-neutral-400">Sunday, Oct 4 • 26°C</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApp('settings');
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-neutral-300"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-neutral-300"
            title="Close Shade"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Quick Settings Grid (6 tiles) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Wi-Fi */}
          <button
            type="button"
            onClick={() => toggleSetting('wifiEnabled')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.wifiEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-neutral-400 border border-white/5'
            }`}
          >
            <Wifi className="w-5 h-5" />
            <span className="text-[11px] font-medium">Wi-Fi</span>
          </button>

          {/* Bluetooth */}
          <button
            type="button"
            onClick={() => toggleSetting('bluetoothEnabled')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.bluetoothEnabled ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-white/5 text-neutral-400 border border-white/5'
            }`}
          >
            <Bluetooth className="w-5 h-5" />
            <span className="text-[11px] font-medium">Bluetooth</span>
          </button>

          {/* Mobile Data */}
          <button
            type="button"
            onClick={() => toggleSetting('mobileDataEnabled')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.mobileDataEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-neutral-400 border border-white/5'
            }`}
          >
            <Signal className="w-5 h-5" />
            <span className="text-[11px] font-medium">Mobile 5G</span>
          </button>

          {/* Flashlight */}
          <button
            type="button"
            onClick={() => toggleSetting('flashlight')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.flashlight ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/5 text-neutral-400 border border-white/5'
            }`}
          >
            <Flashlight className="w-5 h-5" />
            <span className="text-[11px] font-medium">Flashlight</span>
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => toggleSetting('darkMode')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.darkMode ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-white/5 text-neutral-400 border border-white/5'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-[11px] font-medium">Dark Theme</span>
          </button>

          {/* Do Not Disturb */}
          <button
            type="button"
            onClick={() => toggleSetting('doNotDisturb')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
              settings.doNotDisturb ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/5 text-neutral-400 border border-white/5'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-[11px] font-medium">DND</span>
          </button>
        </div>

        {/* Brightness Slider */}
        <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
          <Sun className="w-4 h-4 text-amber-400" />
          <input
            type="range"
            min="20"
            max="100"
            value={settings.brightness}
            onChange={handleBrightnessChange}
            className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-xs text-neutral-400 w-8 text-right">{settings.brightness}%</span>
        </div>

        {/* Notifications Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-red-400" />
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearNotifications}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-xs bg-white/5 rounded-2xl border border-white/5">
              No new notifications
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onClose();
                    onOpenApp(notif.appId);
                  }}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer active:scale-98 transition-all flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    Z1
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] text-neutral-500">{notif.time}</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pull Up Footer */}
      <div
        onClick={onClose}
        className="p-3 flex items-center justify-center cursor-pointer hover:bg-white/5 active:bg-white/10"
      >
        <div className="w-12 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
};
