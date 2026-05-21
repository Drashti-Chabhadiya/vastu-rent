import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vasturent.app',
  appName: 'Vastu Rent',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.23:3000', // Your local IP + dev server port
    cleartext: true,
  },
}

export default config

// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.vasturent.app',
//   appName: 'Vastu Rent',
//   webDir: 'dist',
//   server: {
//     androidScheme: 'https'
//   }
// };

// export default config;
