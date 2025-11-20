import { useState, useEffect } from 'react';
import { projectsAPI, departmentsAPI } from '../services/api';
import MapPicker from './MapPicker';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  // Default location - Hua Talay Municipality Office, Nakhon Ratchasima
  const DEFAULT_LOCATION = {
    type: 'Point',
    coordinates: [102.0983, 14.9753] // [longitude, latitude]
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    procurementMethod: '',
    budgetAmount: '',
    budgetYear: new Date().getFullYear() + 543, // Thai Buddhist year
    startDate: new Date().toISOString().split('T')[0],
    location: DEFAULT_LOCATION
  });
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const procurementMethods = [
    { value: 'public_invitation', label: 'ประกาศเชิญชวน (e-bidding)' },
    { value: 'selection', label: 'คัดเลือก' },
    { value: 'specific', label: 'เฉพาะเจาะจง' }
  ];

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentsAPI.getAll();
        setDepartments(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      }
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อโครงการ';
    } else if (formData.name.length < 5) {
      newErrors.name = 'ชื่อโครงการต้องมีอย่างน้อย 5 ตัวอักษร';
    } else if (formData.name.length > 200) {
      newErrors.name = 'ชื่อโครงการต้องไม่เกิน 200 ตัวอักษร';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'รายละเอียดต้องไม่เกิน 1000 ตัวอักษร';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'กรุณาเลือกกอง/สำนัก';
    }

    if (!formData.procurementMethod) {
      newErrors.procurementMethod = 'กรุณาเลือกวิธีจัดซื้อจัดจ้าง';
    }

    if (!formData.budgetAmount) {
      newErrors.budgetAmount = 'กรุณากรอกงบประมาณ';
    } else if (parseFloat(formData.budgetAmount) <= 0) {
      newErrors.budgetAmount = 'งบประมาณต้องมากกว่า 0';
    } else if (parseFloat(formData.budgetAmount) > 50000000) {
      newErrors.budgetAmount = 'งบประมาณต้องไม่เกิน 50,000,000 บาท';
    }

    if (!formData.budgetYear) {
      newErrors.budgetYear = 'กรุณากรอกปีงบประมาณ';
    } else if (formData.budgetYear < 2563 || formData.budgetYear > 2643) {
      newErrors.budgetYear = 'ปีงบประมาณไม่ถูกต้อง (พ.ศ. 2563-2643)';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'กรุณาเลือกวันที่เริ่มต้น';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert Buddhist year to Christian year for API
      const budgetYearChristian = parseInt(formData.budgetYear) - 543;

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        departmentId: parseInt(formData.departmentId),
        procurementMethod: formData.procurementMethod,
        budgetAmount: parseFloat(formData.budgetAmount),
        budgetYear: budgetYearChristian,
        startDate: formData.startDate,
        location: formData.location
      };

      await projectsAPI.create(payload);

      // Reset form
      setFormData({
        name: '',
        description: '',
        departmentId: '',
        procurementMethod: '',
        budgetAmount: '',
        budgetYear: new Date().getFullYear() + 543,
        startDate: new Date().toISOString().split('T')[0],
        location: DEFAULT_LOCATION
      });

      // Close modal and trigger success callback
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setApiError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'เกิดข้อผิดพลาดในการสร้างโครงการ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        departmentId: '',
        procurementMethod: '',
        budgetAmount: '',
        budgetYear: new Date().getFullYear() + 543,
        startDate: new Date().toISOString().split('T')[0],
        location: DEFAULT_LOCATION
      });
      setErrors({});
      setApiError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              เพิ่มโครงการใหม่
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {apiError}
              </div>
            )}

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อโครงการ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ระบุชื่อโครงการ"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียด
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="รายละเอียดเพิ่มเติมของโครงการ"
                disabled={loading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Department and Procurement Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  กอง/สำนัก <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.departmentId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">เลือกกอง/สำนัก</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>
                )}
              </div>

              {/* Procurement Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วิธีจัดซื้อจัดจ้าง <span className="text-red-500">*</span>
                </label>
                <select
                  name="procurementMethod"
                  value={formData.procurementMethod}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.procurementMethod ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">เลือกวิธีจัดซื้อจัดจ้าง</option>
                  {procurementMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {errors.procurementMethod && (
                  <p className="mt-1 text-sm text-red-500">{errors.procurementMethod}</p>
                )}
              </div>
            </div>

            {/* Budget Amount and Budget Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  งบประมาณ (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="budgetAmount"
                  value={formData.budgetAmount}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.budgetAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="1"
                  max="50000000"
                  disabled={loading}
                />
                {errors.budgetAmount && (
                  <p className="mt-1 text-sm text-red-500">{errors.budgetAmount}</p>
                )}
              </div>

              {/* Budget Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ปีงบประมาณ (พ.ศ.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="budgetYear"
                  value={formData.budgetYear}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.budgetYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2568"
                  min="2563"
                  max="2643"
                  disabled={loading}
                />
                {errors.budgetYear && (
                  <p className="mt-1 text-sm text-red-500">{errors.budgetYear}</p>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้นโครงการ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ตำแหน่งที่ดำเนินโครงการ
              </label>
              <p className="text-xs text-gray-500 mb-2">
                คลิกบนแผนที่เพื่อเลือกตำแหน่ง (ค่าเริ่มต้น: สำนักงานเทศบาลตำบลหัวทะเล จ.นครราชสีมา)
              </p>
              <MapPicker
                location={formData.location}
                onChange={handleLocationChange}
                height={300}
                disabled={loading}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังสร้าง...</span>
                  </>
                ) : (
                  'สร้างโครงการ'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
