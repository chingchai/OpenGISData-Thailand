-- Seed Data - ระบบจัดการโครงการจัดซื้อจัดจ้าง
-- ข้อมูลเริ่มต้นสำหรับการทดสอบระบบ

-- ========================================
-- 1. INSERT DEPARTMENTS (7 กอง/สำนัก)
-- ========================================
INSERT INTO departments (id, code, name, name_en, description, active) VALUES
(1, 'TREASURY', 'กองคลัง', 'Treasury Department', 'รับผิดชอบด้านการเงิน บัญชี งบประมาณ และพัสดุ', 1),
(2, 'ENGINEERING', 'กองช่าง', 'Engineering Department', 'รับผิดชอบด้านโครงสร้างพื้นฐาน การก่อสร้าง และซ่อมบำรุง', 1),
(3, 'EDUCATION', 'กองการศึกษา', 'Education Department', 'รับผิดชอบด้านการศึกษา กีฬา และนันทนาการ', 1),
(4, 'HEALTH', 'กองสาธารณสุขและสิ่งแวดล้อม', 'Health and Environment Department', 'รับผิดชอบด้านสาธารณสุข สุขาภิบาล และสิ่งแวดล้อม', 1),
(5, 'MUNICIPAL', 'สำนักปลัด', 'Municipal Office', 'รับผิดชอบด้านบริหารทั่วไป กฎหมาย และประชาสัมพันธ์', 1),
(6, 'STRATEGY', 'กองวิชาการและแผนงาน', 'Strategy and Planning Department', 'รับผิดชอบด้านวิชาการ วางแผน และติดตามประเมินผล', 1),
(7, 'CLERK', 'กองคลัง', 'Clerk Department', 'รับผิดชอบด้านธุรการ สารบรรณ และบริหารงานบุคคล', 1);

-- ========================================
-- 2. INSERT DEFAULT USERS
-- ========================================
-- Password: 'password123' (hashed with bcrypt)
-- Hash: $2b$10$rBV2KJZ6zJZ6XxX6XxX6XeX6XxX6XxX6XxX6XxX6XxX6XxX6XxX6Xx

-- เจ้าหน้าที่กอง (1 คนต่อกอง)
INSERT INTO users (username, password, full_name, email, role, department_id, active) VALUES
('staff_treasury', '$2b$10$YourHashedPasswordHere', 'นางสาวสมหญิง ใจดี', 'treasury@huatalay.go.th', 'staff', 1, 1),
('staff_engineering', '$2b$10$YourHashedPasswordHere', 'นายสมชาย ช่างคิด', 'engineering@huatalay.go.th', 'staff', 2, 1),
('staff_education', '$2b$10$YourHashedPasswordHere', 'นางสมศรี รักการศึกษา', 'education@huatalay.go.th', 'staff', 3, 1),
('staff_health', '$2b$10$YourHashedPasswordHere', 'นายแพทย์สมศักดิ์ รักษา', 'health@huatalay.go.th', 'staff', 4, 1),
('staff_municipal', '$2b$10$YourHashedPasswordHere', 'นายสมพร บริหาร', 'municipal@huatalay.go.th', 'staff', 5, 1),
('staff_strategy', '$2b$10$YourHashedPasswordHere', 'นางสาวสมฤทัย วางแผน', 'strategy@huatalay.go.th', 'staff', 6, 1),
('staff_clerk', '$2b$10$YourHashedPasswordHere', 'นายสมบูรณ์ จัดการ', 'clerk@huatalay.go.th', 'staff', 7, 1);

-- Admin (เข้าถึงทุกกอง)
INSERT INTO users (username, password, full_name, email, role, department_id, active) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'นายผู้ดูแลระบบ', 'admin@huatalay.go.th', 'admin', NULL, 1),
('admin_treasury', '$2b$10$YourHashedPasswordHere', 'นางสาวผู้ช่วยผู้ดูแล', 'admin2@huatalay.go.th', 'admin', 1, 1);

-- ผู้บริหาร (ดูทุกกอง, Comment only)
INSERT INTO users (username, password, full_name, email, role, department_id, active) VALUES
('executive', '$2b$10$YourHashedPasswordHere', 'นายปลัดเทศบาล', 'executive@huatalay.go.th', 'executive', NULL, 1),
('executive_mayor', '$2b$10$YourHashedPasswordHere', 'นายกเทศมนตรี', 'mayor@huatalay.go.th', 'executive', NULL, 1);

-- ========================================
-- 3. INSERT DEFAULT SLA CONFIGURATION
-- ========================================

-- วิธีประกาศเชิญชวนทั่วไป (7 ขั้นตอน)
INSERT INTO sla_config (procurement_method, step_number, step_name, standard_days, warning_days, minimum_days, maximum_days, is_critical, allow_weekends) VALUES
('public_invitation', 1, 'จัดทำร่างขอบเขตงาน (TOR)', 7, 3, 3, 14, 0, 0),
('public_invitation', 2, 'เสนอขออนุมัติหลักการ', 5, 2, 3, 10, 0, 0),
('public_invitation', 3, 'ประกาศเชิญชวน', 21, 3, 14, 30, 1, 1),
('public_invitation', 4, 'รับซองข้อเสนอ', 1, 0, 1, 1, 0, 0),
('public_invitation', 5, 'เปิดซองและพิจารณาข้อเสนอ', 7, 2, 5, 14, 1, 0),
('public_invitation', 6, 'ประกาศผลผู้ชนะ', 3, 1, 1, 5, 0, 0),
('public_invitation', 7, 'ทำสัญญาหรือข้อตกลง', 14, 3, 7, 21, 1, 0);

-- วิธีคัดเลือก (8 ขั้นตอน)
INSERT INTO sla_config (procurement_method, step_number, step_name, standard_days, warning_days, minimum_days, maximum_days, is_critical, allow_weekends) VALUES
('selection', 1, 'จัดทำร่างขอบเขตงาน (TOR)', 7, 3, 3, 14, 0, 0),
('selection', 2, 'ขออนุมัติหลักการ', 5, 2, 3, 10, 0, 0),
('selection', 3, 'คัดเลือกผู้มีคุณสมบัติเหมาะสม', 5, 2, 3, 7, 0, 0),
('selection', 4, 'ขอเอกสารเสนอราคา', 14, 3, 10, 21, 1, 1),
('selection', 5, 'เปิดซองและพิจารณาข้อเสนอ', 5, 2, 3, 10, 1, 0),
('selection', 6, 'เจรจาต่อรองราคา (ถ้าจำเป็น)', 3, 1, 1, 7, 0, 0),
('selection', 7, 'อนุมัติผลการคัดเลือก', 3, 1, 1, 5, 0, 0),
('selection', 8, 'ทำสัญญาหรือข้อตกลง', 14, 3, 7, 21, 1, 0);

-- วิธีเฉพาะเจาะจง (10 ขั้นตอน)
INSERT INTO sla_config (procurement_method, step_number, step_name, standard_days, warning_days, minimum_days, maximum_days, is_critical, allow_weekends) VALUES
('specific', 1, 'จัดทำร่างขอบเขตงาน (TOR)', 7, 3, 3, 14, 0, 0),
('specific', 2, 'คำนวณราคากลาง', 5, 2, 3, 10, 0, 0),
('specific', 3, 'เสนอขออนุมัติหลักการ', 5, 2, 3, 10, 0, 0),
('specific', 4, 'ประกาศเชิญชวน', 21, 3, 14, 30, 1, 1),
('specific', 5, 'รับซองข้อเสนอ', 1, 0, 1, 1, 0, 0),
('specific', 6, 'เปิดซองและพิจารณาคุณสมบัติ', 7, 2, 5, 14, 1, 0),
('specific', 7, 'คัดเลือกผู้ที่มีคุณสมบัติ', 3, 1, 1, 7, 0, 0),
('specific', 8, 'เจรจาต่อรองราคา (ถ้าจำเป็น)', 5, 2, 3, 10, 0, 0),
('specific', 9, 'ประกาศผลการคัดเลือก', 3, 1, 1, 5, 0, 0),
('specific', 10, 'ทำสัญญาหรือข้อตกลง', 14, 3, 7, 21, 1, 0);

-- ========================================
-- 4. INSERT SAMPLE PROJECTS (สำหรับทดสอบ)
-- ========================================

-- โครงการตัวอย่าง กองช่าง
INSERT INTO projects (project_code, name, description, department_id, procurement_method, budget, start_date, expected_end_date, status, urgency_level, contractor_type, created_by) VALUES
('PR-2567-002-001', 'ปรับปรุงถนนภายในตำบลหัวทะเล สายที่ 1', 'โครงการปรับปรุงถนนคอนกรีตเสริมเหล็กภายในตำบล ความยาว 1.5 กม.', 2, 'public_invitation', 2500000.00, '2024-01-15', '2024-04-15', 'in_progress', 'urgent', 'construction', 2),
('PR-2567-002-002', 'ซ่อมแซมสะพานข้ามคลอง', 'โครงการซ่อมแซมสะพานคอนกรีตเสริมเหล็กที่ชำรุด', 2, 'selection', 850000.00, '2024-02-01', '2024-03-30', 'in_progress', 'critical', 'construction', 2);

-- โครงการตัวอย่าง กองการศึกษา
INSERT INTO projects (project_code, name, description, department_id, procurement_method, budget, start_date, expected_end_date, status, urgency_level, contractor_type, created_by) VALUES
('PR-2567-003-001', 'จัดซื้อเครื่องคอมพิวเตอร์โรงเรียน', 'จัดซื้อเครื่องคอมพิวเตอร์สำหรับห้องเรียน จำนวน 30 เครื่อง', 3, 'specific', 450000.00, '2024-01-10', '2024-02-28', 'completed', 'normal', 'goods', 3),
('PR-2567-003-002', 'จ้างเหมาบริการทำความสะอาดโรงเรียน', 'จ้างเหมาบริการทำความสะอาดโรงเรียนในสังกัด 1 ปี', 3, 'selection', 180000.00, '2024-03-01', '2024-04-15', 'in_progress', 'normal', 'services', 3);

-- โครงการตัวอย่าง กองสาธารณสุข
INSERT INTO projects (project_code, name, description, department_id, procurement_method, budget, start_date, expected_end_date, status, urgency_level, contractor_type, created_by) VALUES
('PR-2567-004-001', 'จัดซื้อวัคซีนป้องกันโรคพิษสุนัขบ้า', 'จัดซื้อวัคซีนสำหรับสัตว์เลี้ยงในชุมชน', 4, 'specific', 120000.00, '2024-02-15', '2024-03-15', 'delayed', 'urgent', 'goods', 4);

-- ========================================
-- 5. INSERT SAMPLE PROJECT STEPS
-- ========================================

-- ขั้นตอนโครงการ PR-2567-002-001 (7 ขั้นตอน - วิธีประกาศเชิญชวน)
INSERT INTO project_steps (project_id, step_number, step_name, description, sla_days, planned_start, planned_end, actual_start, actual_end, status, is_critical) VALUES
(1, 1, 'จัดทำร่างขอบเขตงาน (TOR)', 'จัดทำเอกสารรายละเอียดคุณลักษณะเฉพาะ', 7, '2024-01-15', '2024-01-22', '2024-01-15', '2024-01-21', 'completed', 0),
(1, 2, 'เสนอขออนุมัติหลักการ', 'เสนอผู้มีอำนาจพิจารณาอนุมัติ', 5, '2024-01-23', '2024-01-28', '2024-01-22', '2024-01-27', 'completed', 0),
(1, 3, 'ประกาศเชิญชวน', 'ประกาศเชิญชวนผู้ประกอบการ', 21, '2024-01-29', '2024-02-19', '2024-01-28', NULL, 'in_progress', 1),
(1, 4, 'รับซองข้อเสนอ', 'รับซองข้อเสนอจากผู้ประกอบการ', 1, '2024-02-20', '2024-02-20', NULL, NULL, 'pending', 0),
(1, 5, 'เปิดซองและพิจารณาข้อเสนอ', 'พิจารณาผลการประกวดราคา', 7, '2024-02-21', '2024-02-28', NULL, NULL, 'pending', 1),
(1, 6, 'ประกาศผลผู้ชนะ', 'ประกาศรายชื่อผู้ชนะ', 3, '2024-03-01', '2024-03-04', NULL, NULL, 'pending', 0),
(1, 7, 'ทำสัญญาหรือข้อตกลง', 'ดำเนินการทำสัญญาจ้าง', 14, '2024-03-05', '2024-03-19', NULL, NULL, 'pending', 1);

-- ========================================
-- 6. INSERT SAMPLE COMMENTS
-- ========================================

INSERT INTO comments (project_id, step_id, user_id, comment_text, comment_type, priority, visibility) VALUES
(1, NULL, 11, 'โครงการนี้เป็นความเร่งด่วน กรุณาเร่งรัดดำเนินการให้แล้วเสร็จตามกำหนด', 'instruction', 'urgent', 'public'),
(1, 3, 11, 'ขอให้ตรวจสอบคุณสมบัติผู้ประกอบการให้ละเอียดด้วย', 'concern', 'high', 'public');

-- ========================================
-- 7. INSERT SAMPLE NOTIFICATIONS
-- ========================================

INSERT INTO notifications (user_id, project_id, step_id, notification_type, title, message, priority, is_read) VALUES
(2, 1, 3, 'sla_warning', 'เตือน: ขั้นตอนใกล้เกินกำหนด', 'โครงการ "ปรับปรุงถนนภายในตำบลหัวทะเล" ขั้นตอน "ประกาศเชิญชวน" เหลือเวลา 3 วัน', 'high', 0),
(2, NULL, NULL, 'comment_added', 'ความเห็นใหม่จากผู้บริหาร', 'ปลัดเทศบาลได้แสดงความเห็นในโครงการของคุณ', 'medium', 0);

-- ========================================
-- Note: รหัสผ่านที่ hash จริงจะต้องสร้างผ่าน bcrypt
-- ในโค้ดจริงจะใช้:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('password123', 10);
-- ========================================
