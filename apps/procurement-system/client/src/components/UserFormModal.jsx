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
        password: '',
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
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email?.trim() || undefined,
        role: formData.role,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        active: formData.active
      };

      if (isEditMode) {
        if (formData.password) {
          payload.password = formData.password;
        }
        await usersAPI.update(user.id, payload);
      } else {
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header - iOS Clean */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            <i className={`fas ${isEditMode ? 'fa-user-edit' : 'fa-user-plus'} text-blue-500`}></i>
            {isEditMode ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ชื่อผู้ใช้ {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isEditMode}
              required={!isEditMode}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isEditMode
                  ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
              }`}
              placeholder="กรอกชื่อผู้ใช้"
            />
            {isEditMode && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              รหัสผ่าน {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={isEditMode ? 'ใส่รหัสผ่านใหม่หากต้องการเปลี่ยน' : 'กรอกรหัสผ่าน'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {isEditMode && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="กรอกอีเมล (ถ้ามี)"
            />
          </div>

          {/* Role and Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ตำแหน่ง <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแล</option>
                <option value="executive">ผู้บริหาร</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                หน่วยงาน
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- ไม่ระบุ --</option>
                {departments && departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              เปิดใช้งาน
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <i className={`fas ${isEditMode ? 'fa-save' : 'fa-plus'}`}></i>
                  {isEditMode ? 'บันทึก' : 'เพิ่มผู้ใช้'}
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
