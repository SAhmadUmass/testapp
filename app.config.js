import 'dotenv/config';

export default {
  expo: {
    name: 'testapp',
    slug: 'testapp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shaheer.tiktokclone'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.shaheer.tiktokclone'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-router'
    ],
    scheme: 'testapp',
    extra: {
      // Remove Firebase config
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      }
    }
  }
}; 