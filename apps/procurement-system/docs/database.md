# Database Documentation
## ระบบจัดการโครงการจัดซื้อจัดจ้าง - เทศบาลตำบลหัวทะเล

---

## 📋 Overview

ระบบรองรับ 2 ประเภท Database:

1. **SQLite** - สำหรับ Development และ MVP Testing
2. **MariaDB/MySQL** - สำหรับ Production Deployment

---

## 🔧 Configuration

### SQLite (Default)

```bash
# .env
DB_TYPE=sqlite
DB_PATH=./server/data/database/procurement.db
```

**ข้อดี:**
- ✅ ติดตั้งง่าย ไม่ต้อง setup server
- ✅ เหมาะสำหรับ development และ testing
- ✅ Portable - เก็บเป็นไฟล์เดียว

**ข้อจำกัด:**
- ⚠️  ไม่รองรับ concurrent writes มาก
- ⚠️  ประสิทธิภาพต่ำกว่า MariaDB สำหรับข้อมูลมาก

### MariaDB/MySQL (Production)

```bash
# .env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=procurement_system
DB_USER=procurement_user
DB_PASSWORD=your_secure_password
```

**ข้อดี:**
- ✅ ประสิทธิภาพสูง
- ✅ รองรับ concurrent users มาก
- ✅ เหมาะสำหรับ production

---

## 📊 Database Schema

### Tables (15 ตาราง)

#### 1. Core Tables
- `departments` - กอง/สำนัก (7 กอง)
- `users` - ผู้ใช้งาน (staff/admin/executive)
- `user_sessions` - Session tracking

#### 2. Project Management
- `projects` - โครงการจัดซื้อจัดจ้าง
- `project_steps` - ขั้นตอนโครงการ
- `extension_requests` - การขอขยายเวลา

#### 3. SLA Management
- `sla_config` - การตั้งค่า SLA
- `sla_templates` - SLA Templates

#### 4. Communication
- `comments` - ความเห็น/หมายเหตุ
- `comment_reactions` - Reactions (like, agree, etc.)
- `notifications` - การแจ้งเตือน

#### 5. File Management
- `file_attachments` - ไฟล์แนบ

#### 6. System
- `audit_logs` - บันทึกการใช้งาน
- `holidays` - วันหยุดราชการ
- `system_configs` - การตั้งค่าระบบ

---

## 🗂️ Schema Files

### SQLite Version
```
server/data/database/
├── schema.sql        # SQLite schema (MVP)
└── seed.sql          # SQLite seed data
```

### MariaDB Version
```
server/data/database/
├── schema.mysql.sql  # MariaDB schema (Production)
└── seed.mysql.sql    # MariaDB seed data
```

---

## 🚀 Setup Instructions

### Option 1: SQLite (Quick Start)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies
cd server && npm install

# 3. Initialize database (auto-creates SQLite file)
npm run dev

# Database will be created automatically at:
# server/data/database/procurement.db
```

### Option 2: MariaDB/MySQL (Production)

```bash
# 1. Install MariaDB
# Ubuntu/Debian:
sudo apt-get install mariadb-server
# macOS:
brew install mariadb

# 2. Start MariaDB
sudo systemctl start mariadb
# or on macOS:
brew services start mariadb

# 3. Create database and user
sudo mysql -u root -p

CREATE DATABASE procurement_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'procurement_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON procurement_system.* TO 'procurement_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 4. Import schema
mysql -u procurement_user -p procurement_system < server/data/database/schema.mysql.sql

# 5. Import seed data
mysql -u procurement_user -p procurement_system < server/data/database/seed.mysql.sql

# 6. Configure environment
cp .env.example .env
# Edit .env and set:
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=procurement_system
DB_USER=procurement_user
DB_PASSWORD=your_secure_password

# 7. Install MySQL client for Node.js
cd server
npm install mysql2

# 8. Start server
npm run dev
```

---

## 🔄 Migration Between Databases

### From SQLite to MariaDB

```bash
# 1. Export data from SQLite
sqlite3 server/data/database/procurement.db .dump > backup.sql

# 2. Convert SQLite syntax to MySQL
# (Manual or use migration tools)

# 3. Import to MariaDB
mysql -u procurement_user -p procurement_system < converted.sql
```

### From MariaDB to SQLite

```bash
# 1. Export from MariaDB
mysqldump -u procurement_user -p procurement_system > backup.sql

# 2. Convert MySQL syntax to SQLite
# (Manual or use migration tools)

# 3. Import to SQLite
sqlite3 server/data/database/procurement.db < converted.sql
```

---

## 📈 Performance Optimization

### Indexes

#### SQLite
```sql
-- Already included in schema.sql
CREATE INDEX idx_projects_dashboard ON projects(department_id, status);
CREATE INDEX idx_steps_timeline ON project_steps(project_id, status, planned_end_date);
```

#### MariaDB
```sql
-- Already included in schema.mysql.sql
CREATE INDEX idx_projects_reporting ON projects(budget_year, procurement_method, status);
CREATE INDEX idx_notifications_inbox ON notifications(user_id, is_read, created_at);
```

### Query Optimization Tips

1. **Use prepared statements** - ป้องกัน SQL injection และเพิ่มประสิทธิภาพ
2. **Limit result sets** - ใช้ LIMIT และ OFFSET
3. **Use indexes wisely** - อย่าสร้าง index มากเกินไป
4. **Cache frequently accessed data** - ใช้ Redis หรือ in-memory cache

---

## 🔒 Security Best Practices

### 1. Password Security
```javascript
// Use bcrypt for password hashing
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. SQL Injection Prevention
```javascript
// Always use parameterized queries
db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
```

### 3. Access Control
- Role-based permissions
- Department-level data isolation
- Audit logging for all sensitive operations

### 4. Data Encryption
- Sensitive config values
- User sessions
- File attachments (optional)

---

## 🧪 Testing

### Test Data

```bash
# Reset database with test data
npm run db:reset

# This will:
# 1. Drop all tables
# 2. Recreate schema
# 3. Insert seed data
```

### Test Users

| Username | Password | Role | Department |
|----------|----------|------|------------|
| staff_engineering | password123 | staff | กองช่าง |
| admin | password123 | admin | - |
| executive | password123 | executive | - |

---

## 📊 Views and Reporting

### Pre-defined Views

#### v_projects_overview
```sql
SELECT * FROM v_projects_overview WHERE department_id = 2;
```
รายการโครงการพร้อมสถิติและความคืบหน้า

#### v_delayed_projects
```sql
SELECT * FROM v_delayed_projects ORDER BY step_delay_days DESC;
```
โครงการที่ล่าช้าพร้อมรายละเอียด

#### v_user_notifications
```sql
SELECT * FROM v_user_notifications WHERE user_id = 1 AND is_read = FALSE;
```
การแจ้งเตือนที่ยังไม่ได้อ่าน

---

## 🔧 Maintenance

### Backup

#### SQLite
```bash
# Simple file copy
cp server/data/database/procurement.db backup_$(date +%Y%m%d).db

# Or use SQLite dump
sqlite3 server/data/database/procurement.db .dump > backup.sql
```

#### MariaDB
```bash
# Full backup
mysqldump -u procurement_user -p procurement_system > backup_$(date +%Y%m%d).sql

# Backup with compression
mysqldump -u procurement_user -p procurement_system | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore

#### SQLite
```bash
# Restore from file
cp backup_20240101.db server/data/database/procurement.db

# Or from SQL dump
sqlite3 server/data/database/procurement.db < backup.sql
```

#### MariaDB
```bash
# Restore from SQL dump
mysql -u procurement_user -p procurement_system < backup_20240101.sql

# Restore from compressed backup
gunzip < backup_20240101.sql.gz | mysql -u procurement_user -p procurement_system
```

---

## 📝 Schema Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-11 | Initial MVP schema (SQLite) |
| 1.1.0 | 2024-11 | Added MariaDB schema |
| 1.2.0 | TBD | Add file attachments support |
| 1.3.0 | TBD | Add workflow automation |

---

## 🆘 Troubleshooting

### Common Issues

#### SQLite: "database is locked"
```bash
# Close all connections and restart
pkill -f "node server.js"
npm run dev
```

#### MariaDB: "Connection refused"
```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Restart MariaDB
sudo systemctl restart mariadb
```

#### "Table doesn't exist"
```bash
# Re-initialize database
npm run db:reset
```

---

## 📚 References

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [MariaDB Documentation](https://mariadb.com/kb/en/documentation/)
- [better-sqlite3 (Node.js)](https://github.com/WiseLibs/better-sqlite3)
- [mysql2 (Node.js)](https://github.com/sidorares/node-mysql2)

---

**Last Updated**: November 2024
**Version**: 1.1.0
