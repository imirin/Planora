import { Link, useLocation } from'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Folder, 
  Clock, 
  BarChart3, 
  CalendarDays,
  BookOpen,
  User, 
  Settings, 
  LogOut,
  X 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
 const location = useLocation();
 const { logout } = useAuth();

const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

const handleLogout = () => {
    logout();
    onClose();
  };

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/subjects', icon: Folder, label: 'Subjects' },
    { path: '/timer', icon: Clock, label: 'Timer' },
    { path: '/my-classes', icon: BookOpen, label: 'My Classes' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

 return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50
          transform transition-transform duration-300 ease-in-out
          w-64
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-xl text-blue-600">Planora</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
            
          return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg
                  transition-colors
                  ${active 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
