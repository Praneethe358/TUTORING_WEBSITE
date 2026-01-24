import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedTutorRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="text-center mt-10 text-slate-200">Loading...</div>;
  if (!user || role !== 'tutor') return <Navigate to="/tutor/login" replace />;
  return children;
};

export default ProtectedTutorRoute;
