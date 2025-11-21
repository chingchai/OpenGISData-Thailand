#!/usr/bin/env node
/**
 * Migration: เพิ่ม location (GeoJSON) ให้กับตาราง projects
 * เพื่อเก็บตำแหน่งพิกัดของโครงการ
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/procurement.db');

console.log('Running migration: add-project-location');
console.log('Database:', DB_PATH);

const db = new Database(DB_PATH);

try {
  // เริ่ม transaction
  db.exec('BEGIN TRANSACTION');

  // ตรวจสอบว่ามี column location อยู่แล้วหรือไม่
  const tableInfo = db.prepare("PRAGMA table_info(projects)").all();
  const hasLocationColumn = tableInfo.some(col => col.name === 'location');

  if (hasLocationColumn) {
    console.log('⚠️  location column already exists, skipping...');
  } else {
    console.log('Adding location column to projects table...');

    // เพิ่ม location column (TEXT สำหรับเก็บ GeoJSON)
    db.exec(`
      ALTER TABLE projects
      ADD COLUMN location TEXT
    `);

    console.log('✓ Added location column');

    // ตั้งค่า default location สำหรับโครงการที่มีอยู่แล้ว (สำนักงานเทศบาลตำบลหัวทะเล)
    const defaultLocation = JSON.stringify({
      type: 'Point',
      coordinates: [102.0983, 14.9753] // [longitude, latitude] - สำนักงานเทศบาลตำบลหัวทะเล จ.นครราชสีมา
    });

    db.prepare(`
      UPDATE projects
      SET location = ?
      WHERE location IS NULL
    `).run(defaultLocation);

    console.log('✓ Set default location for existing projects');
  }

  // Commit transaction
  db.exec('COMMIT');

  console.log('✓ Migration completed successfully');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
