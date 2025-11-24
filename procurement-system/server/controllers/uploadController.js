/**
 * Upload Controller
 * Handles file uploads including Excel imports
 */

import { parsePhod02Excel } from '../utils/excelParser.js';
import { execute, queryOne } from '../config/database.js';

/**
 * Upload and parse Excel file in ผด.02 format
 * POST /api/upload/excel
 */
export const uploadExcel = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบไฟล์ที่อัปโหลด'
      });
    }

    console.log('📁 Received file:', req.file.originalname);

    // Parse Excel file
    const projects = parsePhod02Excel(req.file.buffer);

    if (!projects || projects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบข้อมูลโครงการในไฟล์'
      });
    }

    // Return parsed data for preview (not saved yet)
    return res.json({
      success: true,
      message: `อ่านข้อมูลสำเร็จ พบโครงการ ${projects.length} โครงการ`,
      count: projects.length,
      projects: projects
    });

  } catch (error) {
    console.error('Error uploading Excel:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์'
    });
  }
};

/**
 * Import projects from parsed data
 * POST /api/upload/import-projects
 */
export const importProjects = async (req, res) => {
  try {
    const { projects, replaceAll } = req.body;

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบข้อมูลโครงการที่จะนำเข้า'
      });
    }

    // Check user permission (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'ไม่มีสิทธิ์นำเข้าโครงการ'
      });
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    // If replaceAll, delete existing projects
    if (replaceAll) {
      execute('DELETE FROM project_steps');
      execute('DELETE FROM projects');
      console.log('🗑️  Deleted all existing projects');
    }

    // Insert projects
    const stmt = `
      INSERT INTO projects (
        project_code, name, description, department_id,
        procurement_method, budget, start_date, expected_end_date,
        status, urgency_level, contractor_type, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const project of projects) {
      try {
        // Validate required fields
        if (!project.name || !project.budget || !project.department_id) {
          skipped++;
          errors.push({
            project: project.name || 'Unnamed',
            error: 'ข้อมูลไม่ครบถ้วน'
          });
          continue;
        }

        // Check if project code exists
        const existing = queryOne(
          'SELECT id FROM projects WHERE project_code = ?',
          [project.project_code]
        );

        if (existing && !replaceAll) {
          // Update existing project
          execute(
            `UPDATE projects SET
              name = ?, description = ?, department_id = ?,
              procurement_method = ?, budget = ?,
              start_date = ?, expected_end_date = ?,
              status = ?, urgency_level = ?, contractor_type = ?
            WHERE project_code = ?`,
            [
              project.name,
              project.description || '',
              project.department_id,
              project.procurement_method,
              project.budget,
              project.start_date,
              project.expected_end_date,
              project.status || 'draft',
              project.urgency_level || 'normal',
              project.contractor_type || 'construction',
              project.project_code
            ]
          );
          updated++;
        } else {
          // Insert new project
          execute(stmt, [
            project.project_code,
            project.name,
            project.description || '',
            project.department_id,
            project.procurement_method,
            project.budget,
            project.start_date,
            project.expected_end_date,
            project.status || 'draft',
            project.urgency_level || 'normal',
            project.contractor_type || 'construction',
            req.user.id
          ]);
          imported++;
        }

      } catch (error) {
        console.error('Error importing project:', project.name, error);
        errors.push({
          project: project.name,
          error: error.message
        });
        skipped++;
      }
    }

    return res.json({
      success: true,
      message: `นำเข้าโครงการสำเร็จ`,
      summary: {
        total: projects.length,
        imported,
        updated,
        skipped,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error importing projects:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการนำเข้าโครงการ',
      details: error.message
    });
  }
};

/**
 * Download Excel template
 * GET /api/upload/template
 */
export const downloadTemplate = async (req, res) => {
  try {
    // In future, generate actual Excel template file
    // For now, return instructions
    return res.json({
      success: true,
      message: 'ดาวน์โหลดเทมเพลต',
      instructions: [
        'ไฟล์ต้องเป็นรูปแบบ Excel (.xlsx หรือ .xls)',
        'ต้องมีคอลัมน์: ที่, โครงการ, รายละเอียด, งบประมาณ, สถานที่, หน่วยงาน, ดำเนินการแล้วเสร็จ, วิธีดำเนินการ',
        'หน่วยงาน: กองคลัง, กองช่าง, กองการศึกษา, กองสาธารณสุขและสิ่งแวดล้อม, สำนักปลัด, กองวิชาการและแผนงาน, กองธุรการ',
        'วิธีดำเนินการ: เฉพาะเจาะจง, คัดเลือก, ประกาศเชิญชวน',
        'ดำเนินการแล้วเสร็จ: ต.ค., พ.ย., ธ.ค., ม.ค., ก.พ., มี.ค., เม.ย., พ.ค., มิ.ย., ก.ค., ส.ค., ก.ย.'
      ]
    });
  } catch (error) {
    console.error('Error downloading template:', error);
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต'
    });
  }
};

export default {
  uploadExcel,
  importProjects,
  downloadTemplate
};
