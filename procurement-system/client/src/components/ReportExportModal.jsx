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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white rounded-t-ios-2xl md:rounded-ios-2xl shadow-ios-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Handle */}
        <div className="pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1 bg-ios-gray-light rounded-full"></div>
        </div>

        {/* Header - iOS Style */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-3xl font-bold text-gray-900">📊 Export รายงาน</h2>
          <button
            className="w-8 h-8 rounded-full bg-ios-gray-light hover:bg-ios-gray-light/80 flex items-center justify-center text-ios-gray text-xl font-semibold transition-all active:scale-95"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body - iOS Style with Scroll */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">
          {/* Report Type Selection - iOS Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              ประเภทรายงาน <span className="text-ios-red">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer p-4 bg-ios-gray-lighter rounded-ios-lg hover:bg-ios-gray-light transition-all active:scale-98">
                <input
                  type="radio"
                  name="reportType"
                  value="detailed"
                  checked={reportType === 'detailed'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-5 h-5 text-ios-blue focus:ring-ios-blue focus:ring-2"
                />
                <span className="ml-3 font-medium text-gray-900">รายละเอียดโครงการ (สำหรับผู้รับผิดชอบ)</span>
              </label>
              <label className="flex items-center cursor-pointer p-4 bg-ios-gray-lighter rounded-ios-lg hover:bg-ios-gray-light transition-all active:scale-98">
                <input
                  type="radio"
                  name="reportType"
                  value="executive"
                  checked={reportType === 'executive'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-5 h-5 text-ios-blue focus:ring-ios-blue focus:ring-2"
                />
                <span className="ml-3 font-medium text-gray-900">สรุปภาพรวม (สำหรับผู้บริหาร)</span>
              </label>
            </div>
          </div>

          {/* File Format Selection - iOS Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              รูปแบบไฟล์ <span className="text-ios-red">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer p-4 bg-ios-gray-lighter rounded-ios-lg hover:bg-ios-gray-light transition-all active:scale-98">
                <input
                  type="radio"
                  name="fileFormat"
                  value="pdf"
                  checked={fileFormat === 'pdf'}
                  onChange={(e) => setFileFormat(e.target.value)}
                  className="w-5 h-5 text-ios-blue focus:ring-ios-blue focus:ring-2"
                />
                <span className="ml-3 font-medium text-gray-900">📄 PDF (สำหรับนำเสนอ/พิมพ์)</span>
              </label>
              <label className="flex items-center cursor-pointer p-4 bg-ios-gray-lighter rounded-ios-lg hover:bg-ios-gray-light transition-all active:scale-98">
                <input
                  type="radio"
                  name="fileFormat"
                  value="csv"
                  checked={fileFormat === 'csv'}
                  onChange={(e) => setFileFormat(e.target.value)}
                  className="w-5 h-5 text-ios-blue focus:ring-ios-blue focus:ring-2"
                />
                <span className="ml-3 font-medium text-gray-900">📊 CSV (สำหรับนำเข้าระบบอื่น)</span>
              </label>
            </div>
          </div>

          <div className="border-t border-ios-gray-light pt-4"></div>

          <h3 className="text-xl font-bold text-gray-900">ตัวกรองข้อมูล</h3>

          {/* Year Filter - iOS Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              ปีงบประมาณ พ.ศ. <span className="text-ios-red">*</span>
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              required
              className="w-full px-4 py-3 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="">เลือกปีงบประมาณ</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Month Filter - iOS Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">เดือน (ไม่บังคับ)</label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="w-full px-4 py-3 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="">ทั้งหมด</option>
              {MONTHS.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          {/* Department Filter - iOS Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">กอง/สำนัก (ไม่บังคับ)</label>
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              className="w-full px-4 py-3 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="">ทั้งหมด</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter - iOS Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">สถานะโครงการ (ไม่บังคับ)</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Procurement Method Filter - iOS Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">วิธีจัดซื้อจัดจ้าง (ไม่บังคับ)</label>
            <select
              value={filters.procurementMethod}
              onChange={(e) => handleFilterChange('procurementMethod', e.target.value)}
              className="w-full px-4 py-3 bg-ios-gray-lighter border-0 rounded-ios-lg focus:ring-2 focus:ring-ios-blue font-medium text-gray-900 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              {PROCUREMENT_METHODS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* iOS Style Footer with Buttons */}
        <div className="flex items-center gap-3 p-6 border-t border-ios-gray-light bg-white">
          <button
            className="flex-1 px-6 py-3 bg-ios-gray-lighter text-gray-900 rounded-full hover:bg-ios-gray-light transition-all font-semibold active:scale-95"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className="flex-1 px-6 py-3 bg-ios-blue text-white rounded-full hover:bg-ios-blue-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-ios active:scale-95"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? '⏳ กำลังสร้าง...' : '📥 ดาวน์โหลด'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;
