import { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Export รายงาน</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Report Type Selection */}
          <div className="form-group">
            <label>ประเภทรายงาน *</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reportType"
                  value="detailed"
                  checked={reportType === 'detailed'}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                รายละเอียดโครงการ (สำหรับผู้รับผิดชอบ)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reportType"
                  value="executive"
                  checked={reportType === 'executive'}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                สรุปภาพรวม (สำหรับผู้บริหาร)
              </label>
            </div>
          </div>

          {/* File Format Selection */}
          <div className="form-group">
            <label>รูปแบบไฟล์ *</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fileFormat"
                  value="pdf"
                  checked={fileFormat === 'pdf'}
                  onChange={(e) => setFileFormat(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                📄 PDF (สำหรับนำเสนอ/พิมพ์)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fileFormat"
                  value="csv"
                  checked={fileFormat === 'csv'}
                  onChange={(e) => setFileFormat(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                📊 CSV (สำหรับนำเข้าระบบอื่น)
              </label>
            </div>
          </div>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #ddd' }} />

          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>ตัวกรองข้อมูล</h3>

          {/* Year Filter */}
          <div className="form-group">
            <label>ปีงบประมาณ พ.ศ. *</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              required
            >
              <option value="">เลือกปีงบประมาณ</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="form-group">
            <label>เดือน (ไม่บังคับ)</label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {MONTHS.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="form-group">
            <label>กอง/สำนัก (ไม่บังคับ)</label>
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group">
            <label>สถานะโครงการ (ไม่บังคับ)</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Procurement Method Filter */}
          <div className="form-group">
            <label>วิธีจัดซื้อจัดจ้าง (ไม่บังคับ)</label>
            <select
              value={filters.procurementMethod}
              onChange={(e) => handleFilterChange('procurementMethod', e.target.value)}
            >
              {PROCUREMENT_METHODS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className="btn btn-primary"
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
