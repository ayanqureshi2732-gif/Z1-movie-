import React, { useState, useEffect } from 'react';
import { AndroidStatusBar } from './AndroidStatusBar';
import { AndroidNavBar } from './AndroidNavBar';
import { AndroidLockScreen } from './AndroidLockScreen';
import { AndroidHomeScreen } from './AndroidHomeScreen';
import { AndroidRecentApps } from './AndroidRecentApps';
import { AndroidNotificationShade } from './AndroidNotificationShade';
import { ChromeApp } from './apps/ChromeApp';
import { SettingsApp } from './apps/SettingsApp';
import { FilesApp } from './apps/FilesApp';
import { GalleryApp } from './apps/GalleryApp';
import { CalculatorApp } from './apps/CalculatorApp';
import { AndroidAppId, PhoneSettings, AppNotification } from './types';
import { WALLPAPERS } from './wallpapers';
import { Smartphone, Monitor, RotateCw, Volume2, Power } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VirtualPhoneProps {
  children: React.ReactNode; // Existing Z1 Movies AppContent
}

export const VirtualPhone: React.FC<VirtualPhoneProps> = ({ children }) => {
  const { navigate, route } = useApp();

  // Virtual Phone State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [activeApp, setActiveApp] = useState<AndroidAppId | null>('z1movies'); // Opens directly in Z1 Movies by default, or Home
  const [recentApps, setRecentApps] = useState<AndroidAppId[]>(['z1movies', 'chrome', 'gallery']);
  const [isRecentsOpen, setIsRecentsOpen] = useState<boolean>(false);
  const [isShadeOpen, setIsShadeOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'phone' | 'fullscreen'>('phone');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [volumeFeedback, setVolumeFeedback] = useState<number | null>(null);

  // Time State
  const [timeStr, setTimeStr] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Phone System Settings
  const [settings, setSettings] = useState<PhoneSettings>({
    wifiEnabled: true,
    bluetoothEnabled: true,
    mobileDataEnabled: true,
    airplaneMode: false,
    darkMode: true,
    flashlight: false,
    doNotDisturb: false,
    brightness: 95,
    volume: 85,
    navMode: 'gestures',
    wallpaperIndex: 1, // Default Z1 Crimson Glow
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n1',
      appId: 'z1movies',
      title: 'Z1 MOVIES: New 4K Release',
      message: 'Trending blockbuster sci-fi & action movies are now available in 4K HDR.',
      time: 'Just now',
      unread: true,
    },
    {
      id: 'n2',
      appId: 'files',
      title: 'Download Complete',
      message: 'Z1-Movies-debug.apk (42.8 MB) ready to install.',
      time: '12m ago',
      unread: false,
    },
  ]);

  const currentWallpaper = WALLPAPERS[settings.wallpaperIndex] || WALLPAPERS[0];

  // App Launcher
  const handleOpenApp = (appId: AndroidAppId) => {
    setActiveApp(appId);
    setIsRecentsOpen(false);
    setIsShadeOpen(false);
    setRecentApps((prev) => [appId, ...prev.filter((id) => id !== appId)]);
  };

  // Nav: Back Action
  const handleBack = () => {
    if (isShadeOpen) {
      setIsShadeOpen(false);
      return;
    }
    if (isRecentsOpen) {
      setIsRecentsOpen(false);
      return;
    }
    if (activeApp === 'z1movies') {
      // If inside video player or movie details, navigate back to home
      if (route.path.startsWith('/player/') || route.path.startsWith('/movie/')) {
        navigate({ path: '/' });
        return;
      }
      if (route.path !== '/') {
        navigate({ path: '/' });
        return;
      }
      // If already at root, minimize app to Android home screen
      setActiveApp(null);
      return;
    }
    if (activeApp !== null) {
      setActiveApp(null);
    }
  };

  // Nav: Home Action
  const handleHome = () => {
    setIsShadeOpen(false);
    setIsRecentsOpen(false);
    setActiveApp(null);
  };

  // Nav: Recents Action
  const handleRecents = () => {
    setIsShadeOpen(false);
    setIsRecentsOpen((prev) => !prev);
  };

  // Physical Side Buttons
  const handlePowerClick = () => {
    setIsLocked((prev) => !prev);
    setIsShadeOpen(false);
    setIsRecentsOpen(false);
  };

  const handleVolumeChange = (delta: number) => {
    setSettings((prev) => {
      const nextVol = Math.max(0, Math.min(100, prev.volume + delta));
      setVolumeFeedback(nextVol);
      setTimeout(() => setVolumeFeedback(null), 1200);
      return { ...prev, volume: nextVol };
    });
  };

  // If user selected Fullscreen Web view mode
  if (viewMode === 'fullscreen') {
    return (
      <div className="relative min-h-screen w-full bg-[#08080b]">
        {/* Switch back to Virtual Phone Floating Button */}
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button
            type="button"
            onClick={() => setViewMode('phone')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-2xl border border-white/20 active:scale-95 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Virtual Phone Simulator</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050608] text-white flex flex-col items-center justify-center p-2 sm:p-4 select-none relative overflow-x-hidden">
      {/* Studio Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Controls Bar */}
      <header className="relative z-20 mb-3 flex items-center justify-between gap-3 w-full max-w-[420px] px-2 text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white tracking-wide">Z1 Android Simulator</span>
          <span className="text-[10px] text-neutral-400 bg-white/10 px-2 py-0.5 rounded-full">v16 (API 36)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Rotate Phone Button */}
          <button
            type="button"
            onClick={() => setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'))}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 text-neutral-300 transition-all flex items-center gap-1 text-[11px]"
            title="Rotate phone"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{orientation === 'portrait' ? 'Landscape' : 'Portrait'}</span>
          </button>

          {/* Fullscreen Direct Web Mode Toggle */}
          <button
            type="button"
            onClick={() => setViewMode('fullscreen')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 text-neutral-300 transition-all flex items-center gap-1 text-[11px]"
            title="Switch to Full Web Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web View</span>
          </button>
        </div>
      </header>

      {/* Main Virtual Phone Container */}
      <div className="relative flex items-center justify-center">
        {/* Physical Left Volume Buttons */}
        <div className="absolute -left-3 top-28 flex flex-col gap-3 z-30">
          <button
            type="button"
            onClick={() => handleVolumeChange(10)}
            className="w-1.5 h-12 bg-neutral-700 hover:bg-neutral-500 rounded-l active:translate-x-0.5 transition-all cursor-pointer"
            title="Volume Up"
          />
          <button
            type="button"
            onClick={() => handleVolumeChange(-10)}
            className="w-1.5 h-12 bg-neutral-700 hover:bg-neutral-500 rounded-l active:translate-x-0.5 transition-all cursor-pointer"
            title="Volume Down"
          />
        </div>

        {/* Physical Right Power Button */}
        <div className="absolute -right-3 top-28 z-30">
          <button
            type="button"
            onClick={handlePowerClick}
            className="w-1.5 h-14 bg-neutral-700 hover:bg-red-500 rounded-r active:-translate-x-0.5 transition-all cursor-pointer"
            title="Power Button (Lock / Unlock)"
          />
        </div>

        {/* Outer Phone Bezel & Metallic Chassis */}
        <div
          className={`relative p-3 rounded-[50px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-[#121214] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-2 border-neutral-700/60 ring-1 ring-white/10 transition-all duration-300 ${
            orientation === 'portrait' ? 'w-[370px] sm:w-[390px] h-[780px]' : 'w-[780px] h-[390px]'
          }`}
        >
          {/* Inner Phone Screen */}
          <div className="relative w-full h-full rounded-[40px] bg-black overflow-hidden flex flex-col justify-between shadow-inner">
            {/* Volume Feedback Toast Overlay */}
            {volumeFeedback !== null && (
              <div className="absolute top-12 left-4 z-50 p-2.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 text-white flex items-center gap-2 shadow-2xl animate-in fade-in duration-150">
                <Volume2 className="w-4 h-4 text-red-400" />
                <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${volumeFeedback}%` }} />
                </div>
                <span className="text-[10px] font-mono">{volumeFeedback}%</span>
              </div>
            )}

            {/* Android Status Bar */}
            <AndroidStatusBar
              timeStr={timeStr}
              wifiEnabled={settings.wifiEnabled}
              batteryLevel={88}
              unreadNotificationsCount={notifications.filter((n) => n.unread).length}
              onOpenShade={() => setIsShadeOpen(true)}
            />

            {/* Screen Content Viewport */}
            <div className="relative flex-1 w-full overflow-hidden bg-black flex flex-col">
              {/* Lock Screen */}
              {isLocked ? (
                <AndroidLockScreen
                  timeStr={timeStr}
                  onUnlock={() => setIsLocked(false)}
                  notifications={notifications}
                  wallpaperGradient={currentWallpaper.gradient}
                />
              ) : isRecentsOpen ? (
                /* Recent Apps Screen */
                <AndroidRecentApps
                  recentApps={recentApps}
                  onSelectApp={(appId) => handleOpenApp(appId)}
                  onCloseApp={(appId) => {
                    setRecentApps((prev) => prev.filter((id) => id !== appId));
                    if (activeApp === appId) setActiveApp(null);
                  }}
                  onClearAll={() => {
                    setRecentApps([]);
                    setActiveApp(null);
                    setIsRecentsOpen(false);
                  }}
                  onCloseRecents={() => setIsRecentsOpen(false)}
                />
              ) : activeApp === null ? (
                /* Android Home Screen */
                <AndroidHomeScreen
                  onOpenApp={handleOpenApp}
                  wallpaperGradient={currentWallpaper.gradient}
                />
              ) : activeApp === 'z1movies' ? (
                /* The Real Z1 Movies App */
                <div className="w-full h-full overflow-y-auto no-scrollbar relative flex-1">
                  {children}
                </div>
              ) : activeApp === 'chrome' ? (
                /* Chrome App */
                <ChromeApp onOpenApp={handleOpenApp} />
              ) : activeApp === 'settings' ? (
                /* Settings App */
                <SettingsApp settings={settings} onUpdateSettings={setSettings} />
              ) : activeApp === 'files' ? (
                /* Files App */
                <FilesApp onOpenApp={handleOpenApp} />
              ) : activeApp === 'gallery' ? (
                /* Gallery App */
                <GalleryApp onUpdateSettings={setSettings} />
              ) : activeApp === 'calculator' ? (
                /* Calculator App */
                <CalculatorApp />
              ) : null}

              {/* Notification Shade Pull-down */}
              <AndroidNotificationShade
                isOpen={isShadeOpen}
                onClose={() => setIsShadeOpen(false)}
                settings={settings}
                onUpdateSettings={setSettings}
                notifications={notifications}
                onClearNotifications={() => setNotifications([])}
                onOpenApp={handleOpenApp}
                timeStr={timeStr}
              />
            </div>

            {/* Android Navigation Bar */}
            <AndroidNavBar
              navMode={settings.navMode}
              onBack={handleBack}
              onHome={handleHome}
              onRecents={handleRecents}
            />
          </div>
        </div>
      </div>

      {/* Helpful Hint Footer */}
      <footer className="mt-3 text-center text-[11px] text-neutral-400">
        <span>Click <strong>Z1 MOVIES</strong> to test streaming • Tap Status Bar for Quick Settings • Side buttons work</span>
      </footer>
    </div>
  );
};
