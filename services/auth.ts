import { Account } from 'react-native-appwrite';
import { account, ID, ensureDatabase, ensureCollections } from '@/config/appwrite';
import { Models } from 'appwrite';
import { createUserProfile } from './database';

export type AppwriteUser = Models.User<Models.Preferences>;

// Helper function to create a valid Appwrite user ID
const createValidUserId = (): string => {
  // Generate a unique ID that's guaranteed to be valid
  return 'user_' + Math.random().toString(36).substring(2, 11);
};

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: AppwriteUser | null; error: string | null }> => {
  try {
    // Ensure database and collections exist first
    await ensureDatabase();
    await ensureCollections();
    
    // Create user with unique ID
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // If creation successful, create session and user profile
    if (user) {
      // Create session
      await account.createEmailPasswordSession(email, password);
      
      // Create user profile in database
      const { error: profileError } = await createUserProfile(user.$id, {
        name,
        email,
        created_at: new Date().toISOString()
      });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }

    return { user, error: null };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { user: null, error: error.message };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: AppwriteUser | null; error: string | null }> => {
  try {
    // Create the email password session
    await account.createEmailPasswordSession(email, password);
    // Get the user data
    const user = await account.get();
    return { user, error: null };
  } catch (error: any) {
    console.error('Login error:', error);
    return { user: null, error: error.message };
  }
};

export const logout = async (): Promise<{ error: string | null }> => {
  try {
    await account.deleteSession('current');
    return { error: null };
  } catch (error: any) {
    console.error('Logout error:', error); // For debugging
    return { error: error.message };
  }
};

// Since Appwrite doesn't have a direct auth state listener,
// we'll implement a polling mechanism
export const subscribeToAuthChanges = (
  callback: (user: AppwriteUser | null) => void
): (() => void) => {
  // Initial check
  account.get()
    .then(user => callback(user))
    .catch(() => callback(null));

  // Set up polling every 5 seconds
  const interval = setInterval(() => {
    account.get()
      .then(user => callback(user))
      .catch(() => callback(null));
  }, 5000);

  return () => {
    clearInterval(interval);
  };
}; 