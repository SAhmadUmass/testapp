# Initial Project Setup Technical PRD Checklist

## Project Creation
- [x] Create new Expo project with TypeScript template
  ```bash
  npx create-expo-app TikTokClone -t expo-template-typescript
  cd TikTokClone
  ```
- [x] Initialize Git repository
  ```bash
  git init
  ```
- [x] Create .gitignore file with necessary entries
Here's the corrected dependency installation list for Expo projects:

**## Core Dependencies**
- [x] Install Firebase
```bash
npx expo install firebase
```
- [x] Install Navigation
```bash
npx expo install @react-navigation/native
npx expo install @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```
- [x] Install Video Dependencies
```bash
npx expo install expo-av
npx expo install expo-camera
npx expo install expo-video-thumbnails
```

**## UI Dependencies**
- [x] Install NativeWind & Tailwind
```bash
npm install nativewind
npm install --dev tailwindcss@3.3.2
```
- [x] Install Gesture Handler
```bash
npx expo install react-native-gesture-handler
```
- [x] Install Reanimated
```bash
npx expo install react-native-reanimated
```

**## State Management**
- [x] Install Zustand
```bash
npx expo zustand
```

Key changes:
1. Changed `@react-navigation/stack` to `@react-navigation/native-stack`
2. Added `expo-video-thumbnails` to video dependencies
3. Made sure all core packages use `npx expo install` instead of `npm install`
4. Kept NativeWind and Zustand with `npm install` as they're not Expo-specific packages

## Project Configuration
- [x] Configure Tailwind
  - [x] Create tailwind.config.js
  - [x] Update babel.config.js
- [x] Set up Firebase config
  - [x] Create firebase.ts config file
  - [x] Add environment variables support
- [x] Configure TypeScript
  - [x] Update tsconfig.json
  - [x] Create type definitions

## Folder Structure
- [x] Create project directories
  ```
  TESTAPP/
├── app/           # Routes and screens
├── components/    # Shared components
├── services/      # Firebase services
├── hooks/         # Custom hooks
├── store/         # Zustand store
├── config/        # Firebase config
└── utils/         # Helper functions
  ```

## Initial Files

- [ ] Configure Firebase services in `config/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';

export const firebaseConfig = {
  // Your config object here
};

export const app = initializeApp(firebaseConfig);
```

- [ ] Create Zustand store in `store/index.ts`
```typescript
import create from 'zustand';

export const useStore = create((set) => ({
  // Initial state
}));
```

- [ ] Add Firebase service wrappers in `services/`
```typescript
// services/auth.ts, services/firestore.ts, etc.
```

Navigation configuration isn't needed since we're using Expo Router with the `app` directory structure. 

## Environment Setup
- [x] Create .env file
- [x] Set up environment variables
- [x] Add .env to .gitignore

## Testing Configuration
- [ ] Install testing dependencies
  ```bash
  npm install --save-dev jest @testing-library/react-native
  ```
- [ ] Set up test configuration

Want me to provide the contents for any of these configuration files or elaborate on any steps?