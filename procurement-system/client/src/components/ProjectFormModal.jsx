import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';

const ProjectFormModal = ({ isOpen, onClose, onSuccess, project = null, departments = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    procurementMethod: 'specific',
    budgetAmount: '',
    budgetYear: new Date().getFullYear() + 543, // Thai Buddhist year
    budgetType: '',
    budgetFiscalYear: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      // Edit mode - populate form
      // Convert Christian year from DB to Buddhist year for display
      const dbYear = project.budgetYear || project.budget_year;
      const displayYear = dbYear ? parseInt(dbYear) + 543 : new Date().getFullYear() + 543;

      setFormData({
        name: project.name || '',
        description: project.description || '',
        departmentId: project.departmentId || project.department_id || '',
        procurementMethod: project.procurementMethod || project.procurement_method || 'specific',
        budgetAmount: project.budgetAmount || project.budget || '',
        budgetYear: displayYear,
        budgetType: project.budgetType || project.budget_type || '',
        budgetFiscalYear: project.budgetFiscalYear || project.budget_fiscal_year || '',
        startDate: project.startDate || project.start_date || new Date().toISOString().split('T')[0]
      });
    } else {
      // Create mode - reset form
      setFormData({
        name: '',
        description: '',
        departmentId: '',
        procurementMethod: 'specific',
        budgetAmount: '',
        budgetYear: new Date().getFullYear() + 543, // Thai Buddhist year
        budgetType: '',
        budgetFiscalYear: '',
        startDate: new Date().toISOString().split('T')[0]
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
      // Convert Buddhist year to Christian year for API
      const budgetYearChristian = parseInt(formData.budgetYear) - 543;

      // Prepare payload with proper data types
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        departmentId: parseInt(formData.departmentId),
        procurementMethod: formData.procurementMethod,
        budgetAmount: parseFloat(formData.budgetAmount),
        budgetYear: budgetYearChristian,
        budgetType: formData.budgetType ? parseInt(formData.budgetType) : undefined,
        budgetFiscalYear: formData.budgetFiscalYear ? parseInt(formData.budgetFiscalYear) : undefined,
        startDate: formData.startDate
      };

      if (project) {
        // Update existing project
        await projectsAPI.update(project.id, payload);
      } else {
        // Create new project
        await projectsAPI.create(payload);
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

          {/* Budget Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทงบประมาณ
            </label>
            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="budgetType"
                  value="1"
                  checked={formData.budgetType === '1'}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">
                  1. เงินงบประมาณตามเทศบัญญัติ งบประมาณรายจ่าย ประจำปีงบประมาณ พ.ศ.
                </span>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  name="budgetType"
                  value="2"
                  checked={formData.budgetType === '2'}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">2. เงินอุดหนุนเฉพาะกิจ</span>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  name="budgetType"
                  value="3"
                  checked={formData.budgetType === '3'}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">3. เงินสะสม</span>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  name="budgetType"
                  value="4"
                  checked={formData.budgetType === '4'}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">
                  4. เงินรายจ่ายค้างจ่าย (เงินกัน) ประจำปีงบประมาณ พ.ศ.
                </span>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  name="budgetType"
                  value="5"
                  checked={formData.budgetType === '5'}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">
                  5. อื่นๆ (เงินที่มีการยกเว้นระเบียบ) ประจำปีงบประมาณ พ.ศ.
                </span>
              </label>
            </div>
          </div>

          {/* Budget Fiscal Year - Show only for types 1, 4, 5 */}
          {(formData.budgetType === '1' || formData.budgetType === '4' || formData.budgetType === '5') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ปีงบประมาณ พ.ศ. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budgetFiscalYear"
                value={formData.budgetFiscalYear}
                onChange={handleChange}
                required
                min="2500"
                max="2700"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="เช่น 2568"
              />
            </div>
          )}

          {/* Department and Budget - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                กอง/สำนัก <span className="text-red-500">*</span>
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกกอง/สำนัก</option>
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
                name="budgetAmount"
                value={formData.budgetAmount}
                onChange={handleChange}
                required
                min="1"
                max="50000000"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Procurement Method and Budget Year - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วิธีจัดซื้อจัดจ้าง <span className="text-red-500">*</span>
              </label>
              <select
                name="procurementMethod"
                value={formData.procurementMethod}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกวิธีจัดซื้อจัดจ้าง</option>
                <option value="public_invitation">ประกาศเชิญชวน (e-bidding)</option>
                <option value="selection">คัดเลือก</option>
                <option value="specific">เฉพาะเจาะจง</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ปีงบประมาณ (พ.ศ.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budgetYear"
                value={formData.budgetYear}
                onChange={handleChange}
                required
                min="2563"
                max="2643"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2568"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่เริ่มต้นโครงการ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
