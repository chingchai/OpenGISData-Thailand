/**
 * Report Controller
 * จัดการ export รายงาน PDF และ CSV
 */

import * as reportService from '../services/report-service.js';
import * as csvGenerator from '../utils/csv-generator.js';
import * as pdfGenerator from '../utils/pdf-generator.js';
import logger from '../config/logger.js';

/**
 * Export detailed report as CSV
 */
export async function exportDetailedCSV(req, res) {
  try {
    const filters = {
      month: req.body.month ? parseInt(req.body.month) : null,
      year: req.body.year ? parseInt(req.body.year) : null,
      departmentId: req.body.departmentId ? parseInt(req.body.departmentId) : null,
      status: req.body.status || null,
      procurementMethod: req.body.procurementMethod || null
    };

    logger.info('Exporting detailed report as CSV', {
      filters,
      userId: req.user.id
    });

    // Get report data
    const reportData = reportService.getDetailedReport(filters);

    // Generate CSV
    const csv = csvGenerator.generateDetailedReportCSV(reportData);

    // Set headers
    const filename = `detailed-report-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csv);

    logger.info('Detailed CSV report exported successfully', {
      userId: req.user.id,
      projectCount: reportData.total_projects,
      filename
    });
  } catch (error) {
    logger.error('Error exporting detailed CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV report'
    });
  }
}

/**
 * Export executive summary as CSV
 */
export async function exportExecutiveCSV(req, res) {
  try {
    const filters = {
      month: req.body.month ? parseInt(req.body.month) : null,
      year: req.body.year ? parseInt(req.body.year) : null,
      departmentId: req.body.departmentId ? parseInt(req.body.departmentId) : null,
      status: req.body.status || null,
      procurementMethod: req.body.procurementMethod || null
    };

    logger.info('Exporting executive summary as CSV', {
      filters,
      userId: req.user.id
    });

    // Get report data
    const reportData = reportService.getExecutiveSummary(filters);

    // Generate CSV
    const csv = csvGenerator.generateExecutiveSummaryCSV(reportData);

    // Set headers
    const filename = `executive-summary-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csv);

    logger.info('Executive CSV report exported successfully', {
      userId: req.user.id,
      filename
    });
  } catch (error) {
    logger.error('Error exporting executive CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV report'
    });
  }
}

/**
 * Export detailed report as PDF
 */
export async function exportDetailedPDF(req, res) {
  try {
    const filters = {
      month: req.body.month ? parseInt(req.body.month) : null,
      year: req.body.year ? parseInt(req.body.year) : null,
      departmentId: req.body.departmentId ? parseInt(req.body.departmentId) : null,
      status: req.body.status || null,
      procurementMethod: req.body.procurementMethod || null
    };

    logger.info('Exporting detailed report as PDF', {
      filters,
      userId: req.user.id
    });

    // Get report data
    const reportData = reportService.getDetailedReport(filters);

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateDetailedReportPDF(reportData);

    // Set headers
    const filename = `detailed-report-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('Detailed PDF report exported successfully', {
      userId: req.user.id,
      projectCount: reportData.total_projects,
      filename,
      size: pdfBuffer.length
    });
  } catch (error) {
    logger.error('Error exporting detailed PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export PDF report'
    });
  }
}

/**
 * Export executive summary as PDF
 */
export async function exportExecutivePDF(req, res) {
  try {
    const filters = {
      month: req.body.month ? parseInt(req.body.month) : null,
      year: req.body.year ? parseInt(req.body.year) : null,
      departmentId: req.body.departmentId ? parseInt(req.body.departmentId) : null,
      status: req.body.status || null,
      procurementMethod: req.body.procurementMethod || null
    };

    logger.info('Exporting executive summary as PDF', {
      filters,
      userId: req.user.id
    });

    // Get report data
    const reportData = reportService.getExecutiveSummary(filters);

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateExecutiveSummaryPDF(reportData);

    // Set headers
    const filename = `executive-summary-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('Executive PDF report exported successfully', {
      userId: req.user.id,
      filename,
      size: pdfBuffer.length
    });
  } catch (error) {
    logger.error('Error exporting executive PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export PDF report'
    });
  }
}

export default {
  exportDetailedCSV,
  exportExecutiveCSV,
  exportDetailedPDF,
  exportExecutivePDF
};
