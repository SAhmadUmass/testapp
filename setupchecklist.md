# Initial Project Setup Technical PRD Checklist

## Project Creation
- [ ] Create new Expo project with TypeScript template
  ```bash
  npx create-expo-app TikTokClone -t expo-template-typescript
  cd TikTokClone
  ```
- [ ] Initialize Git repository
  ```bash
  git init
  ```
- [ ] Create .gitignore file with necessary entries

## Core Dependencies
- [ ] Install Firebase
  ```bash
  npx expo install firebase
  ```
- [ ] Install Navigation
  ```bash
  npx expo install @react-navigation/native @react-navigation/stack
  npx expo install react-native-screens react-native-safe-area-context
  ```
- [ ] Install Video Dependencies
  ```bash
  npx expo install expo-av
  npx expo install expo-camera
  ```

## UI Dependencies
- [ ] Install NativeWind
  ```bash
  npm install nativewind
  npm install --dev tailwindcss@3.3.2
  ```
- [ ] Install Gesture Handler
  ```bash
  npx expo install react-native-gesture-handler
  ```
- [ ] Install Reanimated
  ```bash
  npx expo install react-native-reanimated
  ```

## State Management
- [ ] Install Zustand
  ```bash
  npm install zustand
  ```

## Project Configuration
- [ ] Configure Tailwind
  - [ ] Create tailwind.config.js
  - [ ] Update babel.config.js
- [ ] Set up Firebase config
  - [ ] Create firebase.ts config file
  - [ ] Add environment variables support
- [ ] Configure TypeScript
  - [ ] Update tsconfig.json
  - [ ] Create type definitions

## Folder Structure
- [ ] Create project directories
  ```
  src/
    ├── components/
    ├── screens/
    ├── navigation/
    ├── services/
    ├── hooks/
    ├── store/
    ├── types/
    └── utils/
  ```

## Initial Files
- [ ] Create basic App.tsx
- [ ] Set up navigation configuration
- [ ] Create Firebase service wrapper
- [ ] Set up initial Zustand store

## Environment Setup
- [ ] Create .env file
- [ ] Set up environment variables
- [ ] Add .env to .gitignore

## Testing Configuration
- [ ] Install testing dependencies
  ```bash
  npm install --save-dev jest @testing-library/react-native
  ```
- [ ] Set up test configuration

Want me to provide the contents for any of these configuration files or elaborate on any steps?