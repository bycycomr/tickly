import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../lib/api';
import type { User } from '../lib/types';

type UserInfo = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  tenantId: string;
  roles?: string[];
  deptRole?: string;
};

type AuthContextType = {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);
      } catch (e) {
        console.error('Invalid stored user data:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const response = await api.login({ username, password });

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    setToken(response.token);
    setUser(response.user as UserInfo);
  }

  async function register(username: string, email: string, password: string, displayName: string) {
    const response = await api.register({ username, email, password, displayName });

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    setToken(response.token);
    setUser(response.user as UserInfo);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
  }

  function hasRole(role: string): boolean {
    return user?.roles?.includes(role) || false;
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
