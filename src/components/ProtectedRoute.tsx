import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import type { PropsWithChildren } from 'react';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isBootstrapped } = useAuth();

  if (!isBootstrapped) {
    return <div className="screen-state">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
