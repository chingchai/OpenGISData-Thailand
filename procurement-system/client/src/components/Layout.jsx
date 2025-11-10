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
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'โครงการทั้งหมด', path: '/projects', icon: '📁' },
    { name: 'ขั้นตอนล่าช้า', path: '/overdue', icon: '⚠️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <span className="text-2xl mr-3">🏛️</span>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">
                    ระบบจัดซื้อจัดจ้าง
                  </h1>
                  <p className="text-xs text-gray-500">เทศบาลตำบลหัวทะเล</p>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Notification & User Menu */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <NotificationDropdown />

              {/* User Info */}
              <div className="text-right mr-4 ml-2">
                <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' && 'ผู้ดูแลระบบ'}
                  {user?.role === 'staff' && 'เจ้าหน้าที่'}
                  {user?.role === 'executive' && 'ผู้บริหาร'}
                  {user?.department && ` - ${user.department}`}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-3 py-2 text-xs font-medium ${
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 เทศบาลตำบลหัวทะเล - ระบบจัดการโครงการจัดซื้อจัดจ้าง
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
