import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const ProtectedAdminRoute = ({ children }) => {
  const { admin, loading } = useAdmin();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
};

export default ProtectedAdminRoute;
