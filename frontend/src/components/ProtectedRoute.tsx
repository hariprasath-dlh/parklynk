import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireVerification = false,
}) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'vehicle_user') return <Navigate to="/vehicle" replace />;
    if (user.role === 'house_owner') return <Navigate to="/owner" replace />;
    return <Navigate to="/" replace />;
  }

  if (requireVerification && user.role === 'vehicle_user' && user.verificationStatus !== 'verified') {
    return <Navigate to="/vehicle/verify-license" replace />;
  }

  return <>{children}</>;
};
