import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-chart-line', roles: ['admin', 'staff', 'executive'] },
    { name: 'โครงการ', path: '/projects', icon: 'fa-folder-open', roles: ['admin', 'staff', 'executive'] },
    { name: 'แผนที่', path: '/map', icon: 'fa-map-marked-alt', roles: ['admin', 'staff', 'executive'] },
    { name: 'ล่าช้า', path: '/overdue', icon: 'fa-clock', roles: ['admin', 'staff', 'executive'] },
    { name: 'จัดการ', path: '/admin/projects', icon: 'fa-gear', roles: ['admin'] },
    { name: 'ผู้ใช้', path: '/admin/users', icon: 'fa-users', roles: ['admin'] },
  ];

  const visibleNavigation = navigation.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* iOS Style Navbar - Clean & Minimal */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title - iOS Minimal */}
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-building text-white text-lg"></i>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ระบบกำกับติดตามความก้าวหน้าโครงการ
                  </h1>
                </div>
              </Link>
            </div>

            {/* Navigation - iOS Clean Style */}
            <div className="hidden md:flex items-center gap-2">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Section - iOS Minimal */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle - iOS Style */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                title={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
              >
                <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-gray-700 dark:text-gray-300`}></i>
              </button>

              {/* Notification */}
              <NotificationDropdown />

              {/* User Info - iOS Clean */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin' && 'ผู้ดูแล'}
                    {user?.role === 'staff' && 'เจ้าหน้าที่'}
                    {user?.role === 'executive' && 'ผู้บริหาร'}
                  </p>
                </div>
              </div>

              {/* Logout - iOS Minimal */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <i className="fas fa-right-from-bracket"></i>
                <span className="hidden sm:inline">ออก</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - iOS Tab Bar */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around py-2 bg-white dark:bg-gray-800">
            {visibleNavigation.slice(0, 4).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <i className={`fas ${item.icon} text-lg mb-1`}></i>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content - iOS Clean */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer - iOS Minimal */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 เทศบาลตำบลหัวทะเล
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
