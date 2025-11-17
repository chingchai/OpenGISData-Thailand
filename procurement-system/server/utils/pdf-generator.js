/**
 * PDF Generator
 * สร้างไฟล์ PDF จากข้อมูลรายงาน
 * Note: For Thai fonts, system must have Thai fonts installed
 */

import PDFDocument from 'pdfkit';

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
 * Generate detailed report PDF
 */
export function generateDetailedReportPDF(reportData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Procurement Project Report', { align: 'center' });

      doc.fontSize(16)
         .text('Detailed Projects Report', { align: 'center' })
         .moveDown();

      // Report info
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Generated: ${formatDate(reportData.generated_at)}`)
         .text(`Total Projects: ${reportData.total_projects}`)
         .moveDown();

      // Filters
      if (reportData.filters.year) {
        doc.text(`Fiscal Year: ${reportData.filters.year}`);
      }
      if (reportData.filters.month) {
        doc.text(`Month: ${reportData.filters.month}`);
      }
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      const rowHeight = 30;
      let y = tableTop;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('No.', 50, y, { width: 30 });
      doc.text('Code', 85, y, { width: 80 });
      doc.text('Project Name', 170, y, { width: 150 });
      doc.text('Department', 325, y, { width: 80 });
      doc.text('Budget', 410, y, { width: 70 });
      doc.text('Status', 485, y, { width: 60 });

      y += 15;
      doc.moveTo(50, y).lineTo(545, y).stroke();
      y += 5;

      // Table rows
      doc.font('Helvetica').fontSize(8);
      reportData.projects.forEach((project, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(index + 1, 50, y, { width: 30 });
        doc.text(project.project_code || '-', 85, y, { width: 80 });
        doc.text(project.name || '-', 170, y, { width: 150, height: rowHeight });
        doc.text(project.department_name || '-', 325, y, { width: 80 });
        doc.text(formatCurrency(project.budget), 410, y, { width: 70, align: 'right' });
        doc.text(STATUS_TH[project.status] || project.status, 485, y, { width: 60 });

        y += rowHeight;
      });

      // Footer on each page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .text(
             `Page ${i + 1} of ${pageCount}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate executive summary PDF
 */
export function generateExecutiveSummaryPDF(reportData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Procurement System', { align: 'center' });

      doc.fontSize(16)
         .text('Executive Summary Report', { align: 'center' })
         .moveDown();

      // Report info
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Generated: ${formatDate(reportData.generated_at)}`)
         .moveDown();

      // Filters
      if (reportData.filters.year) {
        doc.text(`Fiscal Year: ${reportData.filters.year}`);
      }
      if (reportData.filters.month) {
        doc.text(`Month: ${reportData.filters.month}`);
      }
      doc.moveDown();

      // Overall Summary
      doc.fontSize(14).font('Helvetica-Bold').text('Overall Summary').moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total Projects: ${reportData.summary.total_projects}`);
      doc.text(`Total Budget: ${formatCurrency(reportData.summary.total_budget)} Baht`);
      doc.text(`Average Budget: ${formatCurrency(reportData.summary.average_budget)} Baht`);
      doc.text(`Average Progress: ${reportData.summary.average_progress.toFixed(2)}%`);
      doc.moveDown();

      // Status breakdown
      doc.fontSize(12).font('Helvetica-Bold').text('Project Status').moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Draft: ${reportData.summary.draft_count}`);
      doc.text(`In Progress: ${reportData.summary.in_progress_count}`);
      doc.text(`Completed: ${reportData.summary.completed_count}`);
      doc.text(`Delayed: ${reportData.summary.delayed_count}`);
      doc.text(`Cancelled: ${reportData.summary.cancelled_count}`);
      doc.moveDown();

      // By Department
      doc.fontSize(12).font('Helvetica-Bold').text('Summary by Department').moveDown(0.5);
      doc.fontSize(9).font('Helvetica');

      let y = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Department', 50, y, { width: 150 });
      doc.text('Projects', 210, y, { width: 60, align: 'right' });
      doc.text('Budget', 280, y, { width: 100, align: 'right' });
      doc.text('Progress', 390, y, { width: 60, align: 'right' });

      y += 15;
      doc.moveTo(50, y).lineTo(500, y).stroke();
      y += 5;

      doc.font('Helvetica');
      reportData.by_department.forEach(dept => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(dept.department_name, 50, y, { width: 150 });
        doc.text(dept.project_count.toString(), 210, y, { width: 60, align: 'right' });
        doc.text(formatCurrency(dept.total_budget), 280, y, { width: 100, align: 'right' });
        doc.text(`${dept.average_progress.toFixed(1)}%`, 390, y, { width: 60, align: 'right' });
        y += 20;
      });

      doc.moveDown(2);

      // Delayed Projects
      if (reportData.delayed_projects.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Top 10 Delayed Projects').moveDown(0.5);
        doc.fontSize(9).font('Helvetica');

        y = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Code', 50, y, { width: 80 });
        doc.text('Project Name', 135, y, { width: 200 });
        doc.text('Days', 340, y, { width: 50, align: 'right' });

        y += 15;
        doc.moveTo(50, y).lineTo(400, y).stroke();
        y += 5;

        doc.font('Helvetica');
        reportData.delayed_projects.forEach(project => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          doc.text(project.project_code, 50, y, { width: 80 });
          doc.text(project.name, 135, y, { width: 200, height: 20 });
          doc.text(project.delay_days.toString(), 340, y, { width: 50, align: 'right' });
          y += 25;
        });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .text(
             `Page ${i + 1} of ${pageCount}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  generateDetailedReportPDF,
  generateExecutiveSummaryPDF
};
