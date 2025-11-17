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

  // Quick login buttons for demo
  const quickLogin = (username, password, role) => {
    setFormData({ username, password, role });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Modern Header with Icon */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl border-4 border-white">
            <i className="fas fa-building text-white text-5xl"></i>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            ระบบจัดซื้อจัดจ้าง
          </h1>
          <p className="text-gray-700 font-semibold text-lg">เทศบาลตำบลหัวทะเล</p>
        </div>

        {/* Modern Login Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <i className="fas fa-sign-in-alt text-blue-600"></i>
            เข้าสู่ระบบ
          </h2>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6 font-semibold flex items-center gap-3 shadow-md">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-user mr-2 text-blue-600"></i>
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900 placeholder-gray-400 hover:border-blue-400 transition-all"
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-lock mr-2 text-green-600"></i>
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 pr-14 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900 placeholder-gray-400 hover:border-blue-400 transition-all"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors text-xl"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-user-tag mr-2 text-purple-600"></i>
                ประเภทผู้ใช้
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-900 hover:border-blue-400 transition-all cursor-pointer"
              >
                <option value="staff">📋 เจ้าหน้าที่</option>
                <option value="admin">👑 ผู้ดูแลระบบ</option>
                <option value="executive">⭐ ผู้บริหาร</option>
              </select>
            </div>

            {/* Submit Button - Modern Gradient Style */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-5 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed active:scale-95 border-2 border-blue-700 mt-8"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-2xl"></i>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt text-2xl"></i>
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Modern Quick Login Demo */}
          <div className="mt-10 pt-8 border-t-2 border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2">
              <i className="fas fa-bolt text-yellow-500"></i>
              ทดสอบระบบด่วน:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => quickLogin('admin', 'password123', 'admin')}
                className="w-full flex items-center gap-3 text-sm bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-gray-900 py-4 px-5 rounded-xl font-bold transition-all duration-200 border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-lg active:scale-95"
              >
                <i className="fas fa-shield-halved text-xl text-purple-600"></i>
                <div className="text-left flex-1">
                  <div className="font-bold">Admin (ผู้ดูแลระบบ)</div>
                  <div className="text-xs text-gray-600 font-semibold">admin / password123</div>
                </div>
                <i className="fas fa-arrow-right text-purple-600"></i>
              </button>
              <button
                onClick={() => quickLogin('staff_engineering', 'password123', 'staff')}
                className="w-full flex items-center gap-3 text-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-gray-900 py-4 px-5 rounded-xl font-bold transition-all duration-200 border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-lg active:scale-95"
              >
                <i className="fas fa-hard-hat text-xl text-blue-600"></i>
                <div className="text-left flex-1">
                  <div className="font-bold">Staff (กองช่าง)</div>
                  <div className="text-xs text-gray-600 font-semibold">staff_engineering / password123</div>
                </div>
                <i className="fas fa-arrow-right text-blue-600"></i>
              </button>
              <button
                onClick={() => quickLogin('executive_mayor', 'password123', 'executive')}
                className="w-full flex items-center gap-3 text-sm bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-gray-900 py-4 px-5 rounded-xl font-bold transition-all duration-200 border-2 border-green-200 hover:border-green-400 shadow-md hover:shadow-lg active:scale-95"
              >
                <i className="fas fa-crown text-xl text-green-600"></i>
                <div className="text-left flex-1">
                  <div className="font-bold">Executive (ผู้บริหาร)</div>
                  <div className="text-xs text-gray-600 font-semibold">executive_mayor / password123</div>
                </div>
                <i className="fas fa-arrow-right text-green-600"></i>
              </button>
            </div>
          </div>

          {/* Modern View All Credentials Link */}
          <div className="mt-8 text-center">
            <Link
              to="/credentials"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-xl border-2 border-blue-200 hover:border-blue-400"
            >
              <i className="fas fa-file-lines"></i>
              ดูข้อมูลบัญชีผู้ใช้ทั้งหมด
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="text-center mt-8 text-sm text-gray-700 font-semibold bg-white rounded-2xl py-4 px-6 shadow-lg border-2 border-gray-200">
          <p className="flex items-center justify-center gap-2">
            <i className="fas fa-copyright text-blue-600"></i>
            2024 เทศบาลตำบลหัวทะเล
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
