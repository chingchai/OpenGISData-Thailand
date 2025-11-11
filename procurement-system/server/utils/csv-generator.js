/**
 * CSV Generator
 * สร้างไฟล์ CSV จากข้อมูลรายงาน
 */

const PROCUREMENT_METHOD_TH = {
  'public_invitation': 'ประกาศเชิญชวน',
  'selection': 'คัดเลือก',
  'specific': 'เฉพาะเจาะจง'
};

const STATUS_TH = {
  'draft': 'ร่าง',
  'in_progress': 'กำลังดำเนินการ',
  'completed': 'เสร็จสิ้น',
  'delayed': 'ล่าช้า',
  'cancelled': 'ยกเลิก'
};

const URGENCY_TH = {
  'normal': 'ปกติ',
  'urgent': 'เร่งด่วน',
  'critical': 'เร่งด่วนมาก'
};

const CONTRACTOR_TYPE_TH = {
  'goods': 'ซื้อ',
  'services': 'จ้างบริการ',
  'construction': 'จ้างก่อสร้าง'
};

/**
 * Escape CSV field
 */
function escapeCSV(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Format date to Thai format
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  if (!amount) return '0.00';
  return parseFloat(amount).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Generate detailed report CSV
 */
export function generateDetailedReportCSV(reportData) {
  const lines = [];

  // Header
  lines.push('รายงานรายละเอียดโครงการจัดซื้อจัดจ้าง');
  lines.push(`วันที่สร้างรายงาน: ${formatDate(reportData.generated_at)}`);

  // Filters
  if (reportData.filters.year) {
    lines.push(`ปีงบประมาณ: ${reportData.filters.year}`);
  }
  if (reportData.filters.month) {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                   'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    lines.push(`เดือน: ${months[reportData.filters.month - 1]}`);
  }

  lines.push(''); // Empty line

  // Column headers
  const headers = [
    'ลำดับ',
    'รหัสโครงการ',
    'ชื่อโครงการ',
    'กอง/สำนัก',
    'วิธีจัดซื้อจัดจ้าง',
    'ประเภท',
    'งบประมาณ (บาท)',
    'วันเริ่มต้น',
    'วันสิ้นสุดโครงการ',
    'สถานะ',
    'ความเร่งด่วน',
    'ความคืบหน้า (%)',
    'จำนวนวันล่าช้า',
    'ขั้นตอนทั้งหมด',
    'ขั้นตอนเสร็จสิ้น',
    'ขั้นตอนล่าช้า'
  ];
  lines.push(headers.map(escapeCSV).join(','));

  // Data rows
  reportData.projects.forEach((project, index) => {
    const row = [
      index + 1,
      project.project_code,
      project.name,
      project.department_name,
      PROCUREMENT_METHOD_TH[project.procurement_method] || project.procurement_method,
      CONTRACTOR_TYPE_TH[project.contractor_type] || project.contractor_type,
      formatCurrency(project.budget),
      formatDate(project.start_date),
      formatDate(project.expected_end_date),
      STATUS_TH[project.status] || project.status,
      URGENCY_TH[project.urgency_level] || project.urgency_level,
      project.progress_percentage || 0,
      project.delay_days || 0,
      project.total_steps || 0,
      project.completed_steps || 0,
      project.delayed_steps || 0
    ];
    lines.push(row.map(escapeCSV).join(','));
  });

  // Summary
  lines.push('');
  lines.push(`จำนวนโครงการทั้งหมด,${reportData.total_projects}`);

  // Add BOM for Excel UTF-8 support
  return '\uFEFF' + lines.join('\n');
}

/**
 * Generate executive summary CSV
 */
export function generateExecutiveSummaryCSV(reportData) {
  const lines = [];

  // Header
  lines.push('รายงานสรุปภาพรวมโครงการจัดซื้อจัดจ้าง (สำหรับผู้บริหาร)');
  lines.push(`วันที่สร้างรายงาน: ${formatDate(reportData.generated_at)}`);

  // Filters
  if (reportData.filters.year) {
    lines.push(`ปีงบประมาณ: ${reportData.filters.year}`);
  }
  if (reportData.filters.month) {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                   'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    lines.push(`เดือน: ${months[reportData.filters.month - 1]}`);
  }

  lines.push('');

  // Overall Summary
  lines.push('สรุปภาพรวม');
  lines.push('รายการ,จำนวน/ค่า');
  lines.push(`จำนวนโครงการทั้งหมด,${reportData.summary.total_projects}`);
  lines.push(`งบประมาณรวม (บาท),${formatCurrency(reportData.summary.total_budget)}`);
  lines.push(`งบประมาณเฉลี่ย (บาท),${formatCurrency(reportData.summary.average_budget)}`);
  lines.push(`ความคืบหน้าเฉลี่ย (%),${reportData.summary.average_progress.toFixed(2)}`);
  lines.push('');

  // By Status
  lines.push('สถานะโครงการ');
  lines.push('สถานะ,จำนวน');
  lines.push(`ร่าง,${reportData.summary.draft_count}`);
  lines.push(`กำลังดำเนินการ,${reportData.summary.in_progress_count}`);
  lines.push(`เสร็จสิ้น,${reportData.summary.completed_count}`);
  lines.push(`ล่าช้า,${reportData.summary.delayed_count}`);
  lines.push(`ยกเลิก,${reportData.summary.cancelled_count}`);
  lines.push('');

  // By Department
  lines.push('สรุปตามกอง/สำนัก');
  lines.push('กอง/สำนัก,จำนวนโครงการ,งบประมาณรวม (บาท),โครงการเสร็จสิ้น,โครงการล่าช้า,ความคืบหน้าเฉลี่ย (%)');
  reportData.by_department.forEach(dept => {
    const row = [
      dept.department_name,
      dept.project_count,
      formatCurrency(dept.total_budget),
      dept.completed_count,
      dept.delayed_count,
      dept.average_progress.toFixed(2)
    ];
    lines.push(row.map(escapeCSV).join(','));
  });
  lines.push('');

  // By Procurement Method
  lines.push('สรุปตามวิธีจัดซื้อจัดจ้าง');
  lines.push('วิธีจัดซื้อจัดจ้าง,จำนวนโครงการ,งบประมาณรวม (บาท),โครงการเสร็จสิ้น,โครงการล่าช้า');
  reportData.by_procurement_method.forEach(method => {
    const row = [
      PROCUREMENT_METHOD_TH[method.procurement_method] || method.procurement_method,
      method.project_count,
      formatCurrency(method.total_budget),
      method.completed_count,
      method.delayed_count
    ];
    lines.push(row.map(escapeCSV).join(','));
  });
  lines.push('');

  // Delayed Projects
  if (reportData.delayed_projects.length > 0) {
    lines.push('โครงการที่ล่าช้า (10 อันดับแรก)');
    lines.push('รหัสโครงการ,ชื่อโครงการ,กอง/สำนัก,จำนวนวันล่าช้า');
    reportData.delayed_projects.forEach(project => {
      const row = [
        project.project_code,
        project.name,
        project.department_name,
        project.delay_days
      ];
      lines.push(row.map(escapeCSV).join(','));
    });
  }

  // Add BOM for Excel UTF-8 support
  return '\uFEFF' + lines.join('\n');
}

export default {
  generateDetailedReportCSV,
  generateExecutiveSummaryCSV
};
