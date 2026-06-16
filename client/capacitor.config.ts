import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vasturent.app',
  appName: 'Vastu Rent',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
  },
  // No server.url — the APK serves from its own bundled dist/ assets.
  // Setting server.url would cause the WebView to ignore the local dist and load
  // from a remote URL instead, breaking all auth fixes baked into the bundle.
  //
  // For local network debugging: set server.url to your machine's IP, e.g.:
  // server: { url: 'http://192.168.1.x:3000', cleartext: true }
  plugins: {
    PushNotifications: {
      // Android: show notification even when the app is in the foreground
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    CapacitorUpdater: {
      autoUpdate: false, // Disable auto-update to prevent overwriting our fixed bundle
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      // Push webview below status bar — content starts AFTER status bar
      overlaysWebView: false,
      // Cream background matching the app theme (#faf7f0 ≈ oklch(0.984 0.012 95))
      backgroundColor: '#FDFAF4',
      style: 'DARK',
    },
  },
}

export default config
