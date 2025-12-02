// context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: null | { email: string; name: string };
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<null | { email: string; name: string }>(null);

  const login = async (email: string, password: string) => {
    // Xử lý login thực tế
    setIsAuthenticated(true);
    setUser({ email, name: 'User' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    // Xử lý register thực tế
    // Sau khi đăng ký có thể tự động login
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}