import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.yourname.catfeeder',
  appName: 'catFeeder',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;