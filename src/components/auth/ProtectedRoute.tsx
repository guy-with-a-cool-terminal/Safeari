import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects routes by checking authentication status
 * Redirects to /login if user is not authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
