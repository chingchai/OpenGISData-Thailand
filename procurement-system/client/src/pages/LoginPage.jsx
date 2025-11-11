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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ระบบจัดซื้อจัดจ้าง
          </h1>
          <p className="text-gray-600">เทศบาลตำบลหัวทะเล</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทผู้ใช้
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Quick Login Demo */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">ทดสอบระบบด่วน:</p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('admin', 'password123', 'admin')}
                className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded"
              >
                👨‍💼 Admin (ผู้ดูแลระบบ)
              </button>
              <button
                onClick={() => quickLogin('staff_engineering', 'password123', 'staff')}
                className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded"
              >
                👷 Staff (กองช่าง)
              </button>
              <button
                onClick={() => quickLogin('executive_mayor', 'password123', 'executive')}
                className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded"
              >
                🎯 Executive (ผู้บริหาร)
              </button>
            </div>
          </div>

          {/* View All Credentials Link */}
          <div className="mt-4 text-center">
            <Link
              to="/credentials"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ดูข้อมูลบัญชีผู้ใช้ทั้งหมด
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2024 เทศบาลตำบลหัวทะเล</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
