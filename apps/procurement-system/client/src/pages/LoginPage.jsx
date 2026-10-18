import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password, formData.role);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const quickLogin = (username, password, role) => {
    setFormData({ username, password, role });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors">
      <div className="max-w-md w-full">
        {/* Logo & Title - iOS Clean */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <i className="fas fa-building text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
            ระบบกำกับติดตามความก้าวหน้าโครงการ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">เทศบาลตำบลหัวทะเล</p>
        </div>

        {/* Login Card - iOS Clean */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <i className="fas fa-sign-in-alt text-blue-500"></i>
            เข้าสู่ระบบ
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <i className="fas fa-exclamation-triangle"></i>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ประเภทผู้ใช้
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
                <option value="executive">ผู้บริหาร</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3.5 px-6 rounded-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login - iOS Clean */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              ทดสอบระบบด่วน:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('admin', 'password123', 'admin')}
                className="w-full flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
              >
                <i className="fas fa-shield-halved text-purple-500"></i>
                <div className="text-left flex-1">
                  <div className="font-medium">Admin (ผู้ดูแลระบบ)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">admin / password123</div>
                </div>
                <i className="fas fa-arrow-right text-gray-400"></i>
              </button>
              <button
                onClick={() => quickLogin('staff_engineering', 'password123', 'staff')}
                className="w-full flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
              >
                <i className="fas fa-hard-hat text-blue-500"></i>
                <div className="text-left flex-1">
                  <div className="font-medium">Staff (กองช่าง)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">staff_engineering / password123</div>
                </div>
                <i className="fas fa-arrow-right text-gray-400"></i>
              </button>
              <button
                onClick={() => quickLogin('executive_mayor', 'password123', 'executive')}
                className="w-full flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
              >
                <i className="fas fa-crown text-green-500"></i>
                <div className="text-left flex-1">
                  <div className="font-medium">Executive (ผู้บริหาร)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">executive_mayor / password123</div>
                </div>
                <i className="fas fa-arrow-right text-gray-400"></i>
              </button>
            </div>
          </div>

          {/* View Credentials Link */}
          <div className="mt-6 text-center">
            <Link
              to="/credentials"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              <i className="fas fa-file-lines"></i>
              ดูข้อมูลบัญชีผู้ใช้ทั้งหมด
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 เทศบาลตำบลหัวทะเล</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
