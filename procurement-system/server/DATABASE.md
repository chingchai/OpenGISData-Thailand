# Database Setup Guide

## 📋 Overview

ระบบจัดการโครงการจัดซื้อจัดจ้าง - Procurement Management System
Database: SQLite (better-sqlite3)

---

## 🚀 Quick Start

### Initialize Database (First Time)

```bash
npm run db:init
```

This will:
- Create `data/procurement.db`
- Create all tables from schema
- Seed initial data (departments, users, sample projects)
- Generate real bcrypt password hashes

### Reset Database (Delete & Reinitialize)

```bash
npm run db:reset
```

⚠️ **Warning**: This will delete ALL existing data!

### Add More Sample Data

```bash
npm run db:seed
```

Adds additional projects, comments, and notifications to existing database.

### Verify Database Contents

```bash
node scripts/verifyDatabase.js
```

Shows summary of all data in the database.

---

## 📊 Database Contents

### Default Users (11 total)

#### Administrators (2)
- **admin** / password123
  - Full access to all departments
  - Can create/edit/delete any project

- **admin_treasury** / password123
  - Admin for กองคลัง department

#### Staff (7 users - one per department)
- **staff_treasury** / password123 (กองคลัง)
- **staff_engineering** / password123 (กองช่าง)
- **staff_education** / password123 (กองการศึกษา)
- **staff_health** / password123 (กองสาธารณสุข)
- **staff_municipal** / password123 (สำนักปลัด)
- **staff_strategy** / password123 (กองวิชาการ)
- **staff_clerk** / password123 (กองธุรการ)

Staff can only view/edit projects in their own department.

#### Executives (2)
- **executive** / password123 (ปลัดเทศบาล)
- **executive_mayor** / password123 (นายกเทศมนตรี)

Executives can view all departments but can only comment (read-only for projects).

---

### Departments (7 total)

| Code | ชื่อภาษาไทย | Name (EN) |
|------|------------|-----------|
| TREASURY | กองคลัง | Treasury Department |
| ENGINEERING | กองช่าง | Engineering Department |
| EDUCATION | กองการศึกษา | Education Department |
| HEALTH | กองสาธารณสุข | Health and Environment |
| MUNICIPAL | สำนักปลัด | Municipal Office |
| STRATEGY | กองวิชาการ | Strategy and Planning |
| CLERK | กองธุรการ | Clerk Department |

---

### Sample Projects (5 projects)

1. **PR-2567-002-001**: ปรับปรุงถนนภายในตำบลหัวทะเล
   - Status: in_progress
   - Budget: 2,500,000 บาท
   - Department: กองช่าง
   - Method: public_invitation

2. **PR-2567-002-002**: ซ่อมแซมสะพานข้ามคลอง
   - Status: in_progress
   - Budget: 850,000 บาท
   - Department: กองช่าง
   - Method: selection

3. **PR-2567-003-001**: จัดซื้อเครื่องคอมพิวเตอร์โรงเรียน
   - Status: completed
   - Budget: 450,000 บาท
   - Department: กองการศึกษา
   - Method: specific

4. **PR-2567-003-002**: จ้างเหมาบริการทำความสะอาดโรงเรียน
   - Status: in_progress
   - Budget: 180,000 บาท
   - Department: กองการศึกษา
   - Method: selection

5. **PR-2567-004-001**: จัดซื้อวัคซีนป้องกันโรคพิษสุนัขบ้า
   - Status: delayed
   - Budget: 120,000 บาท
   - Department: กองสาธารณสุข
   - Method: specific

---

### Project Steps (7 steps for project #1)

Example workflow for "ปรับปรุงถนนภายในตำบลหัวทะเล":

1. ✅ จัดทำร่างขอบเขตงาน (TOR) - **completed**
2. ✅ เสนอขออนุมัติหลักการ - **completed**
3. 🔄 ประกาศเชิญชวน - **in_progress**
4. ⏳ รับซองข้อเสนอ - pending
5. ⏳ เปิดซองและพิจารณาข้อเสนอ - pending
6. ⏳ ประกาศผลผู้ชนะ - pending
7. ⏳ ทำสัญญาหรือข้อตกลง - pending

---

## 🔐 Security

### Password Hashing
- All passwords use **bcrypt** with 10 salt rounds
- Default password: `password123` (⚠️ change in production!)
- Passwords are never stored in plain text

### Password Hash Example
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('password123', 10);
// $2b$10$...(60 chars)...
```

---

## 📁 File Structure

```
server/
├── data/
│   ├── procurement.db          # SQLite database file (created by init)
│   └── database/
│       ├── schema.sql          # Full database schema
│       └── seed.sql            # Seed data (template)
├── scripts/
│   ├── initDatabase.js         # Initialize DB (schema + seed)
│   ├── resetDatabase.js        # Reset DB (delete + reinit)
│   ├── seedDatabase.js         # Add additional data
│   └── verifyDatabase.js       # Verify DB contents
└── DATABASE.md                 # This file
```

---

## 🛠️ Manual Database Operations

### Using better-sqlite3 in Code

```javascript
import Database from 'better-sqlite3';

const db = new Database('data/procurement.db');

// Query example
const users = db.prepare('SELECT * FROM users WHERE role = ?').all('admin');

// Insert example
const stmt = db.prepare('INSERT INTO projects (name, ...) VALUES (?, ...)');
stmt.run('Project Name', ...);

db.close();
```

### Environment Variables

```bash
# Custom database path
export DB_PATH=/path/to/custom.db
npm run db:init
```

---

## 📈 Database Statistics

After initialization, you should have:

- ✅ 10 tables created
- ✅ 7 departments
- ✅ 11 users (with bcrypt passwords)
- ✅ 5 sample projects
- ✅ 7 project steps
- ✅ All foreign keys configured
- ✅ All indexes created

---

## ⚠️ Troubleshooting

### Database already exists
```
Error: Database already exists
```
**Solution**: Delete `data/procurement.db` or use `npm run db:reset`

### Permission denied
```
Error: EACCES: permission denied
```
**Solution**: Check file permissions on `data/` directory

### bcrypt compilation error
```
Error: bcrypt compilation failed
```
**Solution**:
```bash
npm rebuild bcrypt --build-from-source
```

---

## 📚 Schema Reference

### Main Tables

1. **users** - User accounts and authentication
2. **departments** - Organization departments
3. **projects** - Procurement projects
4. **project_steps** - Steps/phases for each project
5. **comments** - Comments on projects/steps
6. **sla_config** - SLA configuration by procurement method
7. **notifications** - User notifications
8. **audit_log** - System audit trail
9. **sessions** - User sessions
10. **sla_templates** - SLA templates

---

## 🔄 Backup & Restore

### Backup
```bash
cp data/procurement.db data/procurement.backup.db
```

### Restore
```bash
cp data/procurement.backup.db data/procurement.db
```

---

## 📞 Support

For issues or questions:
- Check existing schema: `data/database/schema.sql`
- Run verification: `node scripts/verifyDatabase.js`
- Check logs in console output

---

**Last Updated**: 2024-11-10
**Database Version**: 1.0.0
