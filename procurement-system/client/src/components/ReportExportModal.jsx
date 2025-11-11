import { useState, useEffect } from 'react';
import axios from 'axios';

const MONTHS = [
  { value: 1, label: 'มกราคม' },
  { value: 2, label: 'กุมภาพันธ์' },
  { value: 3, label: 'มีนาคม' },
  { value: 4, label: 'เมษายน' },
  { value: 5, label: 'พฤษภาคม' },
  { value: 6, label: 'มิถุนายน' },
  { value: 7, label: 'กรกฎาคม' },
  { value: 8, label: 'สิงหาคม' },
  { value: 9, label: 'กันยายน' },
  { value: 10, label: 'ตุลาคม' },
  { value: 11, label: 'พฤศจิกายน' },
  { value: 12, label: 'ธันวาคม' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'draft', label: 'ร่าง' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'delayed', label: 'ล่าช้า' },
  { value: 'cancelled', label: 'ยกเลิก' }
];

const PROCUREMENT_METHODS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'public_invitation', label: 'ประกาศเชิญชวน' },
  { value: 'selection', label: 'คัดเลือก' },
  { value: 'specific', label: 'เฉพาะเจาะจง' }
];

const ReportExportModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Form state
  const [reportType, setReportType] = useState('detailed'); // 'detailed' or 'executive'
  const [fileFormat, setFileFormat] = useState('pdf'); // 'pdf' or 'csv'
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear() + 543, // Current year in Buddhist calendar
    departmentId: '',
    status: '',
    procurementMethod: ''
  });

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/projects');
      // Extract unique departments from projects
      const uniqueDepts = [...new Map(
        (res.data.data || res.data || [])
          .filter(p => p.department_name)
          .map(p => [p.department_id, { id: p.department_id, name: p.department_name }])
      ).values()];
      setDepartments(uniqueDepts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = async () => {
    if (!filters.year) {
      alert('กรุณาเลือกปีงบประมาณ');
      return;
    }

    setLoading(true);

    try {
      // Build request data
      const requestData = {
        month: filters.month || null,
        year: filters.year || null,
        departmentId: filters.departmentId || null,
        status: filters.status || null,
        procurementMethod: filters.procurementMethod || null
      };

      // Determine endpoint
      const endpoint = `/api/reports/export/${reportType}/${fileFormat}`;

      // Make request
      const response = await axios.post(endpoint, requestData, {
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Set filename
      const timestamp = new Date().getTime();
      const extension = fileFormat === 'pdf' ? 'pdf' : 'csv';
      const reportTypeName = reportType === 'detailed' ? 'detailed-report' : 'executive-summary';
      link.setAttribute('download', `${reportTypeName}-${timestamp}.${extension}`);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Cleanup
      window.URL.revokeObjectURL(url);

      alert('ดาวน์โหลดรายงานสำเร็จ');
      onClose();
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear() + 543;
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">📊 Export รายงาน</h2>
          <button className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทรายงาน <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="detailed"
                  checked={reportType === 'detailed'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mr-2"
                />
                รายละเอียดโครงการ (สำหรับผู้รับผิดชอบ)
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="executive"
                  checked={reportType === 'executive'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mr-2"
                />
                สรุปภาพรวม (สำหรับผู้บริหาร)
              </label>
            </div>
          </div>

          {/* File Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบไฟล์ <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="fileFormat"
                  value="pdf"
                  checked={fileFormat === 'pdf'}
                  onChange={(e) => setFileFormat(e.target.value)}
                  className="mr-2"
                />
                📄 PDF (สำหรับนำเสนอ/พิมพ์)
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="fileFormat"
                  value="csv"
                  checked={fileFormat === 'csv'}
                  onChange={(e) => setFileFormat(e.target.value)}
                  className="mr-2"
                />
                📊 CSV (สำหรับนำเข้าระบบอื่น)
              </label>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          <h3 className="text-lg font-semibold text-gray-800">ตัวกรองข้อมูล</h3>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ปีงบประมาณ พ.ศ. <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">เลือกปีงบประมาณ</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เดือน (ไม่บังคับ)</label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              {MONTHS.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">กอง/สำนัก (ไม่บังคับ)</label>
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะโครงการ (ไม่บังคับ)</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Procurement Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วิธีจัดซื้อจัดจ้าง (ไม่บังคับ)</label>
            <select
              value={filters.procurementMethod}
              onChange={(e) => handleFilterChange('procurementMethod', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PROCUREMENT_METHODS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'กำลังสร้างรายงาน...' : '📥 ดาวน์โหลดรายงาน'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;
