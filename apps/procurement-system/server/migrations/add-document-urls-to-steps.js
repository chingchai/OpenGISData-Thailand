/**
 * Migration: Add document_urls column to project_steps table
 * Date: 2024-11-20
 * Description: เพิ่มฟิลด์สำหรับเก็บ URLs ของเอกสารแนบในขั้นตอนการดำเนินงาน
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/database/procurement.db');

async function migrate() {
  const db = new Database(dbPath);

  try {
    console.log('🔄 Starting migration: add-document-urls-to-steps');

    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(project_steps)").all();
    const hasDocumentUrls = tableInfo.some(col => col.name === 'document_urls');

    if (hasDocumentUrls) {
      console.log('✅ Column document_urls already exists. Skipping migration.');
      db.close();
      return;
    }

    // Add document_urls column
    db.prepare(`
      ALTER TABLE project_steps
      ADD COLUMN document_urls TEXT
    `).run();

    console.log('✅ Added column: document_urls (TEXT)');
    console.log('✅ Migration completed successfully!');

    db.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    db.close();
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export default migrate;
