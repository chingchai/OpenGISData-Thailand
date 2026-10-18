/**
 * Test Database Helper
 * Utilities for setting up and tearing down test database
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

/**
 * Initialize in-memory test database with schema
 */
export function initTestDb() {
  // Create in-memory database
  db = new Database(':memory:');

  // Read test schema file
  const schemaPath = path.join(__dirname, 'testSchema.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Test schema file not found: ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  db.exec(schema);

  return db;
}

/**
 * Seed test database with sample data
 */
export function seedTestDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initTestDb() first.');
  }

  // Insert test departments
  const insertDept = db.prepare(`
    INSERT INTO departments (id, code, name, name_en, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertDept.run(1, 'FIN', 'กองคลัง', 'Finance', 'กองคลัง');
  insertDept.run(2, 'INFRA', 'กองช่าง', 'Infrastructure', 'กองช่าง');
  insertDept.run(3, 'EDU', 'กองการศึกษา', 'Education', 'กองการศึกษา');

  // Insert test users
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, email, full_name, role, department_id, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  // Admin user
  insertUser.run(1, 'admin', '$2b$10$test.hash', 'admin@test.com', 'Admin User', 'admin', 1);

  // Staff user (Finance dept)
  insertUser.run(2, 'staff1', '$2b$10$test.hash', 'staff1@test.com', 'Staff User 1', 'staff', 1);

  // Staff user (Infrastructure dept)
  insertUser.run(3, 'staff2', '$2b$10$test.hash', 'staff2@test.com', 'Staff User 2', 'staff', 2);

  // Executive user
  insertUser.run(4, 'exec', '$2b$10$test.hash', 'exec@test.com', 'Executive User', 'executive', 1);

  return db;
}

/**
 * Clear all data from test database
 */
export function clearTestDb() {
  if (!db) return;

  const tables = [
    'project_steps',
    'projects',
    'users',
    'departments'
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
}

/**
 * Close test database connection
 */
export function closeTestDb() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Get database instance
 */
export function getTestDb() {
  return db;
}

/**
 * Execute query on test database
 */
export function query(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.prepare(sql).all(params);
}

/**
 * Execute query and get first result
 */
export function queryOne(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.prepare(sql).get(params);
}

/**
 * Execute statement (INSERT, UPDATE, DELETE)
 */
export function execute(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.prepare(sql).run(params);
}

/**
 * Create test project
 */
export function createTestProject(data = {}) {
  const defaults = {
    name: 'Test Project',
    description: 'Test project description',
    department_id: 1,
    procurement_method: 'e-bidding',
    budget_amount: 1000000,
    budget_year: 2024,
    status: 'draft',
    created_by: 1
  };

  const projectData = { ...defaults, ...data };

  const result = execute(`
    INSERT INTO projects (
      name, description, department_id, procurement_method,
      budget_amount, budget_year, status, created_by,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `, [
    projectData.name,
    projectData.description,
    projectData.department_id,
    projectData.procurement_method,
    projectData.budget_amount,
    projectData.budget_year,
    projectData.status,
    projectData.created_by
  ]);

  return queryOne('SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);
}

/**
 * Create test step
 */
export function createTestStep(projectId, data = {}) {
  const defaults = {
    step_number: 1,
    step_name: 'Test Step',
    step_description: 'Test step description',
    planned_start_date: '2024-01-01',
    planned_end_date: '2024-01-15',
    sla_days: 14,
    status: 'pending',
    created_by: 1
  };

  const stepData = { ...defaults, ...data };

  const result = execute(`
    INSERT INTO project_steps (
      project_id, step_number, step_name, step_description,
      planned_start_date, planned_end_date, sla_days,
      status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `, [
    projectId,
    stepData.step_number,
    stepData.step_name,
    stepData.step_description,
    stepData.planned_start_date,
    stepData.planned_end_date,
    stepData.sla_days,
    stepData.status,
    stepData.created_by
  ]);

  return queryOne('SELECT * FROM project_steps WHERE id = ?', [result.lastInsertRowid]);
}

export default {
  initTestDb,
  seedTestDb,
  clearTestDb,
  closeTestDb,
  getTestDb,
  query,
  queryOne,
  execute,
  createTestProject,
  createTestStep
};
