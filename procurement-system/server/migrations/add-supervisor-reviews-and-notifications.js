/**
 * Migration: Add supervisor_reviews and notifications tables
 * Date: 2025-11-20
 *
 * เพิ่มตารางสำหรับการตรวจสอบจากผู้บริหารและการแจ้งเตือน
 * เพื่อรองรับระบบกำกับติดตามความก้าวหน้าโครงการ
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/database/procurement.db');
const db = new Database(dbPath);

try {
  console.log('Running migration: add-supervisor-reviews-and-notifications');

  // ตรวจสอบว่ามีตารางอยู่แล้วหรือไม่
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map(t => t.name);

  // 1. สร้างตาราง supervisor_reviews (ข้อความตรวจสอบจากผู้บริหาร)
  if (!tableNames.includes('supervisor_reviews')) {
    console.log('Creating supervisor_reviews table...');
    db.prepare(`
      CREATE TABLE supervisor_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        supervisor_id INTEGER NOT NULL,
        review_type VARCHAR(20) NOT NULL CHECK(review_type IN ('feedback', 'concern', 'approval', 'question')),
        message TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (supervisor_id) REFERENCES users(id)
      )
    `).run();

    db.prepare(`
      CREATE INDEX idx_supervisor_reviews_project ON supervisor_reviews(project_id)
    `).run();

    db.prepare(`
      CREATE INDEX idx_supervisor_reviews_supervisor ON supervisor_reviews(supervisor_id)
    `).run();

    console.log('✓ Created supervisor_reviews table');
  } else {
    console.log('✓ supervisor_reviews table already exists');
  }

  // 2. สร้างตาราง notifications (การแจ้งเตือน)
  if (!tableNames.includes('notifications')) {
    console.log('Creating notifications table...');
    db.prepare(`
      CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        related_id INTEGER,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run();

    db.prepare(`
      CREATE INDEX idx_notifications_user ON notifications(user_id)
    `).run();

    db.prepare(`
      CREATE INDEX idx_notifications_read ON notifications(is_read)
    `).run();

    db.prepare(`
      CREATE INDEX idx_notifications_created ON notifications(created_at DESC)
    `).run();

    console.log('✓ Created notifications table');
  } else {
    console.log('✓ notifications table already exists');
  }

  console.log('✓ Migration completed successfully');
  db.close();
  process.exit(0);

} catch (error) {
  console.error('✗ Migration failed:', error.message);
  db.close();
  process.exit(1);
}
