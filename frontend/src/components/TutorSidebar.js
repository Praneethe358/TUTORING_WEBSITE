import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * TUTOR SIDEBAR COMPONENT
 * 
 * Left sidebar navigation for tutor dashboard
 * - Shows active route highlighting
 * - Includes logout button
 * - Mobile responsive
 */
const TutorSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/tutor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tutor/profile', label: 'My Profile', icon: '👤' },
    { path: '/tutor/availability', label: 'Availability', icon: '📅' },
    { path: '/tutor/courses', label: 'My Courses', icon: '📚' },
    { path: '/tutor/manage-classes', label: 'Create Classes', icon: '➕' },
    { path: '/tutor/students', label: 'My Students', icon: '🎓' },
    { path: '/tutor/schedule', label: 'Class Schedule', icon: '🗓️' },
    { path: '/tutor/mark-attendance', label: 'Mark Attendance', icon: '✅' },
    { path: '/tutor/earnings', label: 'Earnings', icon: '💰' },
    { path: '/tutor/materials', label: 'Upload Materials', icon: '📤' },
    { path: '/tutor/messages', label: 'Messages', icon: '✉️' },
    { path: '/tutor/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="w-64 bg-slate-800 h-screen fixed left-0 top-0 text-white p-6 flex flex-col shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-400">Tutor Portal</h1>
        <p className="text-xs text-slate-400 mt-1">Teaching Dashboard</p>
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
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full bg-red-600 hover:bg-red-500 px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2 mt-4"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default TutorSidebar;
