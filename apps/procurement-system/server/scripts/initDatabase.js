#!/usr/bin/env node
/**
 * Database Initialization Script
 * Creates database schema and seeds initial data with real bcrypt passwords
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/procurement.db');
const SCHEMA_PATH = path.join(__dirname, '../data/database/schema.sql');

console.log('🚀 Starting database initialization...\n');

// Check if database already exists
if (fs.existsSync(DB_PATH)) {
  console.log('⚠️  Database already exists at:', DB_PATH);
  console.log('   Delete it first if you want to reinitialize.\n');
  process.exit(1);
}

// Create database directory if needed
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✓ Created database directory');
}

// Initialize database
const db = new Database(DB_PATH);
console.log('✓ Created database file:', DB_PATH);

// Read and execute schema
console.log('\n📋 Creating database schema...');
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);
console.log('✓ Schema created successfully');

// Seed data with real bcrypt passwords
console.log('\n🌱 Seeding initial data...');

const DEFAULT_PASSWORD = 'password123';
const SALT_ROUNDS = 10;

async function seedData() {
  console.log('   Generating bcrypt hashes...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // 1. Insert Departments
  console.log('   ✓ Inserting departments (7)...');
  const deptStmt = db.prepare(`
    INSERT INTO departments (id, code, name, name_en, description, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  const departments = [
    [1, 'TREASURY', 'กองคลัง', 'Treasury Department', 'รับผิดชอบด้านการเงิน บัญชี งบประมาณ และพัสดุ'],
    [2, 'ENGINEERING', 'กองช่าง', 'Engineering Department', 'รับผิดชอบด้านโครงสร้างพื้นฐาน การก่อสร้าง และซ่อมบำรุง'],
    [3, 'EDUCATION', 'กองการศึกษา', 'Education Department', 'รับผิดชอบด้านการศึกษา กีฬา และนันทนาการ'],
    [4, 'HEALTH', 'กองสาธารณสุขและสิ่งแวดล้อม', 'Health and Environment Department', 'รับผิดชอบด้านสาธารณสุข สุขาภิบาล และสิ่งแวดล้อม'],
    [5, 'MUNICIPAL', 'สำนักปลัด', 'Municipal Office', 'รับผิดชอบด้านบริหารทั่วไป กฎหมาย และประชาสัมพันธ์'],
    [6, 'STRATEGY', 'กองวิชาการและแผนงาน', 'Strategy and Planning Department', 'รับผิดชอบด้านวิชาการ วางแผน และติดตามประเมินผล'],
    [7, 'CLERK', 'กองธุรการ', 'Clerk Department', 'รับผิดชอบด้านธุรการ สารบรรณ และบริหารงานบุคคล']
  ];

  for (const dept of departments) {
    deptStmt.run(...dept);
  }

  // 2. Insert Users with real passwords
  console.log('   ✓ Inserting users with bcrypt passwords...');
  const userStmt = db.prepare(`
    INSERT INTO users (username, password, full_name, email, role, department_id, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  const users = [
    // Staff (1 per department)
    ['staff_treasury', passwordHash, 'นางสาวสมหญิง ใจดี', 'treasury@huatalay.go.th', 'staff', 1],
    ['staff_engineering', passwordHash, 'นายสมชาย ช่างคิด', 'engineering@huatalay.go.th', 'staff', 2],
    ['staff_education', passwordHash, 'นางสมศรี รักการศึกษา', 'education@huatalay.go.th', 'staff', 3],
    ['staff_health', passwordHash, 'นายแพทย์สมศักดิ์ รักษา', 'health@huatalay.go.th', 'staff', 4],
    ['staff_municipal', passwordHash, 'นายสมพร บริหาร', 'municipal@huatalay.go.th', 'staff', 5],
    ['staff_strategy', passwordHash, 'นางสาวสมฤทัย วางแผน', 'strategy@huatalay.go.th', 'staff', 6],
    ['staff_clerk', passwordHash, 'นายสมบูรณ์ จัดการ', 'clerk@huatalay.go.th', 'staff', 7],

    // Admins
    ['admin', passwordHash, 'นายผู้ดูแลระบบ', 'admin@huatalay.go.th', 'admin', null],
    ['admin_treasury', passwordHash, 'นางสาวผู้ช่วยผู้ดูแล', 'admin2@huatalay.go.th', 'admin', 1],

    // Executives
    ['executive', passwordHash, 'นายปลัดเทศบาล', 'executive@huatalay.go.th', 'executive', null],
    ['executive_mayor', passwordHash, 'นายกเทศมนตรี', 'mayor@huatalay.go.th', 'executive', null]
  ];

  for (const user of users) {
    userStmt.run(...user);
  }

  console.log(`   ✓ Created ${users.length} users (password: "${DEFAULT_PASSWORD}")`);

  // 3. Insert Sample Projects
  console.log('   ✓ Inserting sample projects (5)...');
  const projectStmt = db.prepare(`
    INSERT INTO projects (
      project_code, name, description, department_id,
      procurement_method, budget, start_date, expected_end_date,
      status, urgency_level, contractor_type, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const projects = [
    ['PR-2567-002-001', 'ปรับปรุงถนนภายในตำบลหัวทะเล สายที่ 1',
     'โครงการปรับปรุงถนนคอนกรีตเสริมเหล็กภายในตำบล ความยาว 1.5 กม.',
     2, 'public_invitation', 2500000.00, '2024-01-15', '2024-04-15',
     'in_progress', 'urgent', 'construction', 2],

    ['PR-2567-002-002', 'ซ่อมแซมสะพานข้ามคลอง',
     'โครงการซ่อมแซมสะพานคอนกรีตเสริมเหล็กที่ชำรุด',
     2, 'selection', 850000.00, '2024-02-01', '2024-03-30',
     'in_progress', 'critical', 'construction', 2],

    ['PR-2567-003-001', 'จัดซื้อเครื่องคอมพิวเตอร์โรงเรียน',
     'จัดซื้อเครื่องคอมพิวเตอร์สำหรับห้องเรียน จำนวน 30 เครื่อง',
     3, 'specific', 450000.00, '2024-01-10', '2024-02-28',
     'completed', 'normal', 'goods', 3],

    ['PR-2567-003-002', 'จ้างเหมาบริการทำความสะอาดโรงเรียน',
     'จ้างเหมาบริการทำความสะอาดโรงเรียนในสังกัด 1 ปี',
     3, 'selection', 180000.00, '2024-03-01', '2024-04-15',
     'in_progress', 'normal', 'services', 3],

    ['PR-2567-004-001', 'จัดซื้อวัคซีนป้องกันโรคพิษสุนัขบ้า',
     'จัดซื้อวัคซีนสำหรับสัตว์เลี้ยงในชุมชน',
     4, 'specific', 120000.00, '2024-02-15', '2024-03-15',
     'delayed', 'urgent', 'goods', 4]
  ];

  for (const project of projects) {
    projectStmt.run(...project);
  }

  // 4. Insert Sample Project Steps
  console.log('   ✓ Inserting sample project steps (7)...');
  const stepStmt = db.prepare(`
    INSERT INTO project_steps (
      project_id, step_number, step_name, description,
      sla_days, planned_start, planned_end,
      actual_start, actual_end, status, is_critical
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const steps = [
    [1, 1, 'จัดทำร่างขอบเขตงาน (TOR)', 'จัดทำเอกสารรายละเอียดคุณลักษณะเฉพาะ',
     7, '2024-01-15', '2024-01-22', '2024-01-15', '2024-01-21', 'completed', 0],
    [1, 2, 'เสนอขออนุมัติหลักการ', 'เสนอผู้มีอำนาจพิจารณาอนุมัติ',
     5, '2024-01-23', '2024-01-28', '2024-01-22', '2024-01-27', 'completed', 0],
    [1, 3, 'ประกาศเชิญชวน', 'ประกาศเชิญชวนผู้ประกอบการ',
     21, '2024-01-29', '2024-02-19', '2024-01-28', null, 'in_progress', 1],
    [1, 4, 'รับซองข้อเสนอ', 'รับซองข้อเสนอจากผู้ประกอบการ',
     1, '2024-02-20', '2024-02-20', null, null, 'pending', 0],
    [1, 5, 'เปิดซองและพิจารณาข้อเสนอ', 'พิจารณาผลการประกวดราคา',
     7, '2024-02-21', '2024-02-28', null, null, 'pending', 1],
    [1, 6, 'ประกาศผลผู้ชนะ', 'ประกาศรายชื่อผู้ชนะ',
     3, '2024-03-01', '2024-03-04', null, null, 'pending', 0],
    [1, 7, 'ทำสัญญาหรือข้อตกลง', 'ดำเนินการทำสัญญาจ้าง',
     14, '2024-03-05', '2024-03-19', null, null, 'pending', 1]
  ];

  for (const step of steps) {
    stepStmt.run(...step);
  }

  console.log('\n✅ Database initialization complete!');
  console.log('\n📊 Summary:');
  console.log(`   • Database: ${DB_PATH}`);
  console.log(`   • Departments: ${departments.length}`);
  console.log(`   • Users: ${users.length}`);
  console.log(`   • Projects: ${projects.length}`);
  console.log(`   • Steps: ${steps.length}`);
  console.log(`\n🔐 Default password for all users: "${DEFAULT_PASSWORD}"`);
  console.log('\n📝 Login credentials:');
  console.log('   Admin:     admin / password123');
  console.log('   Staff:     staff_treasury / password123');
  console.log('   Executive: executive / password123');
}

// Run seeding
seedData()
  .then(() => {
    db.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error during initialization:', error);
    db.close();
    process.exit(1);
  });
