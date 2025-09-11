'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/auth';
import { UserRole } from '@/types';

interface AuthContextType {
  role: UserRole | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Проверяем аутентификацию при загрузке
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Используем новую систему аутентификации
      const isValid = await authService.validateToken();
      
      if (isValid) {
        const currentUser = authService.getCurrentUser();
        const currentRole = authService.getCurrentRole();
        
        if (currentUser && currentRole) {
          setRole(currentRole);
          setEmail(currentUser.email);
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    
    if (result.success) {
      const currentUser = authService.getCurrentUser();
      const currentRole = authService.getCurrentRole();
      
      if (currentUser && currentRole) {
        setRole(currentRole);
        setEmail(currentUser.email);
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    }
    
    return result;
  };

  const logout = async () => {
    await authService.logout();
    
    setRole(null);
    setEmail(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    role,
    email,
    isAuthenticated,
    login,
    logout,
    loading,
    user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useRole() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}