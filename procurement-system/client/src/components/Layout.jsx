import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-chart-line', roles: ['admin', 'staff', 'executive'] },
    { name: 'โครงการทั้งหมด', path: '/projects', icon: 'fa-folder-open', roles: ['admin', 'staff', 'executive'] },
    { name: 'ขั้นตอนล่าช้า', path: '/overdue', icon: 'fa-triangle-exclamation', roles: ['admin', 'staff', 'executive'] },
    { name: 'จัดการโครงการ', path: '/admin/projects', icon: 'fa-gear', roles: ['admin'] },
    { name: 'จัดการผู้ใช้', path: '/admin/users', icon: 'fa-users', roles: ['admin'] },
  ];

  const visibleNavigation = navigation.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Modern Navbar with Gradient */}
      <nav className="bg-white shadow-lg border-b-2 border-blue-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Title */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                  <i className="fas fa-building text-white text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    ระบบจัดซื้อจัดจ้าง
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">เทศบาลตำบลหัวทะเล</p>
                </div>
              </Link>
            </div>

            {/* Navigation Links - Modern Pill Style with Border */}
            <div className="hidden md:flex items-center gap-3">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-blue-700 transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <i className={`fas ${item.icon} text-base`}></i>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <NotificationDropdown />

              {/* User Info Card */}
              <div className="hidden sm:block text-right bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border-2 border-blue-200">
                <p className="text-sm font-bold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-blue-700 font-semibold">
                  {user?.role === 'admin' && '👑 ผู้ดูแลระบบ'}
                  {user?.role === 'staff' && '📋 เจ้าหน้าที่'}
                  {user?.role === 'executive' && '⭐ ผู้บริหาร'}
                </p>
              </div>

              {/* Logout Button - Red with Border */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 border-2 border-red-800"
              >
                <i className="fas fa-right-from-bracket text-base"></i>
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Tab Bar Style */}
        <div className="md:hidden bg-white border-t-2 border-blue-200">
          <div className="flex justify-around py-2">
            {visibleNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-3 py-2 text-xs font-bold transition-all duration-200 rounded-lg ${
                  isActive(item.path)
                    ? 'text-blue-700 bg-blue-50 border-2 border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`fas ${item.icon} text-xl mb-1`}></i>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content - Modern Card Style */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer - Modern Style */}
      <footer className="bg-white shadow-lg border-t-2 border-blue-500 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-700 font-semibold">
            © 2024 เทศบาลตำบลหัวทะเล - ระบบจัดการโครงการจัดซื้อจัดจ้าง
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
