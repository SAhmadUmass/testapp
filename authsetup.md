# Enhanced Authentication Setup Technical PRD

Below is an expanded checklist with more detail on each step of setting up email/password authentication and basic user profiles using Firebase. This includes specific actions required and some best practices.

## 1. Initialize a Firebase Project
1. **Create Project in Firebase Console**  
   - Go to the [Firebase Console](https://console.firebase.google.com/) and click "Add project."  
   - Choose a project name, accept the terms, and complete the setup wizard.
2. **Enable Email/Password Authentication**  
   - In the Firebase Console, select "Build" → "Authentication" → "Sign-in method."  
   - Enable the "Email/Password" provider.

## 2. Integrate Firebase in Your Expo Project
1. **Install Firebase**  
   Use the web SDK (not `@react-native-firebase/*`):  
   ```bash
   npx expo install firebase
   ```
2. **Initialize Firebase**  
   - Create a new file (if not already present), for example:  
     ```typescript:config/firebase.ts
     import { initializeApp } from 'firebase/app';
     import { getAuth } from 'firebase/auth';
     import { getFirestore } from 'firebase/firestore';
     import { getStorage } from 'firebase/storage';
     import Constants from 'expo-constants';

     const firebaseConfig = Constants.manifest?.extra?.firebaseConfig;
     if (!firebaseConfig) {
       throw new Error('Firebase configuration is not provided in app.config.js');
     }

     // Initialize Firebase
     export const app = initializeApp(firebaseConfig);

     // Initialize Firebase services
     export const auth = getAuth(app);
     export const db = getFirestore(app);
     export const storage = getStorage(app);
     ```
   - Make sure you have the Firebase config in `app.config.js` or `app.json` under `expo.extra.firebaseConfig`.

## 3. Implement Email/Password Authentication
1. **Sign-Up Flow**  
   - Create a function that uses `createUserWithEmailAndPassword`:
     ```typescript:services/auth.ts
     import {
       createUserWithEmailAndPassword,
       signInWithEmailAndPassword,
       signOut,
       updateProfile
     } from 'firebase/auth';
     import { auth } from '../config/firebase';

     export const signUp = async (email: string, password: string, username: string) => {
       try {
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         const user = userCredential.user;
         // Optionally set display name or any other profile info
         await updateProfile(user, { displayName: username });
         return { userCredential, error: null };
       } catch (error) {
         return { userCredential: null, error };
       }
     };
     ```
   - In your UI, capture the user’s email, password, and optional username, then call `signUp`.
   - Provide feedback for validation errors (e.g., email in use, weak password).

2. **Login Flow**  
   - Create a function that uses `signInWithEmailAndPassword`:
     ```typescript:services/auth.ts
     export const signIn = async (email: string, password: string) => {
       try {
         const userCredential = await signInWithEmailAndPassword(auth, email, password);
         return { userCredential, error: null };
       } catch (error) {
         return { userCredential: null, error };
       }
     };
     ```
   - In your UI, capture the user’s email and password, then call this method and handle errors.

3. **Logout Flow**  
   - Create a function using `signOut`:
     ```typescript:services/auth.ts
     export const logout = async () => {
       try {
         await signOut(auth);
         return { error: null };
       } catch (error) {
         return { error };
       }
     };
     ```
   - This can be triggered from a user profile screen or settings page.

## 4. Create User Profiles in Firestore
1. **Set Up Users Collection**  
   - Create a `users` collection in Firestore to store additional user data (e.g., bio, avatar URL).
   - You can either:
     - Write to Firestore immediately after the sign-up process, or
     - Use `updateDoc` after the user logs in with basic details.

2. **User Document Structure**  
   For example:
   ```json
   {
     "username": "demoUser",
     "email": "user@example.com",
     "displayName": "Demo User",
     "photoURL": "https://example.com/some-photo.jpg",
     "bio": "Hello, I love posting Tiktok-like videos!",
     "createdAt": "...",
     "updatedAt": "..."
   }
   ```
   You can extend this structure to suit your app’s needs.

3. **Create/Update User Document**  
   ```typescript:services/firestore.ts
   import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
   import { db } from '../config/firebase';

   export const createUserProfile = async (userId: string, userData: any) => {
     try {
       const userRef = doc(db, 'users', userId);
       await updateDoc(userRef, {
         ...userData,
         updatedAt: serverTimestamp()
       });
       return { error: null };
     } catch (error: any) {
       return { error: error.message };
     }
   };
   ```
   - Call this function after sign-up or login to make sure user docs stay synced.

## 5. Verify Security Rules (Optional, Recommended)
1. **Restrict Access**  
   - In the Firebase console, under "Firestore Database" → "Rules," configure rules so that only the logged-in user can update their own profile document.

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **Test**  
   - Attempt to write to a user profile from an authenticated user with the correct userId.
   - Attempt to write to a different user’s profile to confirm it is rejected.

## 6. Testing & Verification
1. **Manual Testing**  
   - Sign up with a new email, ensure the user’s data is stored in Firebase Authentication and a matching Firestore document is created.
   - Log in with the same credentials.
   - Error Handling: Test invalid credentials, short passwords, etc.
2. **UI/UX Testing**  
   - Display user-friendly error messages (e.g., “Email already in use,” “Password must be 6 characters”).
   - Confirm profile info (display name, photo URL) shows up in the app after sign-up or login.

## 7. Next Steps
- **Persistent Login**: Use Firebase’s `onAuthStateChanged` to listen for auth state changes and keep the user logged in.
- **Social Providers** (Optional): Add Google or Facebook sign-in if desired.  
- **Profile Editing**: Build a user profile screen where the user can edit their username, bio, or photo.

---

**Completion of this checklist ensures**:
1. Users can sign up, log in, and log out with email/password.
2. Each user’s profile data is stored properly in Firestore.
3. Firestore rules are configured for secure reads/writes.
4. The authentication flow is functional, tested, and user-friendly.
```
