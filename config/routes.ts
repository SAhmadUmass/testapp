export const ROUTES = {
  AUTH: {
    SIGN_IN: '/(auth)/sign-in',
    SIGN_UP: '/(auth)/sign-up'
  },
  TABS: {
    ROOT: '/(tabs)',
    FEED: '/(tabs)/',
    PROFILE: '/(tabs)/profile'
  },
  MODAL: '/modal'
} as const;

// Type for the routes
export type AppRoutes = typeof ROUTES;
export type AuthRoutes = AppRoutes['AUTH'];
export type TabRoutes = AppRoutes['TABS']; 