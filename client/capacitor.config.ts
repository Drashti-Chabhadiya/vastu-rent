import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vasturent.app',
  appName: 'Vastu Rent',
  webDir: 'dist',
  server: {
    url: 'https://new-vastu-rent-client.vercel.app', // Your local IP + dev server port
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      // Android: show notification even when the app is in the foreground
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    CapacitorUpdater: {
      autoUpdate: true,
    },
  },
}

export default config
