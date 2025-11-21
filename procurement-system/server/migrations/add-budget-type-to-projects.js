/**
 * Migration: Add budget_type and budget_fiscal_year to projects table
 * Date: 2025-11-20
 *
 * Adds columns for budget type classification:
 * 1 = เงินงบประมาณตามเทศบัญญัติ งบประมาณรายจ่าย ประจำปีงบประมาณ พ.ศ.
 * 2 = เงินอุดหนุนเฉพาะกิจ
 * 3 = เงินสะสม
 * 4 = เงินรายจ่ายค้างจ่าย (เงินกัน) ประจำปีงบประมาณ พ.ศ.
 * 5 = อื่นๆ (เงินที่มีการยกเว้นระเบียบ) ประจำปีงบประมาณ พ.ศ.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/database/procurement.db');
const db = new Database(dbPath);

try {
  console.log('Running migration: add-budget-type-to-projects');

  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(projects)").all();
  const budgetTypeExists = tableInfo.some(col => col.name === 'budget_type');
  const budgetFiscalYearExists = tableInfo.some(col => col.name === 'budget_fiscal_year');

  if (budgetTypeExists && budgetFiscalYearExists) {
    console.log('✓ Columns budget_type and budget_fiscal_year already exist. Skipping migration.');
    process.exit(0);
  }

  // Add budget_type column if it doesn't exist
  if (!budgetTypeExists) {
    console.log('Adding budget_type column...');
    db.prepare(`
      ALTER TABLE projects
      ADD COLUMN budget_type INTEGER CHECK(budget_type IN (1, 2, 3, 4, 5))
    `).run();
    console.log('✓ Added budget_type column');
  }

  // Add budget_fiscal_year column if it doesn't exist
  if (!budgetFiscalYearExists) {
    console.log('Adding budget_fiscal_year column...');
    db.prepare(`
      ALTER TABLE projects
      ADD COLUMN budget_fiscal_year INTEGER
    `).run();
    console.log('✓ Added budget_fiscal_year column');
  }

  console.log('✓ Migration completed successfully');
  db.close();
  process.exit(0);

} catch (error) {
  console.error('✗ Migration failed:', error.message);
  db.close();
  process.exit(1);
}
