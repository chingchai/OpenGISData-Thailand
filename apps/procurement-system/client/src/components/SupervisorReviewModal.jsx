import { useState } from 'react';
import { supervisorReviewsAPI } from '../services/api';

const SupervisorReviewModal = ({ isOpen, onClose, projectId, projectName, onSuccess }) => {
  const [formData, setFormData] = useState({
    reviewType: 'feedback',
    priority: 'normal',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reviewTypes = [
    { value: 'feedback', label: 'ข้อเสนอแนะ', icon: 'fa-comment-dots', color: 'text-blue-500' },
    { value: 'concern', label: 'ข้อกังวล', icon: 'fa-exclamation-circle', color: 'text-orange-500' },
    { value: 'approval', label: 'อนุมัติ/เห็นชอบ', icon: 'fa-check-circle', color: 'text-green-500' },
    { value: 'question', label: 'คำถาม', icon: 'fa-question-circle', color: 'text-purple-500' }
  ];

  const priorities = [
    { value: 'low', label: 'ต่ำ', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'normal', label: 'ปกติ', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'high', label: 'สูง', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'urgent', label: 'ด่วน', color: 'bg-red-100 text-red-700 border-red-300' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      setError('กรุณากรอกข้อความ');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await supervisorReviewsAPI.create({
        projectId,
        reviewType: formData.reviewType,
        priority: formData.priority,
        message: formData.message.trim()
      });

      // Reset form
      setFormData({
        reviewType: 'feedback',
        priority: 'normal',
        message: ''
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error creating review:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งข้อความ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        reviewType: 'feedback',
        priority: 'normal',
        message: ''
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <i className="fas fa-user-tie text-purple-500"></i>
                ส่งข้อความตรวจสอบโครงการ
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                โครงการ: <span className="font-medium">{projectName}</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
              <i className="fas fa-exclamation-triangle"></i>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Review Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              ประเภทการตรวจสอบ
            </label>
            <div className="grid grid-cols-2 gap-3">
              {reviewTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reviewType: type.value }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.reviewType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fas ${type.icon} text-xl ${type.color}`}></i>
                    <span className={`text-sm font-medium ${
                      formData.reviewType === type.value
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {type.label}
                    </span>
                  </div>
                  {formData.reviewType === type.value && (
                    <i className="fas fa-check-circle text-blue-500 absolute top-2 right-2"></i>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              ระดับความสำคัญ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.priority === priority.value
                      ? priority.color + ' border-current'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ข้อความ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              placeholder="กรอกข้อความตรวจสอบ, ข้อเสนอแนะ, หรือคำถาม..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              ข้อความจะถูกส่งไปยังผู้รับผิดชอบโครงการและสร้างการแจ้งเตือน
            </p>
          </div>

          {/* Preview */}
          {formData.message.trim() && (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">ตัวอย่าง</p>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center ${
                  reviewTypes.find(t => t.value === formData.reviewType)?.color
                }`}>
                  <i className={`fas ${reviewTypes.find(t => t.value === formData.reviewType)?.icon}`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reviewTypes.find(t => t.value === formData.reviewType)?.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      priorities.find(p => p.value === formData.priority)?.color
                    }`}>
                      {priorities.find(p => p.value === formData.priority)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !formData.message.trim()}
              className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>กำลังส่ง...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  <span>ส่งข้อความ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorReviewModal;
