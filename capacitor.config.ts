import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.z1movies.app',
  appName: 'Z1 Movies',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
