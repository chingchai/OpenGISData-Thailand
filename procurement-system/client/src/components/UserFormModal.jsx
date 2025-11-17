import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const UserFormModal = ({ isOpen, onClose, onSuccess, user, departments }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'staff',
    departmentId: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        password: '', // Don't show existing password
        fullName: user.full_name || '',
        email: user.email || '',
        role: user.role || 'staff',
        departmentId: user.department_id || '',
        active: user.active !== undefined ? user.active : true
      });
      setError('');
      setShowPassword(false);
    } else if (!user && isOpen) {
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'staff',
        departmentId: '',
        active: true
      });
      setError('');
      setShowPassword(false);
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare payload
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email?.trim() || undefined,
        role: formData.role,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        active: formData.active
      };

      if (isEditMode) {
        // Edit mode - only include password if it's being changed
        if (formData.password) {
          payload.password = formData.password;
        }
        await usersAPI.update(user.id, payload);
      } else {
        // Create mode - all fields required
        payload.username = formData.username.trim();
        payload.password = formData.password;
        await usersAPI.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-200">
        {/* Header with Gradient */}
        <div className="flex items-center justify-between p-6 border-b-4 border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <i className={`fas ${isEditMode ? 'fa-user-edit' : 'fa-user-plus'} text-3xl`}></i>
            {isEditMode ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-blue-600 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 font-bold text-2xl border-2 border-white"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl flex items-center gap-3 font-semibold shadow-md">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
              {error}
            </div>
          )}

          {/* Username (disabled in edit mode) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fas fa-user mr-2 text-blue-600"></i>
              ชื่อผู้ใช้ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isEditMode}
              required={!isEditMode}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all ${
                isEditMode ? 'bg-gray-100 cursor-not-allowed border-gray-300' : 'border-gray-300 hover:border-blue-400 bg-white'
              }`}
              placeholder="กรอกชื่อผู้ใช้ (ภาษาอังกฤษ/ตัวเลข)"
            />
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-2 font-medium">
                <i className="fas fa-info-circle mr-1"></i>
                ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fas fa-key mr-2 text-green-600"></i>
              รหัสผ่าน {!isEditMode && <span className="text-red-600">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white hover:border-blue-400 transition-all"
                placeholder={isEditMode ? 'ใส่รหัสผ่านใหม่หากต้องการเปลี่ยน' : 'กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors text-xl"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-2 font-medium">
                <i className="fas fa-info-circle mr-1"></i>
                เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fas fa-id-card mr-2 text-purple-600"></i>
              ชื่อ-นามสกุล <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white hover:border-blue-400 transition-all"
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fas fa-envelope mr-2 text-orange-600"></i>
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white hover:border-blue-400 transition-all"
              placeholder="กรอกอีเมล (ถ้ามี)"
            />
          </div>

          {/* Role and Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-user-tag mr-2 text-blue-600"></i>
                ตำแหน่ง <span className="text-red-600">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold bg-white hover:border-blue-400 transition-all"
              >
                <option value="staff">📋 เจ้าหน้าที่</option>
                <option value="admin">👑 ผู้ดูแลระบบ</option>
                <option value="executive">⭐ ผู้บริหาร</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-building mr-2 text-indigo-600"></i>
                หน่วยงาน
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white hover:border-blue-400 transition-all"
              >
                <option value="">-- ไม่ระบุ --</option>
                {departments && departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-300">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="active" className="text-base font-bold text-gray-700 cursor-pointer flex items-center gap-2">
              <i className="fas fa-toggle-on text-green-600 text-xl"></i>
              เปิดใช้งาน
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-400 rounded-xl text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 bg-white"
            >
              <i className="fas fa-times text-lg"></i>
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed border-2 border-blue-700 flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-lg"></i>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <i className={`fas ${isEditMode ? 'fa-save' : 'fa-user-plus'} text-lg`}></i>
                  {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
