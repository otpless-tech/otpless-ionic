import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';


const config: CapacitorConfig = {
  plugins: {
    Keyboard: {
      // Use appropriate enum references for resize and style
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
  },
  appId: 'io.ionic.starter',
  appName: 'example',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
