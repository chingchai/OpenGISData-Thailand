import React, { useState } from 'react';
import { usersAPI } from '../services/api';

const BulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
        setError('รองรับเฉพาะไฟล์ .xlsx, .xls หรือ .csv เท่านั้น');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await usersAPI.bulkImport(formData);
      const importResult = response.data?.data;

      setResult(importResult);

      if (importResult.success > 0) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
    onClose();
  };

  const downloadTemplate = () => {
    // Create a template CSV
    const headers = ['username', 'password', 'fullName', 'email', 'role', 'departmentId'];
    const example = ['john_doe', '123456', 'John Doe', 'john@example.com', 'staff', '1'];
    const csv = [headers.join(','), example.join(',')].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_import_template.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-file-import text-blue-500"></i>
                นำเข้าผู้ใช้แบบ Bulk
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                อัปโหลดไฟล์ Excel (.xlsx, .xls) หรือ CSV
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              คำแนะนำ
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-6 list-disc">
              <li>ไฟล์ต้องมีคอลัมน์: username, password, fullName, role</li>
              <li>คอลัมน์เสริม (ไม่จำเป็น): email, departmentId, active</li>
              <li>role ต้องเป็น: staff, admin, หรือ executive</li>
              <li>departmentId ต้องเป็นตัวเลข 1-7</li>
              <li>password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร</li>
              <li>สูงสุด 1,000 รายการต่อครั้ง</li>
            </ul>
          </div>

          {/* Download Template Button */}
          <div className="flex justify-center">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <i className="fas fa-download"></i>
              ดาวน์โหลดไฟล์ตัวอย่าง (CSV)
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              เลือกไฟล์
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-import-file"
              />
              <label
                htmlFor="bulk-import-file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 dark:text-gray-500"></i>
                <span className="text-gray-600 dark:text-gray-400">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  รองรับ .xlsx, .xls, .csv (สูงสุด 5MB)
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-3 flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                <i className="fas fa-file-excel text-green-500 text-xl"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <h3 className="font-medium text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  ผลการนำเข้า
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-600 dark:text-gray-400">สำเร็จ</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.success}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-600 dark:text-gray-400">ล้มเหลว</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {result.failed}
                    </p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {result.errors && result.errors.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    รายการที่ล้มเหลว ({result.errors.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {result.errors.slice(0, 10).map((err, index) => (
                      <div key={index} className="text-xs bg-white dark:bg-gray-800 rounded p-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          แถว {err.row}: {err.username}
                        </p>
                        <p className="text-red-600 dark:text-red-400">{err.error}</p>
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                        และอีก {result.errors.length - 10} รายการ...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Successful Users */}
              {result.successfulUsers && result.successfulUsers.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <i className="fas fa-user-check"></i>
                    ผู้ใช้ที่สร้างสำเร็จ ({result.successfulUsers.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {result.successfulUsers.slice(0, 10).map((user, index) => (
                      <div key={index} className="text-xs bg-white dark:bg-gray-800 rounded p-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.fullName} (@{user.username})
                        </p>
                      </div>
                    ))}
                    {result.successfulUsers.length > 10 && (
                      <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                        และอีก {result.successfulUsers.length - 10} รายการ...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
          >
            ปิด
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium flex items-center gap-2"
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                กำลังนำเข้า...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i>
                นำเข้าข้อมูล
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
