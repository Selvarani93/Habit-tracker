import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, LayoutDashboard, TrendingUp, Briefcase, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { path: '/routine-template', label: 'Routine Template', icon: Calendar },
    { path: '/daily-tracker', label: 'Daily Tracker', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/interviews', label: 'Interviews', icon: Briefcase },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-momentum-offwhite p-4 gap-4">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-momentum-dark shadow-2xl flex flex-col transition-all duration-300 rounded-2xl overflow-hidden`}>
        {/* Logo/Header */}
        <div className={`p-6 border-b border-gray-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div
            className={`flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : ''}`}
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <img
              src="/m-letter.jpg"
              alt="Momentum Logo"
              className="w-10 h-10 rounded-lg flex-shrink-0 object-cover"
              style={{ minWidth: '40px', minHeight: '40px' }}
            />
            {!isCollapsed && (
              <h1 className="text-2xl font-bold text-momentum-offwhite whitespace-nowrap">Momentum</h1>
            )}
          </div>
          {!isCollapsed && (
            <p className="text-sm text-gray-400 mt-1 truncate">{user?.email}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive(item.path)
                    ? 'bg-momentum-lavender text-momentum-dark'
                    : 'text-momentum-offwhite hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-momentum-offwhite hover:bg-red-900/30 hover:text-red-300 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-lg">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
