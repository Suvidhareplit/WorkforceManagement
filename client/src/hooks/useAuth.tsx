import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/lib/auth';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const data = await authService.getCurrentUser();
          setUser({
            id: data.user.id,
            userId: data.user.userId,
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone || '',
            role: data.user.role,
            createdAt: data.user.createdAt || new Date().toISOString(),
            updatedAt: data.user.updatedAt || new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to get current user:', error);
          authService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const user = response.user as any;
      setUser({
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        role: user.role as 'admin' | 'hr' | 'recruiter' | 'manager' | 'trainer',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
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
