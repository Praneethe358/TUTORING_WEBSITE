import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAdmin();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-slate-800 h-screen fixed left-0 top-0 text-white p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8 text-indigo-400">Admin Panel</h1>
      
      <nav className="flex-1 space-y-2">
        <Link
          to="/admin/dashboard"
          className={`block px-4 py-2 rounded ${isActive('/admin/dashboard') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Dashboard
        </Link>
        <Link
          to="/admin/tutors"
          className={`block px-4 py-2 rounded ${isActive('/admin/tutors') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Tutors
        </Link>
        <Link
          to="/admin/students"
          className={`block px-4 py-2 rounded ${isActive('/admin/students') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Students
        </Link>
        <Link
          to="/admin/bookings"
          className={`block px-4 py-2 rounded ${isActive('/admin/bookings') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Bookings
        </Link>
        <Link
          to="/admin/courses"
          className={`block px-4 py-2 rounded ${isActive('/admin/courses') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Courses
        </Link>
        <Link
          to="/admin/announcements"
          className={`block px-4 py-2 rounded ${isActive('/admin/announcements') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Announcements
        </Link>
        <Link
          to="/admin/analytics"
          className={`block px-4 py-2 rounded ${isActive('/admin/analytics') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Analytics
        </Link>
        <Link
          to="/admin/audit-logs"
          className={`block px-4 py-2 rounded ${isActive('/admin/audit-logs') ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
        >
          Audit Logs
        </Link>
      </nav>

      <button
        onClick={logout}
        className="w-full bg-red-600 hover:bg-red-500 px-4 py-2 rounded transition"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
