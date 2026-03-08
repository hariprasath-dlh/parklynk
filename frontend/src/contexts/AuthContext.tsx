import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole, VerificationStatus } from '@/types';
import { authAPI } from '@/services/api';
import { disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setVerificationStatus: (status: VerificationStatus) => void;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  licenseImage?: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('parklynk-user');
    const savedToken = localStorage.getItem('parklynk-token');
    if (!savedUser || !savedToken) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const persistUser = useCallback((nextUser: User | null, token?: string) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('parklynk-user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('parklynk-user');
    }
    if (token) {
      localStorage.setItem('parklynk-token', token);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('parklynk-token');
    if (!token) {
      setUser(null);
      localStorage.removeItem('parklynk-user');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    authAPI
      .getProfile()
      .then((result) => {
        if (!cancelled && result.success && result.user) {
          persistUser(result.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('parklynk-token');
          localStorage.removeItem('parklynk-user');
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [persistUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authAPI.login(email, password);
      if (result.success && result.user) {
        persistUser(result.user, result.token);
      }
      return { success: result.success, error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, [persistUser]);

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    try {
      const result = await authAPI.signup(data);
      if (result.success && result.user) {
        persistUser(result.user, result.token);
      }
      return { success: result.success, user: result.user, error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, [persistUser]);

  const logout = useCallback(() => {
    disconnectSocket();
    setUser(null);
    localStorage.removeItem('parklynk-user');
    localStorage.removeItem('parklynk-token');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('parklynk-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setVerificationStatus = useCallback((status: VerificationStatus) => {
    updateUser({ verificationStatus: status });
  }, [updateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user && localStorage.getItem('parklynk-token')),
        login,
        signup,
        logout,
        updateUser,
        setVerificationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
