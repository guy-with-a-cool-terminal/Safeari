import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, logout as apiLogout } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = () => {
    setAuthenticated(isAuthenticated());
  };

  const logout = () => {
    // Clear only subscription cache (keep lastViewedProfileId for restore on next login)
    localStorage.removeItem('cached_tier');

    apiLogout();
    setAuthenticated(false);

    window.location.href = '/login';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: authenticated, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
