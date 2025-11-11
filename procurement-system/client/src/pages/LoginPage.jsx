import React, { useState, useEffect } from 'react';
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

  // Initialize Lucide icons
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-ios-gray-lighter font-ios flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* iOS Style Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-ios-blue to-ios-blue-dark rounded-ios-2xl mx-auto mb-4 flex items-center justify-center shadow-ios-lg">
            <i data-lucide="building-2" className="w-10 h-10 text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ระบบจัดซื้อจัดจ้าง
          </h1>
          <p className="text-ios-gray font-medium">เทศบาลตำบลหัวทะเล</p>
        </div>

        {/* iOS Style Login Form Card */}
        <div className="bg-white rounded-ios-2xl shadow-ios-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">เข้าสู่ระบบ</h2>

          {error && (
            <div className="bg-ios-red/10 border border-ios-red/20 text-ios-red px-5 py-4 rounded-ios-lg mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username - iOS Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 placeholder-ios-gray"
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            {/* Password - iOS Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                รหัสผ่าน
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 placeholder-ios-gray"
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>

            {/* Role - iOS Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                ประเภทผู้ใช้
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
                <option value="executive">ผู้บริหาร</option>
              </select>
            </div>

            {/* Submit Button - iOS Pill Style */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-ios-blue hover:bg-ios-blue-dark text-white font-semibold py-4 px-6 rounded-full transition-all shadow-ios disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 mt-6 border-2 border-ios-blue"
            >
              {loading ? (
                <>
                  <i data-lucide="loader-2" className="w-5 h-5 animate-spin"></i>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <i data-lucide="log-in" className="w-5 h-5"></i>
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          {/* iOS Style Quick Login Demo */}
          <div className="mt-8 pt-8 border-t border-ios-gray-light">
            <p className="text-sm font-semibold text-ios-gray mb-4">ทดสอบระบบด่วน:</p>
            <div className="space-y-3">
              <button
                onClick={() => quickLogin('admin', 'password123', 'admin')}
                className="w-full flex items-center gap-3 text-sm bg-ios-gray-lighter hover:bg-ios-gray-light text-gray-900 py-3 px-4 rounded-ios-lg font-medium transition-all active:scale-98"
              >
                <i data-lucide="shield" className="w-5 h-5 text-ios-blue"></i>
                Admin (ผู้ดูแลระบบ)
              </button>
              <button
                onClick={() => quickLogin('staff_engineering', 'password123', 'staff')}
                className="w-full flex items-center gap-3 text-sm bg-ios-gray-lighter hover:bg-ios-gray-light text-gray-900 py-3 px-4 rounded-ios-lg font-medium transition-all active:scale-98"
              >
                <i data-lucide="hard-hat" className="w-5 h-5 text-ios-orange"></i>
                Staff (กองช่าง)
              </button>
              <button
                onClick={() => quickLogin('executive_mayor', 'password123', 'executive')}
                className="w-full flex items-center gap-3 text-sm bg-ios-gray-lighter hover:bg-ios-gray-light text-gray-900 py-3 px-4 rounded-ios-lg font-medium transition-all active:scale-98"
              >
                <i data-lucide="crown" className="w-5 h-5 text-ios-yellow"></i>
                Executive (ผู้บริหาร)
              </button>
            </div>
          </div>

          {/* iOS Style View All Credentials Link */}
          <div className="mt-6 text-center">
            <Link
              to="/credentials"
              className="inline-flex items-center gap-2 text-ios-blue hover:text-ios-blue-dark text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ดูข้อมูลบัญชีผู้ใช้ทั้งหมด
            </Link>
          </div>
        </div>

        {/* iOS Style Footer */}
        <div className="text-center mt-8 text-sm text-ios-gray font-medium">
          <p>© 2024 เทศบาลตำบลหัวทะเล</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
