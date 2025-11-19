-- ========================================
-- Database Schema - ระบบจัดการโครงการจัดซื้อจัดจ้าง
-- เทศบาลตำบลหัวทะเล
-- Database: MariaDB/MySQL (Production)
-- ========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 1. DEPARTMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `departments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL UNIQUE COMMENT 'รหัสกอง เช่น ADM, ENG',
    `name` VARCHAR(100) NOT NULL COMMENT 'ชื่อกอง/สำนัก',
    `name_en` VARCHAR(100) COMMENT 'ชื่อภาษาอังกฤษ',
    `description` TEXT COMMENT 'คำอธิบาย',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_code` (`code`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE,
    `phone` VARCHAR(20),
    `role` ENUM('staff', 'admin', 'executive') NOT NULL DEFAULT 'staff',
    `department_id` INT COMMENT 'NULL สำหรับ admin/executive',
    `position` VARCHAR(100) COMMENT 'ตำแหน่งงาน',
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_login` TIMESTAMP NULL,
    `password_changed_at` TIMESTAMP NULL,
    `email_verified_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,

    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_department_role` (`department_id`, `role`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. USER SESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL COMMENT 'Hashed JWT token',
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `revoked_at` TIMESTAMP NULL,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,

    INDEX `idx_user_token` (`user_id`, `token_hash`),
    INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. PROJECTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `projects` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `project_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสโครงการ PR-YYYY-DDD-XXX',
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `department_id` INT NOT NULL,
    `procurement_method` ENUM('public_invitation', 'selection', 'specific') NOT NULL,

    -- ข้อมูลงบประมาณ
    `budget` DECIMAL(15,2) NOT NULL COMMENT 'งบประมาณ (บาท)',
    `budget_source` VARCHAR(100) COMMENT 'แหล่งงบประมาณ',
    `budget_year` YEAR NOT NULL COMMENT 'ปีงบประมาณ',

    -- ข้อมูลเวลา
    `start_date` DATE NOT NULL,
    `expected_end_date` DATE,
    `actual_end_date` DATE NULL,

    -- สถานะและความสำคัญ
    `status` ENUM('draft', 'pending', 'in_progress', 'completed', 'cancelled', 'suspended') DEFAULT 'draft',
    `priority` ENUM('low', 'normal', 'high', 'urgent', 'critical') DEFAULT 'normal',
    `urgency_level` ENUM('normal', 'urgent', 'critical') DEFAULT 'normal',

    -- ประเภทงาน
    `contractor_type` ENUM('goods', 'services', 'construction') COMMENT 'ประเภทผู้รับจ้าง',

    -- ข้อมูลผู้รับผิดชอบ
    `created_by` INT NOT NULL,
    `assigned_to` INT COMMENT 'ผู้รับผิดชอบหลัก',
    `approved_by` INT COMMENT 'ผู้อนุมัติ',
    `approved_at` TIMESTAMP NULL,

    -- ข้อมูลเพิ่มเติม
    `notes` TEXT COMMENT 'หมายเหตุเพิ่มเติม',
    `risk_level` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    `is_deleted` BOOLEAN DEFAULT FALSE COMMENT 'Soft delete',
    `deleted_at` TIMESTAMP NULL,
    `deleted_by` INT NULL,

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
    FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`),
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`),
    FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`),

    INDEX `idx_project_code` (`project_code`),
    INDEX `idx_department_status` (`department_id`, `status`),
    INDEX `idx_budget_year` (`budget_year`),
    INDEX `idx_dates` (`start_date`, `expected_end_date`),
    INDEX `idx_procurement_method` (`procurement_method`),
    INDEX `idx_projects_dashboard` (`department_id`, `status`, `budget_year`),
    UNIQUE KEY `uk_name_dept_year` (`name`, `department_id`, `budget_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. PROJECT STEPS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `project_steps` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `project_id` INT NOT NULL,
    `step_number` INT NOT NULL COMMENT 'ลำดับขั้นตอน 1,2,3...',
    `step_name` VARCHAR(200) NOT NULL,
    `description` TEXT,

    -- กำหนดเวลาตาม SLA
    `sla_days` INT NOT NULL DEFAULT 7 COMMENT 'จำนวนวันตาม SLA',
    `warning_days` INT DEFAULT 3 COMMENT 'แจ้งเตือนก่อนครบกำหนด',

    -- วันที่วางแผน
    `planned_start_date` DATE,
    `planned_end_date` DATE,

    -- วันที่จริง
    `actual_start_date` DATE NULL,
    `actual_end_date` DATE NULL,

    -- สถานะ
    `status` ENUM('pending', 'in_progress', 'completed', 'delayed', 'cancelled', 'on_hold') DEFAULT 'pending',

    -- การคำนวณความล่าช้า
    `delay_days` INT DEFAULT 0 COMMENT 'จำนวนวันที่ล่าช้า',
    `is_critical_path` BOOLEAN DEFAULT FALSE COMMENT 'เป็น Critical Path หรือไม่',

    -- ผู้รับผิดชอบ
    `assigned_to` INT COMMENT 'ผู้รับผิดชอบขั้นตอนนี้',
    `completed_by` INT COMMENT 'ผู้ที่ทำให้เสร็จ',
    `completed_at` TIMESTAMP NULL,

    -- หมายเหตุ
    `notes` TEXT,
    `attachments` JSON COMMENT 'ไฟล์แนบ (array of objects)',

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`),
    FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`),

    INDEX `idx_project_step` (`project_id`, `step_number`),
    INDEX `idx_status_dates` (`status`, `planned_end_date`),
    INDEX `idx_assigned` (`assigned_to`, `status`),
    INDEX `idx_steps_timeline` (`project_id`, `status`, `planned_end_date`),
    INDEX `idx_steps_sla` (`status`, `planned_end_date`, `delay_days`),
    UNIQUE KEY `uk_project_step` (`project_id`, `step_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 6. SLA CONFIG TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `sla_config` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `procurement_method` ENUM('public_invitation', 'selection', 'specific') NOT NULL,
    `step_number` INT NOT NULL,
    `step_name` VARCHAR(200) NOT NULL,
    `standard_days` INT NOT NULL COMMENT 'จำนวนวันมาตรฐาน',
    `minimum_days` INT DEFAULT 1 COMMENT 'จำนวนวันต่ำสุด',
    `maximum_days` INT COMMENT 'จำนวนวันสูงสุด',
    `warning_days` INT DEFAULT 3 COMMENT 'แจ้งเตือนก่อนครบกำหนด',
    `is_critical_path` BOOLEAN DEFAULT FALSE,
    `allow_weekends` BOOLEAN DEFAULT FALSE,
    `allow_holidays` BOOLEAN DEFAULT FALSE,

    -- ผู้ตั้งค่า
    `updated_by` INT NOT NULL,
    `effective_date` DATE DEFAULT (CURDATE()),

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),

    INDEX `idx_method_step` (`procurement_method`, `step_number`),
    UNIQUE KEY `uk_method_step` (`procurement_method`, `step_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 7. SLA TEMPLATES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `sla_templates` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `template_name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `procurement_method` ENUM('public_invitation', 'selection', 'specific') NOT NULL,
    `config_data` JSON NOT NULL COMMENT 'การตั้งค่า SLA ทั้งหมด',
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_default` BOOLEAN DEFAULT FALSE,

    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),

    INDEX `idx_method_active` (`procurement_method`, `is_active`),
    UNIQUE KEY `uk_template_name` (`template_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 8. NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `type` ENUM('sla_warning', 'sla_violation', 'step_completed', 'project_completed',
                'comment_added', 'project_created', 'project_updated', 'approval_required',
                'extension_approved', 'extension_rejected', 'milestone_reached') NOT NULL,
    `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',

    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,

    -- ผู้รับ
    `user_id` INT NOT NULL COMMENT 'ผู้รับแจ้งเตือน',

    -- การอ้างอิง
    `project_id` INT COMMENT 'โครงการที่เกี่ยวข้อง',
    `step_id` INT COMMENT 'ขั้นตอนที่เกี่ยวข้อง',
    `related_data` JSON COMMENT 'ข้อมูลเพิ่มเติม',

    -- URL สำหรับ deep link
    `action_url` VARCHAR(500) COMMENT 'ลิงก์ไปยังหน้าที่เกี่ยวข้อง',

    -- สถานะ
    `is_read` BOOLEAN DEFAULT FALSE,
    `read_at` TIMESTAMP NULL,
    `expires_at` TIMESTAMP COMMENT 'หมดอายุเมื่อไหร่',

    -- ช่องทางการส่ง
    `channels` JSON COMMENT 'web, email, line, sms',
    `delivery_status` JSON COMMENT 'สถานะการส่งแต่ละช่องทาง',

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`step_id`) REFERENCES `project_steps`(`id`) ON DELETE CASCADE,

    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_type_priority` (`type`, `priority`),
    INDEX `idx_project` (`project_id`),
    INDEX `idx_created` (`created_at`),
    INDEX `idx_notifications_inbox` (`user_id`, `is_read`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 9. COMMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `comments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,

    -- การอ้างอิง
    `project_id` INT NOT NULL,
    `step_id` INT NULL COMMENT 'NULL = comment ในโครงการ, มีค่า = comment ในขั้นตอน',

    -- เนื้อหา
    `comment_text` TEXT NOT NULL,
    `comment_type` ENUM('general', 'approval', 'concern', 'suggestion', 'question',
                        'instruction', 'feedback', 'blocker', 'clarification', 'escalation') DEFAULT 'general',

    `priority` ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
    `visibility` ENUM('public', 'department', 'management') DEFAULT 'public',

    -- ผู้แสดงความเห็น
    `user_id` INT NOT NULL,

    -- การ Reply
    `parent_comment_id` INT NULL COMMENT 'Reply to another comment',

    -- การ Mention
    `mentions` JSON COMMENT 'Array of user IDs that were mentioned',

    -- ไฟล์แนบ
    `attachments` JSON COMMENT 'Array of attachment objects',

    -- การดำเนินการ
    `action_required` BOOLEAN DEFAULT FALSE,
    `due_date` DATE NULL COMMENT 'กำหนดเสร็จ (ถ้า action_required = true)',
    `assigned_to` INT NULL COMMENT 'มอบหมายให้ใคร',

    -- Tags
    `tags` JSON COMMENT 'Array of tags for categorization',

    -- สถานะ
    `is_resolved` BOOLEAN DEFAULT FALSE,
    `resolved_by` INT NULL,
    `resolved_at` TIMESTAMP NULL,

    -- การแก้ไข
    `is_edited` BOOLEAN DEFAULT FALSE,
    `edited_at` TIMESTAMP NULL,
    `original_text` TEXT COMMENT 'เก็บข้อความเดิมก่อนแก้ไข',

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`step_id`) REFERENCES `project_steps`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`parent_comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`),
    FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`),

    INDEX `idx_project_step` (`project_id`, `step_id`),
    INDEX `idx_user_type` (`user_id`, `comment_type`),
    INDEX `idx_parent` (`parent_comment_id`),
    INDEX `idx_created` (`created_at`),
    INDEX `idx_comments_thread` (`project_id`, `step_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 10. COMMENT REACTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `comment_reactions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `comment_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `reaction_type` ENUM('like', 'love', 'agree', 'disagree', 'helpful') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,

    UNIQUE KEY `uk_comment_user_reaction` (`comment_id`, `user_id`),
    INDEX `idx_comment_type` (`comment_id`, `reaction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 11. EXTENSION REQUESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `extension_requests` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `project_id` INT NOT NULL,
    `step_id` INT NOT NULL,

    -- รายละเอียดการขอขยาย
    `additional_days` INT NOT NULL COMMENT 'จำนวนวันที่ขอขยาย',
    `reason` TEXT NOT NULL COMMENT 'เหตุผลในการขอขยาย',
    `justification` TEXT COMMENT 'เหตุผลประกอบ',

    -- ผู้ขอ
    `requested_by` INT NOT NULL,
    `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- การอนุมัติ
    `approval_level` ENUM('supervisor', 'department_head', 'executive') NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',

    `approved_by` INT NULL,
    `approved_at` TIMESTAMP NULL,
    `approval_notes` TEXT,

    -- ไฟล์แนบประกอบการขอ
    `attachments` JSON,

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`step_id`) REFERENCES `project_steps`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`),
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`),

    INDEX `idx_project_step` (`project_id`, `step_id`),
    INDEX `idx_status_approval` (`status`, `approval_level`),
    INDEX `idx_requested` (`requested_by`, `requested_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 12. FILE ATTACHMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `file_attachments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,

    -- การอ้างอิง
    `entity_type` ENUM('project', 'step', 'comment', 'extension') NOT NULL,
    `entity_id` INT NOT NULL COMMENT 'ID ของ entity ที่แนบไฟล์',

    -- ข้อมูลไฟล์
    `original_filename` VARCHAR(255) NOT NULL,
    `stored_filename` VARCHAR(255) NOT NULL COMMENT 'ชื่อไฟล์ที่เก็บจริง',
    `file_path` VARCHAR(500) NOT NULL,
    `file_size` BIGINT NOT NULL COMMENT 'ขนาดไฟล์ (bytes)',
    `mime_type` VARCHAR(100) NOT NULL,
    `file_hash` VARCHAR(64) COMMENT 'SHA-256 hash for integrity',

    -- การจัดหมวดหมู่
    `category` ENUM('document', 'image', 'contract', 'report', 'evidence', 'other') DEFAULT 'document',
    `description` TEXT,

    -- ความปลอดภัย
    `is_public` BOOLEAN DEFAULT FALSE,
    `access_level` ENUM('public', 'department', 'admin_only') DEFAULT 'department',

    -- ผู้อัพโหลด
    `uploaded_by` INT NOT NULL,
    `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- การลบ
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `deleted_at` TIMESTAMP NULL,
    `deleted_by` INT NULL,

    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`),
    FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`),

    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_uploader` (`uploaded_by`),
    INDEX `idx_category` (`category`),
    INDEX `idx_hash` (`file_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 13. AUDIT LOGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,

    -- การดำเนินการ
    `action` ENUM('create', 'update', 'delete', 'login', 'logout', 'approve', 'reject',
                  'comment', 'extend', 'complete', 'export') NOT NULL,
    `entity_type` ENUM('project', 'step', 'comment', 'user', 'sla', 'notification') NOT NULL,
    `entity_id` INT NOT NULL,

    -- ผู้ดำเนินการ
    `user_id` INT NULL COMMENT 'NULL for system actions',

    -- รายละเอียด
    `description` TEXT,
    `old_values` JSON COMMENT 'ค่าเดิมก่อนแก้ไข',
    `new_values` JSON COMMENT 'ค่าใหม่หลังแก้ไข',

    -- ข้อมูลเพิ่มเติม
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `session_id` VARCHAR(255),

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),

    INDEX `idx_action_entity` (`action`, `entity_type`, `entity_id`),
    INDEX `idx_user_action` (`user_id`, `action`),
    INDEX `idx_created` (`created_at`),
    INDEX `idx_entity_created` (`entity_type`, `entity_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 14. HOLIDAYS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `holidays` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `holiday_date` DATE NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('national', 'religious', 'royal', 'substitute', 'local') DEFAULT 'national',
    `is_recurring` BOOLEAN DEFAULT FALSE COMMENT 'วันหยุดประจำปี',
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_holiday_date` (`holiday_date`),
    INDEX `idx_date_type` (`holiday_date`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 15. SYSTEM CONFIGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `system_configs` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `config_key` VARCHAR(100) NOT NULL UNIQUE,
    `config_value` TEXT NOT NULL,
    `data_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    `category` ENUM('general', 'security', 'notification', 'sla', 'backup') DEFAULT 'general',
    `description` TEXT,
    `is_encrypted` BOOLEAN DEFAULT FALSE,

    `updated_by` INT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),

    INDEX `idx_category` (`category`),
    INDEX `idx_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VIEWS
-- ========================================

-- Project Overview with Department Info
CREATE OR REPLACE VIEW `v_projects_overview` AS
SELECT
    p.*,
    d.name as department_name,
    d.code as department_code,
    u.full_name as created_by_name,
    (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id) as total_steps,
    (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'completed') as completed_steps,
    (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'delayed') as delayed_steps,
    ROUND((SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'completed') * 100.0 /
          NULLIF((SELECT COUNT(*) FROM project_steps WHERE project_id = p.id), 0), 2) as progress_percentage
FROM projects p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN users u ON p.created_by = u.id
WHERE p.is_deleted = FALSE;

-- Delayed Projects View
CREATE OR REPLACE VIEW `v_delayed_projects` AS
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
AND p.is_deleted = FALSE
ORDER BY ps.delay_days DESC;

-- User Notifications Summary
CREATE OR REPLACE VIEW `v_user_notifications` AS
SELECT
    n.*,
    p.name as project_name,
    p.project_code,
    ps.step_name
FROM notifications n
LEFT JOIN projects p ON n.project_id = p.id
LEFT JOIN project_steps ps ON n.step_id = ps.id
WHERE n.expires_at IS NULL OR n.expires_at > NOW()
ORDER BY n.created_at DESC;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- END OF SCHEMA
-- ========================================
