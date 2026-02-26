import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useTRPCAuth } from '@/_core/hooks/useAuth';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  email_confirmed_at?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ data: any; error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: trpcUser, loading, isAuthenticated, logout } = useTRPCAuth();

  // Map tRPC user to AuthUser shape
  const user: AuthUser | null = trpcUser
    ? {
        id: String(trpcUser.id),
        email: trpcUser.email ?? undefined,
        user_metadata: {
          full_name: trpcUser.name ?? undefined,
        },
        email_confirmed_at: trpcUser.createdAt ? String(trpcUser.createdAt) : undefined,
      }
    : null;

  const signIn = async (_email: string, _password: string) => {
    // Redirect to OAuth login
    window.location.href = '/api/auth/login';
    return { error: null };
  };

  const signUp = async (_email: string, _password: string, _metadata?: Record<string, unknown>): Promise<{ data: any; error: Error | null }> => {
    window.location.href = '/api/auth/login';
    return { data: { user: null }, error: null };
  };

  const signOut = async () => {
    await logout();
  };

  const updateProfile = async (_data: Record<string, unknown>) => {
    return { error: null };
  };

  const resetPassword = async (_email: string) => {
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
      isEmailVerified: !!(user?.email_confirmed_at),
        signIn,
        signUp,
        signOut,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
