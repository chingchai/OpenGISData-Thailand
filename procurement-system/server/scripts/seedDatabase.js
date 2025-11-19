#!/usr/bin/env node
/**
 * Database Seeding Script
 * Adds additional sample data to existing database
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/procurement.db');
const DEFAULT_PASSWORD = 'password123';
const SALT_ROUNDS = 10;

console.log('🌱 Seeding additional sample data...\n');

const db = new Database(DB_PATH);

async function seedAdditionalData() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // Add more sample projects
  console.log('   ✓ Adding additional projects...');
  const projectStmt = db.prepare(`
    INSERT INTO projects (
      project_code, name, description, department_id,
      procurement_method, budget, start_date, expected_end_date,
      status, urgency_level, contractor_type, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const additionalProjects = [
    ['PR-2567-001-001', 'จัดซื้อเครื่องปรับอากาศสำนักงาน',
     'จัดซื้อเครื่องปรับอากาศประสิทธิภาพสูง จำนวน 10 เครื่อง',
     1, 'specific', 350000.00, '2024-03-10', '2024-04-10',
     'pending', 'normal', 'goods', 1],

    ['PR-2567-005-001', 'จ้างพัฒนาระบบสารบรรณอิเล็กทรอนิกส์',
     'จ้างพัฒนาระบบสารบรรณอิเล็กทรอนิกส์แบบครบวงจร',
     5, 'selection', 950000.00, '2024-04-01', '2024-07-31',
     'pending', 'high', 'services', 5],

    ['PR-2567-006-001', 'จัดทำแผนพัฒนาท้องถิ่น',
     'จ้างที่ปรึกษาจัดทำแผนพัฒนาท้องถิ่น พ.ศ. 2568-2571',
     6, 'selection', 280000.00, '2024-05-01', '2024-06-30',
     'pending', 'normal', 'consulting', 6]
  ];

  for (const project of additionalProjects) {
    try {
      projectStmt.run(...project);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log(`   ⚠️  Project ${project[0]} already exists, skipping...`);
      } else {
        throw error;
      }
    }
  }

  // Add sample comments
  console.log('   ✓ Adding sample comments...');
  const commentStmt = db.prepare(`
    INSERT INTO comments (
      project_id, step_id, user_id, comment_text,
      comment_type, priority, visibility
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const comments = [
    [1, null, 11, 'โครงการนี้เป็นความเร่งด่วน กรุณาเร่งรัดดำเนินการให้แล้วเสร็จตามกำหนด',
     'instruction', 'urgent', 'public'],
    [1, 3, 11, 'ขอให้ตรวจสอบคุณสมบัติผู้ประกอบการให้ละเอียดด้วย',
     'concern', 'high', 'public'],
    [2, null, 10, 'โครงการนี้ควรดำเนินการก่อนฤดูฝน',
     'suggestion', 'medium', 'public']
  ];

  for (const comment of comments) {
    try {
      commentStmt.run(...comment);
    } catch (error) {
      // Skip if already exists
      console.log('   ⚠️  Some comments already exist, skipping...');
      break;
    }
  }

  // Add sample notifications
  console.log('   ✓ Adding sample notifications...');
  const notifStmt = db.prepare(`
    INSERT INTO notifications (
      user_id, project_id, step_id, notification_type,
      title, message, priority, is_read
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const notifications = [
    [2, 1, 3, 'sla_warning', 'เตือน: ขั้นตอนใกล้เกินกำหนด',
     'โครงการ "ปรับปรุงถนนภายในตำบลหัวทะเล" ขั้นตอน "ประกาศเชิญชวน" เหลือเวลา 3 วัน', 'high'],
    [2, null, null, 'comment_added', 'ความเห็นใหม่จากผู้บริหาร',
     'ปลัดเทศบาลได้แสดงความเห็นในโครงการของคุณ', 'medium'],
    [3, 3, null, 'project_assigned', 'มอบหมายโครงการใหม่',
     'คุณได้รับมอบหมายให้ดูแลโครงการใหม่', 'high']
  ];

  for (const notif of notifications) {
    try {
      notifStmt.run(...notif);
    } catch (error) {
      console.log('   ⚠️  Some notifications already exist, skipping...');
      break;
    }
  }

  console.log('\n✅ Additional data seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • Additional projects: ${additionalProjects.length}`);
  console.log(`   • Comments: ${comments.length}`);
  console.log(`   • Notifications: ${notifications.length}`);
}

seedAdditionalData()
  .then(() => {
    db.close();
    console.log('\n✓ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error during seeding:', error);
    db.close();
    process.exit(1);
  });
