import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vasturent.app',
  appName: 'Vastu Rent',
  webDir: 'dist',
  server: {
    url: 'https://new-vastu-rent-client.vercel.app', // Your local IP + dev server port
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
