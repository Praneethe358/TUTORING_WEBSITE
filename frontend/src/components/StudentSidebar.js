import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * STUDENT SIDEBAR COMPONENT
 * 
 * Left sidebar navigation for student dashboard
 * - Shows active route highlighting
 * - Includes logout button
 * - Mobile responsive (can be enhanced with collapse logic)
 */
const StudentSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/profile', label: 'My Profile', icon: '👤' },
    { path: '/tutors', label: 'Find Tutors', icon: '🔍' },
    { path: '/student/favorites', label: 'Favorites', icon: '❤️' },
    { path: '/student/classes', label: 'My Classes', icon: '📚' },
    { path: '/student/attendance', label: 'Attendance', icon: '📝' },
    { path: '/student/materials', label: 'Materials', icon: '📄' },
    { path: '/student/messages', label: 'Messages', icon: '✉️' },
    { path: '/announcements', label: 'Announcements', icon: '📢' },
    { path: '/student/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="w-64 bg-slate-800 h-screen fixed left-0 top-0 text-white p-6 flex flex-col shadow-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-400">Student Portal</h1>
        <p className="text-xs text-slate-400 mt-1">Learning Dashboard</p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive(item.path) 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full bg-red-600 hover:bg-red-500 px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default StudentSidebar;
