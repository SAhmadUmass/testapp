# Authentication Implementation Documentation

## Overview
This document outlines the authentication implementation in our Expo app using Firebase Authentication and expo-router for navigation.

## Tech Stack
- **Firebase Web SDK** for authentication
- **expo-router v4** for navigation
- **zustand** for state management
- **nativewind** for styling

## Features
- Email/Password Authentication
- Google Sign-In
- Persistent Authentication
- Protected Routes
- Profile Management

## Implementation Details

### 1. Firebase Configuration
Firebase is initialized in `config/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// ... other imports

const firebaseConfig = Constants.manifest?.extra?.firebaseConfig;
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 2. Authentication Services
Located in `services/auth.ts`, providing:
- `signUp(email, password, username)`: Email/password registration
- `signIn(email, password)`: Email/password login
- `signInWithGoogle()`: Google authentication
- `logout()`: Sign out functionality
- `subscribeToAuthChanges(callback)`: Auth state listener

### 3. State Management
Using Zustand (`store/index.ts`) for managing:
- Authentication state
- Loading states
- Error handling
- Persistent storage with AsyncStorage

### 4. Navigation Structure
```
app/
├── (auth)/
│   ├── _layout.tsx    # Auth layout with navigation guard
│   ├── sign-in.tsx    # Sign in screen
│   └── sign-up.tsx    # Sign up screen
└── (tabs)/
    ├── _layout.tsx    # Protected tabs layout
    ├── index.tsx      # Home/Feed screen
    └── profile.tsx    # User profile screen
```

### 5. Route Protection
- Auth layout (`app/(auth)/_layout.tsx`) redirects authenticated users to tabs
- Tabs layout (`app/(tabs)/_layout.tsx`) redirects unauthenticated users to sign in

### 6. Navigation Types
Using expo-router v4's typed routes:
```typescript
// Example of typed navigation
router.replace('/(tabs)/' satisfies Route<string>);
router.replace('/(auth)/sign-in' as any);
```

## Usage Examples

### Sign In
```typescript
const handleSignIn = async () => {
  setIsLoading(true);
  const { user, error } = await signIn(email, password);
  if (error) {
    setError(error);
  } else if (user) {
    setUser(user);
    router.replace('/(tabs)/');
  }
  setIsLoading(false);
};
```

### Protected Route Check
```typescript
useEffect(() => {
  if (!user) {
    router.replace('/(auth)/sign-in');
  }
}, [user]);
```

## Current Limitations & TODOs
1. **Form Validation**
   - [ ] Add email format validation
   - [ ] Add password strength requirements
   - [ ] Add username validation

2. **Error Handling**
   - [ ] Implement toast/alert system for error messages
   - [ ] Add more descriptive error messages

3. **Password Recovery**
   - [ ] Add forgot password functionality
   - [ ] Implement password reset flow

4. **Testing**
   - [ ] Add unit tests for auth services
   - [ ] Add integration tests for auth flow
   - [ ] Add E2E tests for critical paths

## Security Considerations
1. **Firebase Rules**: Ensure proper Firestore security rules are set up
2. **Token Management**: Auth tokens are handled by Firebase SDK
3. **Sensitive Data**: No sensitive data is stored locally except auth tokens
4. **Session Management**:
   - Firebase auto-refreshes tokens
   - Implement proper error handling for token expiration
   - Clear all local data on logout
5. **OAuth Security**:
   - Configure proper OAuth redirect domains in Firebase Console
   - Implement PKCE for OAuth flows
   - Validate OAuth tokens server-side
6. **Rate Limiting**:
   - Implement client-side throttling for auth attempts
   - Configure Firebase Auth rate limits in console
7. **Error Handling**:
   - Never expose detailed auth errors to users
   - Log auth failures securely
   - Monitor for suspicious activities

## Firebase-Specific Setup
1. **Firebase Console Configuration**:
   ```typescript
   // Required settings in Firebase Console
   - Enable Email/Password provider
   - Enable Google Sign-In
   - Configure OAuth redirect domains
   - Set up proper security rules
   ```

2. **Environment Variables**:
   ```bash
   # Required in .env file
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_domain
   FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config
   ```

3. **Auth State Persistence**:
   ```typescript
   // Firebase auth persistence is set to 'local' by default
   // This means the user will remain logged in until explicitly signed out
   // You can modify this behavior:
   import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

   const auth = getAuth();
   setPersistence(auth, browserLocalPersistence);
   ```

## Best Practices
1. Use Firebase Web SDK (not React Native SDK)
2. Clear error states after navigation
3. Handle loading states for better UX
4. Use proper TypeScript types
5. Follow expo-router's group routing conventions

## Troubleshooting
1. **Route Type Errors**
   - Ensure expo-router v4 is installed
   - Run `npx expo start -c` to regenerate route types
   - Use proper route paths as defined in the app directory

2. **Auth State Issues**
   - Check Firebase console for auth provider settings
   - Verify environment variables are properly set
   - Check network connectivity

## References
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Firebase Web SDK Documentation](https://firebase.google.com/docs/web/setup)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Framework-Specific Considerations

### Expo Router
- Use file-based routing for automatic deep linking
- Leverage group routes for auth flow organization
- Utilize static rendering for web platform
- Implement proper route typing without `any`
```typescript
// TODO: Replace this:
router.replace('/(tabs)/' as any);
// With proper typing:
router.replace('/(tabs)/' satisfies Route<string>);
```

### Zustand State Management
- Use selectors for optimal performance
```typescript
// Prefer this:
const user = useStore(state => state.user);
// Over this:
const { user } = useStore();
```
- Add devtools for debugging
```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      // ... store implementation
    })
  )
);
```

### React Native
- Implement proper error boundaries
```typescript
import { ErrorBoundary } from 'expo-router';

export {
  ErrorBoundary,
} from 'expo-router';
```
- Add static analysis tools
```json
// In package.json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
// Example auth service test
import { signIn } from '@/services/auth';

describe('Auth Service', () => {
  it('should handle sign in', async () => {
    const { user, error } = await signIn('test@example.com', 'password');
    expect(error).toBeNull();
    expect(user).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Example auth flow test
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '@/app/(auth)/sign-in';

describe('Sign In Flow', () => {
  it('should navigate to tabs after successful sign in', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Sign In'));
    
    await waitFor(() => {
      // Verify navigation occurred
    });
  });
});
```

## Development Workflow
1. Start development server with route type generation:
   ```bash
   npx expo start -c
   ```
2. Run type checking in watch mode:
   ```bash
   npm run typecheck -- --watch
   ```
3. Run tests during development:
   ```bash
   npm run test:watch
   ``` 