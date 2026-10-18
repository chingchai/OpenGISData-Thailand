-- Test Database Schema
-- Minimal schema for unit testing

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK(role IN ('staff', 'admin', 'executive')),
  department_id INTEGER,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  department_id INTEGER NOT NULL,
  procurement_method VARCHAR(50) NOT NULL,
  budget_amount DECIMAL(15,2) NOT NULL,
  budget_year INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  deleted_at DATETIME,
  deleted_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Project Steps table
CREATE TABLE IF NOT EXISTS project_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(200) NOT NULL,
  step_description TEXT,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  sla_days INTEGER,
  delay_days INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'on_hold', 'overdue')),
  notes TEXT,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE(project_id, step_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_steps_project ON project_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_project_steps_status ON project_steps(status);
