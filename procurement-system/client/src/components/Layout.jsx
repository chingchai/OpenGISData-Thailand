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
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['admin', 'staff', 'executive'] },
    { name: 'โครงการทั้งหมด', path: '/projects', icon: '📁', roles: ['admin', 'staff', 'executive'] },
    { name: 'ขั้นตอนล่าช้า', path: '/overdue', icon: '⚠️', roles: ['admin', 'staff', 'executive'] },
    { name: 'จัดการโครงการ', path: '/admin/projects', icon: '⚙️', roles: ['admin'] },
  ];

  const visibleNavigation = navigation.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-ios-gray-lighter font-ios">
      {/* iOS Style Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-ios-gray-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Title */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-ios-blue to-ios-blue-dark rounded-ios-lg flex items-center justify-center text-2xl shadow-ios">
                  🏛️
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    ระบบจัดซื้อจัดจ้าง
                  </h1>
                  <p className="text-xs text-ios-gray">เทศบาลตำบลหัวทะเล</p>
                </div>
              </Link>
            </div>

            {/* Navigation Links - iOS Pill Style */}
            <div className="hidden md:flex items-center gap-2">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-ios-blue text-white shadow-ios'
                      : 'text-gray-700 hover:bg-ios-gray-light'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Section - iOS Style */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationDropdown />

              {/* User Info Card */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-ios-gray">
                  {user?.role === 'admin' && 'ผู้ดูแลระบบ'}
                  {user?.role === 'staff' && 'เจ้าหน้าที่'}
                  {user?.role === 'executive' && 'ผู้บริหาร'}
                </p>
              </div>

              {/* Logout Button - iOS Pill Style */}
              <button
                onClick={handleLogout}
                className="bg-ios-red hover:bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-ios-card active:scale-95"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - iOS Tab Bar Style */}
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-ios-gray-light">
          <div className="flex justify-around py-2">
            {visibleNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-4 py-2 text-xs font-medium transition-colors ${
                  isActive(item.path) ? 'text-ios-blue' : 'text-ios-gray'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="font-semibold">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content - iOS Style */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer - iOS Style */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-ios-gray-light mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-ios-gray font-medium">
            © 2024 เทศบาลตำบลหัวทะเล - ระบบจัดการโครงการจัดซื้อจัดจ้าง
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
