
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fc011c136bcb4af3a250673b4c01b07d',
  appName: 'pocket-ledger-buddy',
  webDir: 'dist',
  server: {
    url: 'https://fc011c13-6bcb-4af3-a250-673b4c01b07d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
