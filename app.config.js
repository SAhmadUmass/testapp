import 'dotenv/config';

export default {
  expo: {
    name: 'tiktokclone1',
    slug: 'tiktokclone1',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'myapp',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shaheer.tiktokclone'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.shaheer.tiktokclone'
    },
    web: {
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router'
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Appwrite Configuration
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
      APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
      APPWRITE_PLATFORM_ID: process.env.APPWRITE_PLATFORM_ID,
      eas: {
        projectId: "your-eas-project-id"
      }
    },
    babel: {
      presets: ['babel-preset-expo'],
      plugins: ['nativewind/babel']
    }
  }
}; 