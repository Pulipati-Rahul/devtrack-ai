'use client';

import * as React from 'react';
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client';

interface AuthContextType {
  user: any;
  session: any;
  isPending: boolean;
  isAuthenticated: boolean;
  signIn: typeof signIn;
  signUp: typeof signUp;
  signOut: typeof signOut;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, error } = useSession();

  const user = data?.user || null;
  const session = data?.session || null;
  const isAuthenticated = !!user;

  React.useEffect(() => {
    if (error) {
      console.error('Session fetching error:', error);
    }
  }, [error]);

  const value = React.useMemo(() => ({
    user,
    session,
    isPending,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  }), [user, session, isPending, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}
