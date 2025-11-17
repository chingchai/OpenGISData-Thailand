import React, { useState, useEffect } from 'react';
import { stepsAPI } from '../services/api';

const StepEditModal = ({ isOpen, onClose, onSuccess, step }) => {
  const [formData, setFormData] = useState({
    stepName: '',
    stepDescription: '',
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    slaDays: '',
    status: 'pending',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step && isOpen) {
      setFormData({
        stepName: step.step_name || '',
        stepDescription: step.description || '',
        plannedStartDate: step.planned_start?.split('T')[0] || '',
        plannedEndDate: step.planned_end?.split('T')[0] || '',
        actualStartDate: step.actual_start?.split('T')[0] || '',
        actualEndDate: step.actual_end?.split('T')[0] || '',
        slaDays: step.sla_days || '',
        status: step.status || 'pending',
        notes: step.notes || ''
      });
      setError('');
    }
  }, [step, isOpen]);

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
      // Prepare payload
      const payload = {
        stepName: formData.stepName.trim(),
        stepDescription: formData.stepDescription?.trim() || undefined,
        plannedStartDate: formData.plannedStartDate || undefined,
        plannedEndDate: formData.plannedEndDate || undefined,
        actualStartDate: formData.actualStartDate || undefined,
        actualEndDate: formData.actualEndDate || undefined,
        slaDays: formData.slaDays ? parseInt(formData.slaDays) : undefined,
        status: formData.status,
        notes: formData.notes?.trim() || undefined
      };

      // Remove undefined values
      Object.keys(payload).forEach(key =>
        payload[key] === undefined && delete payload[key]
      );

      await stepsAPI.update(step.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating step:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
            แก้ไขขั้นตอน
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

          {/* Step Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อขั้นตอน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="stepName"
              value={formData.stepName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกชื่อขั้นตอน"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              name="stepDescription"
              value={formData.stepDescription}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกรายละเอียดขั้นตอน"
            />
          </div>

          {/* Status and SLA Days */}
          <div className="grid grid-cols-2 gap-4">
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
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="on_hold">พักชั่วคราว</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SLA (วัน)
              </label>
              <input
                type="number"
                name="slaDays"
                value={formData.slaDays}
                onChange={handleChange}
                min="1"
                max="365"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="จำนวนวัน"
              />
            </div>
          </div>

          {/* Planned Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันเริ่มตามแผน
              </label>
              <input
                type="date"
                name="plannedStartDate"
                value={formData.plannedStartDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันสิ้นสุดตามแผน
              </label>
              <input
                type="date"
                name="plannedEndDate"
                value={formData.plannedEndDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actual Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันเริ่มจริง
              </label>
              <input
                type="date"
                name="actualStartDate"
                value={formData.actualStartDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันสิ้นสุดจริง
              </label>
              <input
                type="date"
                name="actualEndDate"
                value={formData.actualEndDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมายเหตุ
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกหมายเหตุ (ถ้ามี)"
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
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepEditModal;
