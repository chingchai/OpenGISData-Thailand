import React, { useState, useEffect } from 'react';
import { stepsAPI, uploadAPI } from '../services/api';
import FileThumbnail from './FileThumbnail';

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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
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

      // Load existing images
      try {
        const images = step.image_urls ? JSON.parse(step.image_urls) : [];
        setExistingImages(Array.isArray(images) ? images : []);
      } catch (e) {
        setExistingImages([]);
      }

      setSelectedFiles([]);
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types - images and documents
    const validTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // PDF
      'application/pdf',
      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];

    const invalidFiles = files.filter(file => {
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return !validTypes.includes(file.type) && !validExtensions.includes(fileExtension);
    });

    if (invalidFiles.length > 0) {
      setError('กรุณาเลือกเฉพาะไฟล์รูปภาพและเอกสาร (.jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx, .xls, .xlsx)');
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    // Check total limit (10 files max including existing)
    if (existingImages.length + selectedFiles.length + files.length > 10) {
      setError('สามารถอัพโหลดไฟล์ได้สูงสุด 10 ไฟล์');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    setError('');
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let newImageUrls = [];

      // Upload new images if any
      if (selectedFiles.length > 0) {
        setUploading(true);
        try {
          const uploadResponse = await uploadAPI.uploadImages(selectedFiles);
          newImageUrls = uploadResponse.data?.data?.imageUrls || [];
        } catch (uploadErr) {
          console.error('Error uploading images:', uploadErr);
          setError('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Combine existing and new images
      const allImageUrls = [...existingImages, ...newImageUrls];

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
        notes: formData.notes?.trim() || undefined,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ไฟล์แนบ (รูปภาพและเอกสาร)
              <span className="text-gray-500 font-normal ml-2 text-xs">
                (สูงสุด 10 ไฟล์, ขนาดไม่เกิน 10MB/ไฟล์)
              </span>
            </label>

            {/* Existing Files */}
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">ไฟล์ที่มีอยู่:</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((imageUrl, index) => (
                    <FileThumbnail
                      key={`existing-${index}`}
                      fileUrl={imageUrl}
                      fileName={`ไฟล์ที่ ${index + 1}`}
                      onRemove={() => handleRemoveExistingImage(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">ไฟล์ที่เลือกใหม่:</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <FileThumbnail
                      key={`new-${index}`}
                      fileUrl={URL.createObjectURL(file)}
                      fileName={file.name}
                      fileType={file.type}
                      onRemove={() => handleRemoveSelectedFile(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* File Input */}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              multiple
              onChange={handleFileSelect}
              disabled={loading || uploading}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              รองรับไฟล์: รูปภาพ (JPG, PNG, GIF, WEBP), เอกสาร (PDF, DOC, DOCX, XLS, XLSX)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>กำลังอัพโหลดไฟล์...</span>
                </>
              ) : loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                'บันทึกการแก้ไข'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepEditModal;
