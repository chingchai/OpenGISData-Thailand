-- ========================================
-- Seed Data - ระบบจัดการโครงการจัดซื้อจัดจ้าง
-- เทศบาลตำบลหัวทะเล
-- Database: MariaDB/MySQL
-- ========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 1. INSERT DEPARTMENTS (7 กอง/สำนัก)
-- ========================================
INSERT INTO `departments` (`id`, `code`, `name`, `name_en`, `description`, `is_active`) VALUES
(1, 'TREASURY', 'กองคลัง', 'Treasury Department', 'รับผิดชอบด้านการเงิน บัญชี งบประมาณ และพัสดุ', TRUE),
(2, 'ENGINEERING', 'กองช่าง', 'Engineering Department', 'รับผิดชอบด้านโครงสร้างพื้นฐาน การก่อสร้าง และซ่อมบำรุง', TRUE),
(3, 'EDUCATION', 'กองการศึกษา', 'Education Department', 'รับผิดชอบด้านการศึกษา กีฬา และนันทนาการ', TRUE),
(4, 'HEALTH', 'กองสาธารณสุขและสิ่งแวดล้อม', 'Health and Environment Department', 'รับผิดชอบด้านสาธารณสุข สุขาภิบาล และสิ่งแวดล้อม', TRUE),
(5, 'MUNICIPAL', 'สำนักปลัด', 'Municipal Office', 'รับผิดชอบด้านบริหารทั่วไป กฎหมาย และประชาสัมพันธ์', TRUE),
(6, 'STRATEGY', 'กองวิชาการและแผนงาน', 'Strategy and Planning Department', 'รับผิดชอบด้านวิชาการ วางแผน และติดตามประเมินผล', TRUE),
(7, 'CLERK', 'กองคลัง', 'Clerk Department', 'รับผิดชอบด้านธุรการ สารบรรณ และบริหารงานบุคคล', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ========================================
-- 2. INSERT DEFAULT USERS
-- ========================================
-- Password: 'password123' (temporary - will be replaced with bcrypt hash)
-- For MVP testing, we use a simple password

-- เจ้าหน้าที่กอง (1 คนต่อกอง)
INSERT INTO `users` (`username`, `password_hash`, `full_name`, `email`, `role`, `department_id`, `position`, `is_active`) VALUES
('staff_treasury', '$2b$10$YourHashedPasswordHere', 'นางสาวสมหญิง ใจดี', 'treasury@huatalay.go.th', 'staff', 1, 'เจ้าหน้าที่พัสดุ', TRUE),
('staff_engineering', '$2b$10$YourHashedPasswordHere', 'นายสมชาย ช่างคิด', 'engineering@huatalay.go.th', 'staff', 2, 'วิศวกร', TRUE),
('staff_education', '$2b$10$YourHashedPasswordHere', 'นางสมศรี รักการศึกษา', 'education@huatalay.go.th', 'staff', 3, 'นักวิชาการศึกษา', TRUE),
('staff_health', '$2b$10$YourHashedPasswordHere', 'นายแพทย์สมศักดิ์ รักษา', 'health@huatalay.go.th', 'staff', 4, 'เจ้าพนักงานสาธารณสุข', TRUE),
('staff_municipal', '$2b$10$YourHashedPasswordHere', 'นายสมพร บริหาร', 'municipal@huatalay.go.th', 'staff', 5, 'นักบริหารงานทั่วไป', TRUE),
('staff_strategy', '$2b$10$YourHashedPasswordHere', 'นางสาวสมฤทัย วางแผน', 'strategy@huatalay.go.th', 'staff', 6, 'นักวิเคราะห์นโยบาย', TRUE),
('staff_clerk', '$2b$10$YourHashedPasswordHere', 'นายสมบูรณ์ จัดการ', 'clerk@huatalay.go.th', 'staff', 7, 'เจ้าหน้าที่ธุรการ', TRUE)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- Admin (เข้าถึงทุกกอง)
INSERT INTO `users` (`username`, `password_hash`, `full_name`, `email`, `role`, `department_id`, `position`, `is_active`) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'นายผู้ดูแลระบบ', 'admin@huatalay.go.th', 'admin', NULL, 'ผู้ดูแลระบบ', TRUE),
('admin_treasury', '$2b$10$YourHashedPasswordHere', 'นางสาวผู้ช่วยผู้ดูแล', 'admin2@huatalay.go.th', 'admin', 1, 'ผู้ช่วยผู้ดูแลระบบ', TRUE)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- ผู้บริหาร (ดูทุกกอง, Comment only)
INSERT INTO `users` (`username`, `password_hash`, `full_name`, `email`, `role`, `department_id`, `position`, `is_active`) VALUES
('executive', '$2b$10$YourHashedPasswordHere', 'นายปลัดเทศบาล', 'executive@huatalay.go.th', 'executive', NULL, 'ปลัดเทศบาล', TRUE),
('executive_mayor', '$2b$10$YourHashedPasswordHere', 'นายกเทศมนตรี', 'mayor@huatalay.go.th', 'executive', NULL, 'นายกเทศมนตรี', TRUE)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- ========================================
-- 3. INSERT DEFAULT SLA CONFIGURATION
-- ========================================

-- วิธีประกาศเชิญชวนทั่วไป (7 ขั้นตอน)
INSERT INTO `sla_config` (`procurement_method`, `step_number`, `step_name`, `standard_days`, `warning_days`, `minimum_days`, `maximum_days`, `is_critical_path`, `allow_weekends`, `updated_by`) VALUES
('public_invitation', 1, 'จัดทำร่างขอบเขตงาน (TOR)', 7, 3, 3, 14, FALSE, FALSE, 1),
('public_invitation', 2, 'เสนอขออนุมัติหลักการ', 5, 2, 3, 10, FALSE, FALSE, 1),
('public_invitation', 3, 'ประกาศเชิญชวน', 21, 3, 14, 30, TRUE, TRUE, 1),
('public_invitation', 4, 'รับซองข้อเสนอ', 1, 0, 1, 1, FALSE, FALSE, 1),
('public_invitation', 5, 'เปิดซองและพิจารณาข้อเสนอ', 7, 2, 5, 14, TRUE, FALSE, 1),
('public_invitation', 6, 'ประกาศผลผู้ชนะ', 3, 1, 1, 5, FALSE, FALSE, 1),
('public_invitation', 7, 'ทำสัญญาหรือข้อตกลง', 14, 3, 7, 21, TRUE, FALSE, 1)
ON DUPLICATE KEY UPDATE `standard_days` = VALUES(`standard_days`);

-- วิธีคัดเลือก (8 ขั้นตอน)
INSERT INTO `sla_config` (`procurement_method`, `step_number`, `step_name`, `standard_days`, `warning_days`, `minimum_days`, `maximum_days`, `is_critical_path`, `allow_weekends`, `updated_by`) VALUES
('selection', 1, 'จัดทำร่างขอบเขตงาน (TOR)', 7, 3, 3, 14, FALSE, FALSE, 1),
('selection', 2, 'ขออนุมัติหลักการ', 5, 2, 3, 10, FALSE, FALSE, 1),
('selection', 3, 'คัดเลือกผู้มีคุณสมบัติเหมาะสม', 5, 2, 3, 7, FALSE, FALSE, 1),
('selection', 4, 'ขอเอกสารเสนอราคา', 14, 3, 10, 21, TRUE, TRUE, 1),
('selection', 5, 'เปิดซองและพิจารณาข้อเสนอ', 5, 2, 3, 10, TRUE, FALSE, 1),
('selection', 6, 'เจรจาต่อรองราคา (ถ้าจำเป็น)', 3, 1, 1, 7, FALSE, FALSE, 1),
('selection', 7, 'อนุมัติผลการคัดเลือก', 3, 1, 1, 5, FALSE, FALSE, 1),
('selection', 8, 'ทำสัญญาหรือข้อตกลง', 14, 3, 7, 21, TRUE, FALSE, 1)
ON DUPLICATE KEY UPDATE `standard_days` = VALUES(`standard_days`);

-- วิธีเฉพาะเจาะจง (10 ขั้นตอน)
INSERT INTO `sla_config` (`procurement_method`, `step_number`, `step_name`, `standard_days`, `warning_days`, `minimum_days`, `maximum_days`, `is_critical_path`, `allow_weekends`, `updated_by`) VALUES
('specific', 1, 'จัดทำร่างขอบเขตงาน (TOR)', 7, 3, 3, 14, FALSE, FALSE, 1),
('specific', 2, 'คำนวณราคากลาง', 5, 2, 3, 10, FALSE, FALSE, 1),
('specific', 3, 'เสนอขออนุมัติหลักการ', 5, 2, 3, 10, FALSE, FALSE, 1),
('specific', 4, 'ประกาศเชิญชวน', 21, 3, 14, 30, TRUE, TRUE, 1),
('specific', 5, 'รับซองข้อเสนอ', 1, 0, 1, 1, FALSE, FALSE, 1),
('specific', 6, 'เปิดซองและพิจารณาคุณสมบัติ', 7, 2, 5, 14, TRUE, FALSE, 1),
('specific', 7, 'คัดเลือกผู้ที่มีคุณสมบัติ', 3, 1, 1, 7, FALSE, FALSE, 1),
('specific', 8, 'เจรจาต่อรองราคา (ถ้าจำเป็น)', 5, 2, 3, 10, FALSE, FALSE, 1),
('specific', 9, 'ประกาศผลการคัดเลือก', 3, 1, 1, 5, FALSE, FALSE, 1),
('specific', 10, 'ทำสัญญาหรือข้อตกลง', 14, 3, 7, 21, TRUE, FALSE, 1)
ON DUPLICATE KEY UPDATE `standard_days` = VALUES(`standard_days`);

-- ========================================
-- 4. INSERT SAMPLE PROJECTS (สำหรับทดสอบ)
-- ========================================

-- โครงการตัวอย่าง กองช่าง
INSERT INTO `projects` (`project_code`, `name`, `description`, `department_id`, `procurement_method`, `budget`, `budget_year`, `start_date`, `expected_end_date`, `status`, `priority`, `urgency_level`, `contractor_type`, `created_by`) VALUES
('PR-2567-002-001', 'ปรับปรุงถนนภายในตำบลหัวทะเล สายที่ 1', 'โครงการปรับปรุงถนนคอนกรีตเสริมเหล็กภายในตำบล ความยาว 1.5 กม. เพื่ออำนวยความสะดวกแก่ประชาชน', 2, 'public_invitation', 2500000.00, 2567, '2024-01-15', '2024-04-15', 'in_progress', 'high', 'urgent', 'construction', 2),
('PR-2567-002-002', 'ซ่อมแซมสะพานข้ามคลอง', 'โครงการซ่อมแซมสะพานคอนกรีตเสริมเหล็กที่ชำรุดเสียหาย เพื่อความปลอดภัย', 2, 'selection', 850000.00, 2567, '2024-02-01', '2024-03-30', 'in_progress', 'critical', 'critical', 'construction', 2)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- โครงการตัวอย่าง กองการศึกษา
INSERT INTO `projects` (`project_code`, `name`, `description`, `department_id`, `procurement_method`, `budget`, `budget_year`, `start_date`, `expected_end_date`, `status`, `priority`, `contractor_type`, `created_by`) VALUES
('PR-2567-003-001', 'จัดซื้อเครื่องคอมพิวเตอร์โรงเรียน', 'จัดซื้อเครื่องคอมพิวเตอร์สำหรับห้องเรียนคอมพิวเตอร์ จำนวน 30 เครื่อง พร้อมอุปกรณ์', 3, 'specific', 450000.00, 2567, '2024-01-10', '2024-02-28', 'completed', 'normal', 'normal', 'goods', 3),
('PR-2567-003-002', 'จ้างเหมาบริการทำความสะอาดโรงเรียน', 'จ้างเหมาบริการทำความสะอาดโรงเรียนในสังกัด ระยะเวลา 1 ปี', 3, 'selection', 180000.00, 2567, '2024-03-01', '2024-04-15', 'in_progress', 'normal', 'normal', 'services', 3)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- โครงการตัวอย่าง กองสาธารณสุข
INSERT INTO `projects` (`project_code`, `name`, `description`, `department_id`, `procurement_method`, `budget`, `budget_year`, `start_date`, `expected_end_date`, `status`, `priority`, `urgency_level`, `contractor_type`, `created_by`) VALUES
('PR-2567-004-001', 'จัดซื้อวัคซีนป้องกันโรคพิษสุนัขบ้า', 'จัดซื้อวัคซีนป้องกันโรคพิษสุนัขบ้าสำหรับสัตว์เลี้ยงในชุมชน', 4, 'specific', 120000.00, 2567, '2024-02-15', '2024-03-15', 'delayed', 'high', 'urgent', 'goods', 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ========================================
-- 5. INSERT SAMPLE PROJECT STEPS
-- ========================================

-- ขั้นตอนโครงการ PR-2567-002-001 (7 ขั้นตอน - วิธีประกาศเชิญชวน)
INSERT INTO `project_steps` (`project_id`, `step_number`, `step_name`, `description`, `sla_days`, `planned_start_date`, `planned_end_date`, `actual_start_date`, `actual_end_date`, `status`, `is_critical_path`) VALUES
(1, 1, 'จัดทำร่างขอบเขตงาน (TOR)', 'จัดทำเอกสารรายละเอียดคุณลักษณะเฉพาะและขอบเขตของงาน', 7, '2024-01-15', '2024-01-22', '2024-01-15', '2024-01-21', 'completed', FALSE),
(1, 2, 'เสนอขออนุมัติหลักการ', 'เสนอผู้มีอำนาจพิจารณาอนุมัติหลักการในการจัดซื้อจัดจ้าง', 5, '2024-01-23', '2024-01-28', '2024-01-22', '2024-01-27', 'completed', FALSE),
(1, 3, 'ประกาศเชิญชวน', 'ประกาศเชิญชวนผู้ประกอบการเข้ายื่นข้อเสนอ', 21, '2024-01-29', '2024-02-19', '2024-01-28', NULL, 'in_progress', TRUE),
(1, 4, 'รับซองข้อเสนอ', 'รับซองข้อเสนอจากผู้ประกอบการ', 1, '2024-02-20', '2024-02-20', NULL, NULL, 'pending', FALSE),
(1, 5, 'เปิดซองและพิจารณาข้อเสนอ', 'เปิดซองข้อเสนอและพิจารณาผลการประกวดราคา', 7, '2024-02-21', '2024-02-28', NULL, NULL, 'pending', TRUE),
(1, 6, 'ประกาศผลผู้ชนะ', 'ประกาศรายชื่อผู้ชนะการเสนอราคา', 3, '2024-03-01', '2024-03-04', NULL, NULL, 'pending', FALSE),
(1, 7, 'ทำสัญญาหรือข้อตกลง', 'ดำเนินการทำสัญญาจ้างหรือข้อตกลง', 14, '2024-03-05', '2024-03-19', NULL, NULL, 'pending', TRUE)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- ========================================
-- 6. INSERT SAMPLE COMMENTS
-- ========================================

INSERT INTO `comments` (`project_id`, `step_id`, `user_id`, `comment_text`, `comment_type`, `priority`, `visibility`) VALUES
(1, NULL, 11, 'โครงการนี้เป็นความเร่งด่วน กรุณาเร่งรัดดำเนินการให้แล้วเสร็จตามกำหนดเวลา', 'instruction', 'urgent', 'public'),
(1, 3, 11, 'ขอให้ตรวจสอบคุณสมบัติผู้ประกอบการให้ละเอียดถี่ถ้วน และดำเนินการตามระเบียบพัสดุอย่างเคร่งครัด', 'concern', 'high', 'public')
ON DUPLICATE KEY UPDATE `comment_text` = VALUES(`comment_text`);

-- ========================================
-- 7. INSERT SAMPLE NOTIFICATIONS
-- ========================================

INSERT INTO `notifications` (`user_id`, `project_id`, `step_id`, `type`, `title`, `message`, `priority`, `is_read`) VALUES
(2, 1, 3, 'sla_warning', 'เตือน: ขั้นตอนใกล้เกินกำหนด', 'โครงการ "ปรับปรุงถนนภายในตำบลหัวทะเล" ขั้นตอน "ประกาศเชิญชวน" เหลือเวลาอีก 3 วัน กรุณาเร่งดำเนินการ', 'high', FALSE),
(2, NULL, NULL, 'comment_added', 'ความเห็นใหม่จากผู้บริหาร', 'ปลัดเทศบาลได้แสดงความเห็นในโครงการของคุณ กรุณาตรวจสอบ', 'medium', FALSE)
ON DUPLICATE KEY UPDATE `message` = VALUES(`message`);

-- ========================================
-- 8. INSERT SAMPLE HOLIDAYS (วันหยุดราชการ 2567)
-- ========================================

INSERT INTO `holidays` (`holiday_date`, `name`, `type`, `is_recurring`, `description`, `is_active`) VALUES
('2024-01-01', 'วันขึ้นปีใหม่', 'national', TRUE, 'วันหยุดวันขึ้นปีใหม่สากล', TRUE),
('2024-02-24', 'วันมาฆบูชา', 'religious', FALSE, 'วันสำคัญทางพระพุทธศาสนา', TRUE),
('2024-04-06', 'วันจักรี', 'national', TRUE, 'วันคล้ายวันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช และวันที่ระลึกมหาจักรีบรมราชวงศ์', TRUE),
('2024-04-13', 'วันสงกรานต์', 'national', TRUE, 'วันขึ้นปีใหม่ไทย', TRUE),
('2024-04-14', 'วันสงกรานต์ (วันเถลิงศก)', 'national', TRUE, 'วันสงกรานต์', TRUE),
('2024-04-15', 'วันสงกรานต์ (วันเถลิงศก)', 'national', TRUE, 'วันสงกรานต์', TRUE),
('2024-05-01', 'วันแรงงานแห่งชาติ', 'national', TRUE, 'วันแรงงานสากล', TRUE),
('2024-05-04', 'วันฉัตรมงคล', 'royal', TRUE, 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', TRUE),
('2024-05-22', 'วันวิสาขบูชา', 'religious', FALSE, 'วันสำคัญทางพระพุทธศาสนา', TRUE),
('2024-07-20', 'วันอาสาฬหบูชา', 'religious', FALSE, 'วันสำคัญทางพระพุทธศาสนา', TRUE),
('2024-07-28', 'วันเข้าพรรษา', 'religious', FALSE, 'วันเข้าพรรษา', TRUE),
('2024-07-28', 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', 'royal', TRUE, 'วันคล้ายวันพระบรมราชสมภพพระบาทสมเด็จพระเจ้าอยู่หัว', TRUE),
('2024-08-12', 'วันแม่แห่งชาติ', 'national', TRUE, 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง', TRUE),
('2024-10-13', 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร', 'royal', TRUE, 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช', TRUE),
('2024-10-23', 'วันปิยมหาราช', 'royal', TRUE, 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว', TRUE),
('2024-12-05', 'วันพ่อแห่งชาติ', 'national', TRUE, 'วันคล้ายวันพระบรมราชสมภพพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร', TRUE),
('2024-12-10', 'วันรัฐธรรมนูญ', 'national', TRUE, 'วันรัฐธรรมนูญแห่งราชอาณาจักรไทย', TRUE),
('2024-12-31', 'วันสิ้นปี', 'national', TRUE, 'วันหยุดวันสิ้นปี', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ========================================
-- 9. INSERT SYSTEM CONFIGS
-- ========================================

INSERT INTO `system_configs` (`config_key`, `config_value`, `data_type`, `category`, `description`, `updated_by`) VALUES
('app.name', 'ระบบจัดการโครงการจัดซื้อจัดจ้าง', 'string', 'general', 'ชื่อระบบ', 1),
('app.version', '1.0.0-MVP', 'string', 'general', 'เวอร์ชันระบบ', 1),
('sla.default_warning_days', '3', 'number', 'sla', 'จำนวนวันเตือนล่วงหน้าเริ่มต้น', 1),
('sla.business_days_only', 'true', 'boolean', 'sla', 'นับเฉพาะวันทำการหรือไม่', 1),
('notification.enable_email', 'false', 'boolean', 'notification', 'เปิดใช้งานการแจ้งเตือนทางอีเมล', 1),
('notification.enable_line', 'false', 'boolean', 'notification', 'เปิดใช้งานการแจ้งเตือนทาง LINE', 1),
('security.session_timeout', '1440', 'number', 'security', 'Session timeout (นาที)', 1),
('security.max_login_attempts', '5', 'number', 'security', 'จำนวนครั้งล็อกอินผิดสูงสุด', 1)
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- หมายเหตุ: รหัสผ่านที่ hash จริงจะต้องสร้างผ่าน bcrypt
-- ในการ deploy จริง ต้องรันคำสั่ง:
-- UPDATE users SET password_hash = bcrypt_hash('password123', 10);
-- ========================================
