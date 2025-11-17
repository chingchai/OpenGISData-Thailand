-- ระบบจัดการโครงการจัดซื้อจัดจ้าง - Database Schema
-- เทศบาลตำบลหัวทะเล
-- Database: SQLite (MVP) → MariaDB (Production)

-- ========================================
-- 1. USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK(role IN ('staff', 'admin', 'executive')),
    department_id INTEGER,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);

-- ========================================
-- 2. DEPARTMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(code);

-- ========================================
-- 3. PROJECTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    department_id INTEGER NOT NULL,
    procurement_method VARCHAR(50) NOT NULL CHECK(procurement_method IN ('public_invitation', 'selection', 'specific')),
    budget DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    expected_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'in_progress', 'completed', 'delayed', 'cancelled', 'deleted')),
    urgency_level VARCHAR(20) DEFAULT 'normal' CHECK(urgency_level IN ('normal', 'urgent', 'critical')),
    contractor_type VARCHAR(50) CHECK(contractor_type IN ('goods', 'services', 'construction')),
    progress_percentage INTEGER DEFAULT 0 CHECK(progress_percentage >= 0 AND progress_percentage <= 100),
    delay_days INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    deleted_by INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (deleted_by) REFERENCES users(id)
);

CREATE INDEX idx_projects_code ON projects(project_code);
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_method ON projects(procurement_method);
CREATE INDEX idx_projects_dates ON projects(start_date, expected_end_date);

-- ========================================
-- 4. PROJECT STEPS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS project_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(200) NOT NULL,
    description TEXT,
    sla_days INTEGER NOT NULL,
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
    delay_days INTEGER DEFAULT 0,
    is_critical BOOLEAN DEFAULT 0,
    notes TEXT,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    UNIQUE(project_id, step_number)
);

CREATE INDEX idx_steps_project ON project_steps(project_id);
CREATE INDEX idx_steps_status ON project_steps(status);
CREATE INDEX idx_steps_dates ON project_steps(planned_start, planned_end);

-- ========================================
-- 5. COMMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    step_id INTEGER,
    user_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'general' CHECK(comment_type IN ('general', 'approval', 'concern', 'suggestion', 'question', 'instruction')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK(priority IN ('normal', 'high', 'urgent')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK(visibility IN ('public', 'department', 'management')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES project_steps(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_comments_step ON comments(step_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at);

-- ========================================
-- 6. SLA CONFIGURATION TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS sla_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    procurement_method VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(200) NOT NULL,
    standard_days INTEGER NOT NULL,
    warning_days INTEGER DEFAULT 3,
    minimum_days INTEGER,
    maximum_days INTEGER,
    is_critical BOOLEAN DEFAULT 0,
    allow_weekends BOOLEAN DEFAULT 0,
    allow_holidays BOOLEAN DEFAULT 0,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    UNIQUE(procurement_method, step_number)
);

CREATE INDEX idx_sla_method ON sla_config(procurement_method);

-- ========================================
-- 7. SLA TEMPLATES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS sla_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    procurement_method VARCHAR(50) NOT NULL,
    config_data TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_templates_method ON sla_templates(procurement_method);

-- ========================================
-- 8. NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    step_id INTEGER,
    notification_type VARCHAR(50) NOT NULL CHECK(notification_type IN ('sla_warning', 'sla_violation', 'step_completed', 'project_completed', 'comment_added', 'project_created', 'project_updated', 'status_change')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN DEFAULT 0,
    read_at DATETIME,
    action_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES project_steps(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ========================================
-- 9. AUDIT LOG TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ========================================
-- 10. SESSION TABLE (for JWT refresh tokens)
-- ========================================
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-update updated_at timestamp for users
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Auto-update updated_at timestamp for projects
CREATE TRIGGER IF NOT EXISTS update_projects_timestamp
AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Auto-update updated_at timestamp for project_steps
CREATE TRIGGER IF NOT EXISTS update_steps_timestamp
AFTER UPDATE ON project_steps
BEGIN
    UPDATE project_steps SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Auto-calculate project progress based on completed steps
CREATE TRIGGER IF NOT EXISTS calculate_project_progress
AFTER UPDATE ON project_steps
BEGIN
    UPDATE projects
    SET progress_percentage = (
        SELECT CAST(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) AS INTEGER)
        FROM project_steps
        WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
END;

-- ========================================
-- VIEWS
-- ========================================

-- Project Overview with Department Info
CREATE VIEW IF NOT EXISTS v_projects_overview AS
SELECT
    p.*,
    d.name as department_name,
    d.code as department_code,
    u.full_name as created_by_name,
    (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id) as total_steps,
    (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'completed') as completed_steps,
    (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'delayed') as delayed_steps
FROM projects p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN users u ON p.created_by = u.id
WHERE p.deleted_at IS NULL;

-- Delayed Projects View
CREATE VIEW IF NOT EXISTS v_delayed_projects AS
SELECT
    p.*,
    d.name as department_name,
    ps.step_name as delayed_step,
    ps.delay_days as step_delay_days
FROM projects p
JOIN departments d ON p.department_id = d.id
JOIN project_steps ps ON p.id = ps.project_id
WHERE ps.status = 'delayed'
AND p.status != 'completed'
AND p.deleted_at IS NULL
ORDER BY ps.delay_days DESC;

-- User Notifications Summary
CREATE VIEW IF NOT EXISTS v_user_notifications AS
SELECT
    n.*,
    p.name as project_name,
    p.project_code,
    ps.step_name
FROM notifications n
LEFT JOIN projects p ON n.project_id = p.id
LEFT JOIN project_steps ps ON n.step_id = ps.id
WHERE n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP
ORDER BY n.created_at DESC;
