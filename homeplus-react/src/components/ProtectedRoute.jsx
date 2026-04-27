import { Navigate } from 'react-router-dom';
import { useAuthSession } from '../hooks/useAuthSession';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useAuthSession();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
