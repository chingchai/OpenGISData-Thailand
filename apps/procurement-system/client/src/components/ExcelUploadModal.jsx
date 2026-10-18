import React, { useState } from 'react';
import axios from 'axios';

const ExcelUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [parsedProjects, setParsedProjects] = useState(null);
  const [replaceAll, setReplaceAll] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(selectedFile.type) &&
          !selectedFile.name.endsWith('.xlsx') &&
          !selectedFile.name.endsWith('.xls')) {
        setError('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)');
        return;
      }

      setFile(selectedFile);
      setError('');
      setParsedProjects(null);
    }
  };

  const handleParseExcel = async () => {
    if (!file) {
      setError('กรุณาเลือกไฟล์');
      return;
    }

    setParsing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setParsedProjects(response.data.projects);
      } else {
        setError(response.data.error || 'ไม่สามารถอ่านไฟล์ได้');
      }
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedProjects || parsedProjects.length === 0) {
      setError('ไม่พบข้อมูลที่จะนำเข้า');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/upload/import-projects',
        {
          projects: parsedProjects,
          replaceAll
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onSuccess(response.data.summary);
        handleClose();
      } else {
        setError(response.data.error || 'ไม่สามารถนำเข้าโครงการได้');
      }
    } catch (err) {
      console.error('Error importing projects:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการนำเข้าโครงการ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedProjects(null);
    setError('');
    setReplaceAll(false);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH').format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">นำเข้าโครงการจาก Excel</h2>
            <p className="text-sm text-gray-600 mt-1">รูปแบบไฟล์ ผด.02 - แผนการดำเนินงาน</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📋 คำแนะนำ</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>ไฟล์ต้องเป็นรูปแบบ Excel (.xlsx หรือ .xls)</li>
              <li>ต้องมีคอลัมน์: ที่, โครงการ, รายละเอียด, งบประมาณ, หน่วยงาน, ดำเนินการแล้วเสร็จ, วิธีดำเนินการ</li>
              <li>หน่วยงาน: กองคลัง, กองช่าง, กองการศึกษา, กองสาธารณสุขและสิ่งแวดล้อม, สำนักปลัด, กองวิชาการและแผนงาน, กองธุรการ</li>
              <li>วิธีดำเนินการ: เฉพาะเจาะจง, คัดเลือก, ประกาศเชิญชวน</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* File Upload */}
          {!parsedProjects && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกไฟล์ Excel
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleParseExcel}
                  disabled={!file || parsing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {parsing ? 'กำลังอ่านไฟล์...' : 'อ่านไฟล์'}
                </button>
              </div>
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  ไฟล์ที่เลือก: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedProjects && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  ตรวจสอบข้อมูล ({parsedProjects.length} โครงการ)
                </h3>
                <button
                  onClick={() => {
                    setParsedProjects(null);
                    setFile(null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  เลือกไฟล์ใหม่
                </button>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">จำนวนโครงการ:</span>
                    <span className="ml-2 font-medium">{parsedProjects.length} โครงการ</span>
                  </div>
                  <div>
                    <span className="text-gray-600">งบประมาณรวม:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(parsedProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0))} บาท
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">โครงการ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">หน่วยงาน</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">งบประมาณ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">วิธีจัดซื้อ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedProjects.map((project, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{project.originalNo || index + 1}</td>
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900">{project.name}</div>
                          {project.description && (
                            <div className="text-xs text-gray-500 line-clamp-2">{project.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {project.department_id ? Object.keys({
                            1: 'กองคลัง',
                            2: 'กองช่าง',
                            3: 'กองการศึกษา',
                            4: 'กองสาธารณสุขฯ',
                            5: 'สำนักปลัด',
                            6: 'กองวิชาการฯ',
                            7: 'กองธุรการ'
                          }).find(key => parseInt(key) === project.department_id) &&
                          {
                            1: 'กองคลัง',
                            2: 'กองช่าง',
                            3: 'กองการศึกษา',
                            4: 'กองสาธารณสุขฯ',
                            5: 'สำนักปลัด',
                            6: 'กองวิชาการฯ',
                            7: 'กองธุรการ'
                          }[project.department_id] : 'ไม่ระบุ'}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(project.budget)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            project.procurement_method === 'public_invitation'
                              ? 'bg-purple-100 text-purple-700'
                              : project.procurement_method === 'selection'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {project.procurement_method === 'public_invitation' ? 'ประกาศเชิญชวน' :
                             project.procurement_method === 'selection' ? 'คัดเลือก' : 'เฉพาะเจาะจง'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Options */}
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={replaceAll}
                    onChange={(e) => setReplaceAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    ลบโครงการเก่าทั้งหมดแล้วนำเข้าใหม่
                    <span className="text-red-600 font-medium"> (ระวัง: จะลบข้อมูลเดิมทั้งหมด)</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            {parsedProjects && (
              <button
                onClick={handleImport}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'กำลังนำเข้า...' : `นำเข้า ${parsedProjects.length} โครงการ`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;
