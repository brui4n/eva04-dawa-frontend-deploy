'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const savedToken = localStorage.getItem('lms_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchApi('/auth/me');
        if (data && data.user) {
          setUser(data.user);
        } else {
          // Token is invalid
          localStorage.removeItem('lms_token');
          localStorage.removeItem('lms_user');
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        // Clear local storage if token is invalid or expired
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data && data.token && data.user) {
        localStorage.setItem('lms_token', data.token);
        localStorage.setItem('lms_user', JSON.stringify(data.user));
        setUser(data.user);
        router.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    setLoading(true);
    try {
      const data = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role }),
      });

      if (data && data.token && data.user) {
        localStorage.setItem('lms_token', data.token);
        localStorage.setItem('lms_user', JSON.stringify(data.user));
        setUser(data.user);
        router.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error on server:', error);
    } finally {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
