import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = ['student'] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10 text-slate-200">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
