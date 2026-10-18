#!/usr/bin/env node
/**
 * Database Verification Script
 * Checks database contents and verifies data integrity
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/procurement.db');

console.log('🔍 Verifying database contents...\n');

const db = new Database(DB_PATH, { readonly: true });

// Count records
const counts = {
  departments: db.prepare('SELECT COUNT(*) as count FROM departments').get().count,
  users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
  projects: db.prepare('SELECT COUNT(*) as count FROM projects').get().count,
  steps: db.prepare('SELECT COUNT(*) as count FROM project_steps').get().count,
  comments: db.prepare('SELECT COUNT(*) as count FROM comments').get().count,
  notifications: db.prepare('SELECT COUNT(*) as count FROM notifications').get().count
};

console.log('📊 Record Counts:');
console.log(`   • Departments: ${counts.departments}`);
console.log(`   • Users: ${counts.users}`);
console.log(`   • Projects: ${counts.projects}`);
console.log(`   • Project Steps: ${counts.steps}`);
console.log(`   • Comments: ${counts.comments}`);
console.log(`   • Notifications: ${counts.notifications}`);

// Show departments
console.log('\n🏢 Departments:');
const departments = db.prepare('SELECT code, name, name_en FROM departments ORDER BY id').all();
departments.forEach(dept => {
  console.log(`   ${dept.code.padEnd(15)} ${dept.name} (${dept.name_en})`);
});

// Show users by role
console.log('\n👥 Users:');
const users = db.prepare(`
  SELECT username, role, full_name, d.name as dept_name
  FROM users u
  LEFT JOIN departments d ON u.department_id = d.id
  ORDER BY role, username
`).all();

const byRole = { admin: [], staff: [], executive: [] };
users.forEach(user => {
  byRole[user.role].push(user);
});

console.log(`   Admin (${byRole.admin.length}):`);
byRole.admin.forEach(u => console.log(`     ${u.username.padEnd(20)} ${u.full_name}`));

console.log(`   Staff (${byRole.staff.length}):`);
byRole.staff.forEach(u => console.log(`     ${u.username.padEnd(20)} ${u.full_name} (${u.dept_name || 'N/A'})`));

console.log(`   Executive (${byRole.executive.length}):`);
byRole.executive.forEach(u => console.log(`     ${u.username.padEnd(20)} ${u.full_name}`));

// Show projects
console.log('\n📋 Projects:');
const projects = db.prepare(`
  SELECT p.project_code, p.name, p.status, p.budget, d.name as dept_name
  FROM projects p
  JOIN departments d ON p.department_id = d.id
  ORDER BY p.id
`).all();

projects.forEach(p => {
  const budget = new Intl.NumberFormat('th-TH').format(p.budget);
  console.log(`   ${p.project_code}: ${p.name}`);
  console.log(`      Status: ${p.status} | Budget: ${budget} บาท | Dept: ${p.dept_name}`);
});

// Show project steps summary
console.log('\n📍 Project Steps Summary:');
const stepsSummary = db.prepare(`
  SELECT
    p.project_code,
    COUNT(*) as total_steps,
    SUM(CASE WHEN ps.status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN ps.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN ps.status = 'pending' THEN 1 ELSE 0 END) as pending
  FROM project_steps ps
  JOIN projects p ON ps.project_id = p.id
  GROUP BY p.id
`).all();

stepsSummary.forEach(s => {
  console.log(`   ${s.project_code}: ${s.completed}/${s.total_steps} completed, ${s.in_progress} in progress, ${s.pending} pending`);
});

db.close();

console.log('\n✅ Database verification complete!');
console.log('\n🔐 Default credentials:');
console.log('   Username: admin');
console.log('   Password: password123\n');
