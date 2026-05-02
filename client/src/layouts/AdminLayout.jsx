import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin/dashboard', label: '📊 Dashboard' },
  { path: '/admin/events', label: '🎟️ Events' },
  { path: '/admin/users', label: '👥 Users' },
  { path: '/admin/volunteers', label: '🙋 Volunteers' },
  { path: '/admin/tasks', label: '📋 Tasks' },
  { path: '/admin/incidents', label: '🚨 Incidents' },
  { path: '/admin/announcements', label: '📢 Announcements' },
  { path: '/admin/scan', label: '📷 Scan Ticket' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">🎓 Eventra</h1>
          <p className="text-blue-300 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-200 hover:bg-blue-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
              </div>
            </div>
            <NotificationBell />
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-blue-300 hover:text-white hover:bg-blue-800 py-2 rounded-lg transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}