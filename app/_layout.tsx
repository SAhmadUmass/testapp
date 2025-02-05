import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { View, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { subscribeToAuthChanges } from '@/services/auth';
import { ROUTES } from '@/utils/routes';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';
import '../global.css';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize Firebase in a controlled manner
function useFirebaseInit() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;
    if (!firebaseConfig) {
      throw new Error('Firebase configuration is not provided in app.config.js');
    }

    try {
      initializeApp(firebaseConfig);
      getAuth(); // Initialize auth
      setIsFirebaseReady(true);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }, []);

  return isFirebaseReady;
}

// Separate component for auth navigation logic
function AuthNavigationHandler() {
  const segments = useSegments();
  const router = useRouter();
  const { user, setUser, isHydrated } = useStore();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [isHydrated]);

  useEffect(() => {
    if (!segments || !isAuthReady || !isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      router.replace(ROUTES.AUTH.SIGN_IN);
    } else if (user && inAuthGroup) {
      router.replace(ROUTES.TABS.ROOT);
    }
  }, [user, segments, isAuthReady, isHydrated]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const isFirebaseReady = useFirebaseInit();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isFirebaseReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isFirebaseReady]);

  if (!loaded || !isFirebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootLayoutNav>
      <AuthNavigationHandler />
    </RootLayoutNav>
  );
}

function RootLayoutNav({ children }: { children?: React.ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
      <Slot />
    </ThemeProvider>
  );
}
