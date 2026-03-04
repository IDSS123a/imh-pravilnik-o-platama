import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useLocation } from 'wouter';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, mutate } = useSWR('/api/auth/me', fetcher, {
    shouldRetryOnError: false,
  });
  const [location, setLocation] = useLocation();
  const loading = !data && !error;
  const user = data?.user || null;

  const login = async (credentials: any) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const result = await res.json();
    if (result.success) {
      await mutate(); // Re-fetch user
      setLocation('/');
    } else {
      throw new Error(result.error);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await mutate(null, false); // Clear user data
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
