import { ExpoRouter } from 'expo-router';

type StaticRoutes = ExpoRouter.__routes['StaticRoutes'];

export const ROUTES = {
  AUTH: {
    SIGN_IN: '/(auth)/sign-in' as StaticRoutes,
    SIGN_UP: '/(auth)/sign-up' as StaticRoutes,
  },
  TABS: {
    ROOT: '/(tabs)/' as StaticRoutes,
    PROFILE: '/(tabs)/profile' as StaticRoutes,
  },
  MODAL: '/modal' as StaticRoutes,
} as const;

// Type-safe route helper
export function isValidRoute(route: string): route is StaticRoutes {
  const validRoutes = new Set<string>([
    '/',
    '/(auth)',
    '/(auth)/sign-in',
    '/(auth)/sign-up',
    '/(tabs)',
    '/(tabs)/',
    '/(tabs)/profile',
    '/modal',
  ]);
  return validRoutes.has(route);
}

// Type-safe navigation helper
export function getTypedRoute(route: StaticRoutes): StaticRoutes {
  return route;
} 