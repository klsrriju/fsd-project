import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api';

export type ThemeName = 'default' | 'dark' | 'emerald' | 'sunset' | 'ocean';

interface User {
  id: string;
  email: string;
  role: 'hr' | 'candidate';
  name: string;
  company?: string;
  industry?: string;
  location?: string;
  skills?: string[];
  targetRole?: string;
  themePreference?: ThemeName;
  githubUsername?: string;
  unstopUsername?: string;
  notifyFutureJobsOnRejection?: boolean;
  externalProfileData?: any;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<User>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeName>('default');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedTheme = (localStorage.getItem('themePreference') as ThemeName) || 'default';
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        const userTheme = (parsedUser.themePreference as ThemeName) || storedTheme;
        setThemeState(userTheme);
        applyThemeToDocument(userTheme);
      } catch {}

      // Refresh latest profile from backend asynchronously
      authAPI.me()
        .then((res) => {
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
            if (res.data.data.themePreference) {
              setThemeState(res.data.data.themePreference);
              applyThemeToDocument(res.data.data.themePreference);
            }
          }
        })
        .catch(() => {});
    } else {
      setThemeState(storedTheme);
      applyThemeToDocument(storedTheme);
    }
    setLoading(false);
  }, []);

  const applyThemeToDocument = (t: ThemeName) => {
    document.documentElement.setAttribute('data-theme', t);
  };

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem('themePreference', t);
    applyThemeToDocument(t);
    if (user) {
      updateUser({ themePreference: t });
      authAPI.updateProfile({ themePreference: t }).catch(() => {});
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email.trim(), password);
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.themePreference) {
      setTheme(userData.themePreference);
    }
  };

  const register = async (payload: Record<string, unknown>) => {
    const res = await authAPI.register(payload);
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.themePreference) {
      setTheme(userData.themePreference);
    }
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...data } as User;
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, theme, setTheme, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
