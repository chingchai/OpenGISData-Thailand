/**
 * Excel Parser for ผด.02 Format
 * Parses Excel files in ผด.02 format and converts to project data
 */

import xlsx from 'xlsx';

/**
 * Map Thai department name to department ID
 */
const DEPARTMENT_MAP = {
  'กองคลัง': 1,
  'กองช่าง': 2,
  'กองการศึกษา': 3,
  'กองสาธารณสุขและสิ่งแวดล้อม': 4,
  'สำนักปลัด': 5,
  'กองวิชาการและแผนงาน': 6,
  'กองธุรการ': 7
};

/**
 * Map Thai procurement method to system value
 */
const PROCUREMENT_METHOD_MAP = {
  'เฉพาะเจาะจง': 'specific',
  'คัดเลือก': 'selection',
  'ประกาศเชิญชวน': 'public_invitation',
  'e-bidding': 'public_invitation'
};

/**
 * Map Thai month to number
 */
const MONTH_MAP = {
  'ตุลาคม': 10,
  'ต.ค.': 10,
  'ต.ค': 10,
  'พฤศจิกายน': 11,
  'พ.ย.': 11,
  'พ.ย': 11,
  'ธันวาคม': 12,
  'ธ.ค.': 12,
  'ธ.ค': 12,
  'มกราคม': 1,
  'ม.ค.': 1,
  'ม.ค': 1,
  'กุมภาพันธ์': 2,
  'ก.พ.': 2,
  'ก.พ': 2,
  'มีนาคม': 3,
  'มี.ค.': 3,
  'มี.ค': 3,
  'เมษายน': 4,
  'เม.ย.': 4,
  'เม.ย': 4,
  'พฤษภาคม': 5,
  'พ.ค.': 5,
  'พ.ค': 5,
  'มิถุนายน': 6,
  'มิ.ย.': 6,
  'มิ.ย': 6,
  'กรกฎาคม': 7,
  'ก.ค.': 7,
  'ก.ค': 7,
  'สิงหาคม': 8,
  'ส.ค.': 8,
  'ส.ค': 8,
  'กันยายน': 9,
  'ก.ย.': 9,
  'ก.ย': 9
};

/**
 * Parse budget string to number
 */
function parseBudget(budgetStr) {
  if (!budgetStr) return 0;

  // Remove commas and spaces
  const cleaned = String(budgetStr).replace(/[,\s]/g, '');
  const number = parseFloat(cleaned);

  return isNaN(number) ? 0 : number;
}

/**
 * Map month name to date
 * @param {string} monthStr - Thai month name
 * @param {number} fiscalYear - Fiscal year (Buddhist year)
 * @returns {string} - ISO date string
 */
function monthToDate(monthStr, fiscalYear = 2568) {
  if (!monthStr) return null;

  const month = MONTH_MAP[monthStr.trim()];
  if (!month) return null;

  // Convert Buddhist year to Gregorian year
  let year = fiscalYear - 543;

  // If month is Oct-Dec, it's in the previous year
  if (month >= 10) {
    year = year - 1;
  }

  // Return last day of the month
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

/**
 * Find first marked month in row (for start date)
 */
function findStartMonth(row, monthColumns) {
  for (const [monthName, colIndex] of Object.entries(monthColumns)) {
    const cellValue = row[colIndex];
    if (cellValue && String(cellValue).trim()) {
      return monthName;
    }
  }
  return null;
}

/**
 * Parse Excel file in ผด.02 format
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Array} - Array of parsed project objects
 */
export function parsePhod02Excel(fileBuffer) {
  try {
    // Read workbook
    const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header on row 7 (0-indexed as 6)
    // ผด.02 format usually has headers around row 7
    const data = xlsx.utils.sheet_to_json(worksheet, {
      header: 1, // Get as array of arrays
      defval: '', // Default value for empty cells
      blankrows: false // Skip blank rows
    });

    console.log('📊 Excel Data Rows:', data.length);

    // Find header row (look for "ที่" column)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (row && row.some(cell => String(cell).includes('ที่') || String(cell).includes('โครงการ'))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('ไม่พบแถวหัวตาราง กรุณาตรวจสอบรูปแบบไฟล์');
    }

    console.log('📌 Header row found at index:', headerRowIndex);

    const headerRow = data[headerRowIndex];

    // Find column indices
    const colIndices = {
      no: headerRow.findIndex(h => String(h).trim() === 'ที่'),
      name: headerRow.findIndex(h => String(h).includes('โครงการ')),
      description: headerRow.findIndex(h => String(h).includes('รายละเอียด') || String(h).includes('กิจกรรม')),
      budget: headerRow.findIndex(h => String(h).includes('งบประมาณ')),
      location: headerRow.findIndex(h => String(h).includes('สถานที่')),
      department: headerRow.findIndex(h => String(h).includes('หน่วยงาน') && String(h).includes('รับผิดชอบ')),
      endMonth: headerRow.findIndex(h => String(h).includes('ดำเนินการ') && String(h).includes('แล้วเสร็จ')),
      method: headerRow.findIndex(h => String(h).includes('วิธี') && String(h).includes('ดำเนินการ'))
    };

    // Find month columns (ต.ค. - ก.ย.)
    const monthColumns = {};
    headerRow.forEach((cell, index) => {
      const cellStr = String(cell).trim();
      if (MONTH_MAP[cellStr]) {
        monthColumns[cellStr] = index;
      }
    });

    console.log('📅 Found month columns:', Object.keys(monthColumns));
    console.log('📝 Column indices:', colIndices);

    // Parse data rows (start from headerRowIndex + 1)
    const projects = [];
    let currentProject = null;

    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];

      // Skip empty rows
      if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === '')) {
        continue;
      }

      const no = row[colIndices.no];

      // If row has number in "ที่" column, it's a new project
      if (no && String(no).trim() && !isNaN(parseInt(String(no).trim()))) {
        // Save previous project if exists
        if (currentProject) {
          projects.push(currentProject);
        }

        // Parse new project
        const name = row[colIndices.name] || '';
        const budget = parseBudget(row[colIndices.budget]);
        const location = row[colIndices.location] || '';
        const departmentName = row[colIndices.department] || '';
        const endMonthStr = row[colIndices.endMonth] || '';
        const methodStr = row[colIndices.method] || '';

        // Map department
        const departmentId = DEPARTMENT_MAP[departmentName.trim()] || null;

        // Map procurement method
        const procurementMethod = PROCUREMENT_METHOD_MAP[methodStr.trim()] || 'specific';

        // Find start month from marked columns
        const startMonthStr = findStartMonth(row, monthColumns);

        // Calculate dates
        const startDate = startMonthStr ? monthToDate(startMonthStr, 2568) : null;
        const expectedEndDate = endMonthStr ? monthToDate(endMonthStr, 2568) : null;

        currentProject = {
          project_code: `PR-2568-${String(departmentId || '000').padStart(3, '0')}-${String(no).padStart(3, '0')}`,
          name: String(name).trim(),
          description: row[colIndices.description] ? String(row[colIndices.description]).trim() : '',
          location: String(location).trim(),
          department_id: departmentId,
          procurement_method: procurementMethod,
          budget: budget,
          start_date: startDate || '2024-10-01',
          expected_end_date: expectedEndDate || '2025-09-30',
          status: 'draft',
          urgency_level: 'normal',
          contractor_type: 'construction',
          fiscalYear: 2568,
          originalNo: String(no).trim()
        };
      } else if (currentProject) {
        // This is a continuation row, append to description
        const additionalDesc = [];

        if (row[colIndices.name]) {
          additionalDesc.push(String(row[colIndices.name]).trim());
        }
        if (row[colIndices.description]) {
          additionalDesc.push(String(row[colIndices.description]).trim());
        }

        if (additionalDesc.length > 0) {
          currentProject.description += ' ' + additionalDesc.join(' ');
        }
      }
    }

    // Add last project
    if (currentProject) {
      projects.push(currentProject);
    }

    console.log(`✅ Parsed ${projects.length} projects`);

    return projects;

  } catch (error) {
    console.error('❌ Error parsing Excel:', error);
    throw new Error(`ไม่สามารถอ่านไฟล์ Excel ได้: ${error.message}`);
  }
}

export default {
  parsePhod02Excel,
  DEPARTMENT_MAP,
  PROCUREMENT_METHOD_MAP,
  MONTH_MAP
};
