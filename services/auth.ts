import { ID } from 'appwrite';
import { account } from '@/config/appwrite';
import { Models } from 'appwrite';

export type AppwriteUser = Models.User<Models.Preferences>;

export const signUp = async (
  email: string,
  password: string,
  username: string
): Promise<{ user: AppwriteUser | null; error: string | null }> => {
  try {
    const user = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: AppwriteUser | null; error: string | null }> => {
  try {
    // First create the session
    await account.createSession(email, password);
    // Then get the user data
    const user = await account.get();
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logout = async (): Promise<{ error: string | null }> => {
  try {
    await account.deleteSession('current');
    return { error: null };
  } catch (error: any) {
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