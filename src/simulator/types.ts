export type AndroidAppId = 'z1movies' | 'chrome' | 'settings' | 'files' | 'gallery' | 'calculator';

export type NavMode = 'gestures' | 'buttons';

export interface PhoneSettings {
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  mobileDataEnabled: boolean;
  airplaneMode: boolean;
  darkMode: boolean;
  flashlight: boolean;
  doNotDisturb: boolean;
  brightness: number; // 20 - 100
  volume: number; // 0 - 100
  navMode: NavMode;
  wallpaperIndex: number;
}

export interface AppNotification {
  id: string;
  appId: AndroidAppId;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}
