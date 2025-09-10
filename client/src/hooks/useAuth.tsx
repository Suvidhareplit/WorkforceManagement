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
      console.log('🔄 Initializing auth state...');
      
      try {
        // Check if we have a token first
        const token = authService.getToken();
        console.log('🔑 Token exists:', !!token);
        
        if (token && authService.isAuthenticated()) {
          console.log('✅ Token is valid - fetching user data...');
          // Fetch user data to restore state on page refresh
          try {
            const response = await authService.getCurrentUser();
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
            console.log('✅ User state restored from token');
          } catch (error) {
            console.error('❌ Failed to fetch user data, clearing token:', error);
            authService.removeToken();
            setUser(null);
          }
        } else {
          console.log('❌ No valid token found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('🏁 Auth initialization complete, isLoading set to false');
      }
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
