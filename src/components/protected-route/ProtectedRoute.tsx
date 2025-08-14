import { useAppSelector } from '../../app/hooks';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
}