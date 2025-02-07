/* DEPRECATED: We now use Zustand for user authentication state management.
   This provider has been replaced by the user state in store/index.ts.
   Keeping this file commented out for reference in case we need to roll back.
*/

/*
import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '@/config/appwrite';
import { Models } from 'appwrite';

interface AuthUser extends Models.User<Models.Preferences> {
  id: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const session = await account.get();
      // Appwrite user already has $id which we map to id
      setUser({ ...session, id: session.$id } as AuthUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
*/ 