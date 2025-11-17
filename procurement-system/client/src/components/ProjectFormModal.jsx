import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';

const ProjectFormModal = ({ isOpen, onClose, onSuccess, project = null, departments = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_id: '',
    procurement_method: 'specific',
    budget: '',
    start_date: '',
    expected_end_date: '',
    status: 'draft',
    urgency_level: 'normal',
    contractor_type: 'construction'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      // Edit mode - populate form
      setFormData({
        name: project.name || '',
        description: project.description || '',
        department_id: project.department_id || '',
        procurement_method: project.procurement_method || 'specific',
        budget: project.budget || '',
        start_date: project.start_date || '',
        expected_end_date: project.expected_end_date || '',
        status: project.status || 'draft',
        urgency_level: project.urgency_level || 'normal',
        contractor_type: project.contractor_type || 'construction'
      });
    } else {
      // Create mode - reset form
      setFormData({
        name: '',
        description: '',
        department_id: '',
        procurement_method: 'specific',
        budget: '',
        start_date: '',
        expected_end_date: '',
        status: 'draft',
        urgency_level: 'normal',
        contractor_type: 'construction'
      });
    }
    setError('');
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (project) {
        // Update existing project
        await projectsAPI.update(project.id, formData);
      } else {
        // Create new project
        await projectsAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกโครงการ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {project ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อโครงการ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกชื่อโครงการ"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกรายละเอียดโครงการ"
            />
          </div>

          {/* Department and Budget - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หน่วยงาน <span className="text-red-500">*</span>
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกหน่วยงาน</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                งบประมาณ (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Procurement Method and Status - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วิธีจัดซื้อจัดจ้าง <span className="text-red-500">*</span>
              </label>
              <select
                name="procurement_method"
                value={formData.procurement_method}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public_invitation">ประกาศเชิญชวน (e-bidding)</option>
                <option value="selection">คัดเลือก</option>
                <option value="specific">เฉพาะเจาะจง</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">ร่าง</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="delayed">ล่าช้า</option>
                <option value="cancelled">ยกเลิก</option>
                <option value="on_hold">พักการดำเนินการ</option>
              </select>
            </div>
          </div>

          {/* Dates - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มต้น <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่คาดว่าแล้วเสร็จ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expected_end_date"
                value={formData.expected_end_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Urgency and Contractor Type - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความเร่งด่วน
              </label>
              <select
                name="urgency_level"
                value={formData.urgency_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="normal">ปกติ</option>
                <option value="urgent">เร่งด่วน</option>
                <option value="critical">เร่งด่วนมาก</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทผู้รับจ้าง
              </label>
              <select
                name="contractor_type"
                value={formData.contractor_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="construction">ก่อสร้าง</option>
                <option value="goods">จัดซื้อ</option>
                <option value="services">จ้างเหมาบริการ</option>
                <option value="consulting">จ้างที่ปรึกษา</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'กำลังบันทึก...' : (project ? 'บันทึกการแก้ไข' : 'สร้างโครงการ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
