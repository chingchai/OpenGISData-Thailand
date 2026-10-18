# TECH_STACK_VERSIONS.md - ระบบจัดการโครงการจัดซื้อจัดจ้าง
## เทศบาลตำบลหัวทะเล - เวอร์ชันแน่นอนทุก Library

---

## 🎯 ภาพรวม Technology Stack (Version Locked)

ระบบนี้ใช้เวอร์ชันที่ได้รับการทดสอบแล้วและ compatible กัน **อัปเดต: มกราคม 2025**

### การตรวจสอบเวอร์ชัน
```bash
# ตรวจสอบเวอร์ชันที่ติดตั้งแล้ว
npm list --depth=0
npm outdated

# ตรวจสอบเวอร์ชันล่าสุด
npm view <package-name> version
npm view <package-name> versions --json
```

---

## 🎨 Frontend Dependencies (package.json)

### Core React Framework
```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-router-dom": "6.26.1"
}
```

**เหตุผล**: React 18.2.0 เป็น stable version ที่รองรับ Concurrent Features และ Server Components

### Build Tools & Development
```json
{
  "vite": "5.4.7",
  "@vitejs/plugin-react": "4.3.1",
  "@vitejs/plugin-react-swc": "3.7.0",
  "esbuild": "0.21.5"
}
```

**เหตุผล**: Vite 5.x มี performance ดีกว่า Webpack และ support ESM natively

### TypeScript Support (Optional)
```json
{
  "typescript": "5.5.4",
  "@types/react": "18.3.5",
  "@types/react-dom": "18.3.0",
  "@types/node": "22.5.4"
}
```

### Styling & UI Framework
```json
{
  "tailwindcss": "3.4.10",
  "autoprefixer": "10.4.20",
  "postcss": "8.4.45",
  "@headlessui/react": "2.1.8",
  "@heroicons/react": "2.1.5",
  "clsx": "2.1.1",
  "tailwind-merge": "2.5.2"
}
```

**เหตุผล**: Tailwind 3.4.x มี performance improvements และ modern CSS features

### State Management & Data Fetching
```json
{
  "@tanstack/react-query": "5.54.1",
  "@tanstack/react-query-devtools": "5.54.1",
  "axios": "1.7.7",
  "react-hook-form": "7.53.0",
  "@hookform/resolvers": "3.9.0",
  "yup": "1.4.0",
  "zustand": "4.5.5"
}
```

**เหตุผล**: TanStack Query v5 (เดิมคือ React Query) มี TypeScript support ดีกว่า

### Charts & Visualization
```json
{
  "recharts": "2.12.7",
  "lucide-react": "0.439.0",
  "d3": "7.9.0",
  "@types/d3": "7.4.3",
  "plotly.js": "2.35.0",
  "react-plotly.js": "2.6.0"
}
```

### Date & Time
```json
{
  "date-fns": "3.6.0",
  "date-fns-tz": "3.1.3"
}
```

**เหตุผล**: date-fns มี bundle size เล็กกว่า moment.js และรองรับ tree-shaking

### Form & Validation
```json
{
  "react-select": "5.8.0",
  "react-datepicker": "7.3.0",
  "react-dropzone": "14.2.3"
}
```

### Development Dependencies
```json
{
  "eslint": "9.9.1",
  "@eslint/js": "9.9.1",
  "eslint-plugin-react": "7.35.2",
  "eslint-plugin-react-hooks": "4.6.2",
  "eslint-plugin-react-refresh": "0.4.11",
  "prettier": "3.3.3",
  "prettier-plugin-tailwindcss": "0.6.6"
}
```

---

## ⚙️ Backend Dependencies (package.json)

### Core Runtime & Framework
```json
{
  "node": ">=18.19.0",
  "express": "4.19.2",
  "cors": "2.8.5",
  "helmet": "7.1.0",
  "morgan": "1.10.0",
  "compression": "1.7.4",
  "express-rate-limit": "7.4.0"
}
```

**เหตุผล**: Express 4.19.x มี security fixes และ Node.js 18.19+ เป็น LTS

### Database & ORM
```json
{
  "mysql2": "3.11.0",
  "knex": "3.1.0",
  "objection": "3.1.4",
  "better-sqlite3": "11.3.0"
}
```

**เหตุผล**: MySQL2 3.11.x รองรับ MySQL 8+ และ better-sqlite3 11.x มีประสิทธิภาพสูง

### Authentication & Security
```json
{
  "jsonwebtoken": "9.0.2",
  "bcrypt": "5.1.1",
  "express-validator": "7.2.0",
  "joi": "17.13.3"
}
```

### File Handling & Storage
```json
{
  "multer": "1.4.5-lts.1",
  "sharp": "0.33.5",
  "file-type": "19.5.0",
  "mime-types": "2.1.35",
  "fs-extra": "11.2.0"
}
```

**เหตุผล**: Sharp 0.33.x มี performance ดีและรองรับ modern image formats

### Task Scheduling & Background Jobs
```json
{
  "node-cron": "3.0.3",
  "bull": "4.16.0",
  "ioredis": "5.4.1"
}
```

### Email & Notifications
```json
{
  "nodemailer": "6.9.14",
  "@aws-sdk/client-ses": "3.651.1",
  "socket.io": "4.7.5"
}
```

### Logging & Monitoring
```json
{
  "winston": "3.14.2",
  "winston-daily-rotate-file": "5.0.0",
  "pino": "9.4.0",
  "pino-pretty": "11.2.2"
}
```

### Development Dependencies
```json
{
  "nodemon": "3.1.4",
  "concurrently": "8.2.2",
  "dotenv": "16.4.5"
}
```

---

## 📋 Naming Conventions Standards

### 🎯 Quick Reference
| Type | Convention | Example |
|------|------------|---------|
| **Functions** | camelCase | `getUserById()`, `validateProjectData()` |
| **Files** | kebab-case | `user-service.js`, `project-controller.js` |
| **Classes** | PascalCase | `UserService`, `ProjectController` |
| **Variables** | camelCase | `userData`, `projectList` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| **Database Tables** | snake_case | `user_profiles`, `project_steps` |
| **Database Columns** | snake_case | `created_at`, `department_id` |
| **Components** | PascalCase | `UserCard`, `ProjectForm` |
| **Hooks** | camelCase with use prefix | `useAuth`, `useProjectData` |

---

## 🎨 Frontend Naming Examples

### React Components
```javascript
// ✅ Correct
const UserCard = ({ user }) => { ... }
const ProjectFormModal = () => { ... }
const DashboardLayout = () => { ... }
```

### Custom Hooks
```javascript
// ✅ Correct
const useAuth = () => { ... }
const useProjectData = (projectId) => { ... }
const useLocalStorage = (key, defaultValue) => { ... }
```

### Files & Folders
```
src/
├── components/
│   ├── user-card.jsx              ✅ kebab-case
│   └── project-form-modal.jsx     ✅ kebab-case
├── hooks/
│   ├── use-auth.js                ✅ kebab-case with use- prefix
│   └── use-project-data.js        ✅ kebab-case
└── services/
    ├── api-client.js              ✅ kebab-case
    └── auth-service.js            ✅ kebab-case
```

---

## ⚙️ Backend Naming Examples

### Functions & Methods
```javascript
// ✅ Correct - Verb + Noun pattern
const getUserById = async (id) => { ... }
const createProject = async (projectData) => { ... }
const validateProjectData = (data) => { ... }
```

### Classes
```javascript
// ✅ Correct
class UserService {
  constructor() { ... }
  async findById(id) { ... }
  async create(userData) { ... }
}
```

### Files & Folders
```
server/
├── controllers/
│   ├── auth-controller.js          ✅ kebab-case
│   └── project-controller.js       ✅ kebab-case
├── services/
│   ├── auth-service.js             ✅ kebab-case
│   └── email-service.js            ✅ kebab-case
└── middleware/
    ├── auth-middleware.js          ✅ kebab-case
    └── validation-middleware.js    ✅ kebab-case
```

---

## 🗄️ Database Naming

### Tables
```sql
-- ✅ Correct - snake_case, plural nouns
CREATE TABLE users ( ... );
CREATE TABLE departments ( ... );
CREATE TABLE project_steps ( ... );
```

### Columns
```sql
-- ✅ Correct - snake_case
CREATE TABLE projects (
    id INT PRIMARY KEY,
    project_code VARCHAR(50),
    created_at TIMESTAMP,
    department_id INT
);
```

---

## 🔧 Constants & Configuration

### Environment Variables
```bash
# ✅ Correct - SCREAMING_SNAKE_CASE
NODE_ENV=production
DATABASE_URL=mysql://localhost:3306/procurement
JWT_SECRET=your-secret-key
MAX_FILE_SIZE=10485760
```

### Application Constants
```javascript
// ✅ Correct
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;
const API_BASE_URL = 'https://api.example.com';

const PROCUREMENT_METHODS = {
  PUBLIC_INVITATION: 'public_invitation',
  SELECTION: 'selection',
  SPECIFIC: 'specific'
};
```

---

## 🎯 API Naming

### REST Endpoints
```javascript
// ✅ Correct - RESTful pattern
GET    /api/v1/users                    // getAllUsers
GET    /api/v1/users/:id               // getUserById
POST   /api/v1/users                   // createUser
PUT    /api/v1/users/:id               // updateUser
DELETE /api/v1/users/:id               // deleteUser
```

### Query Parameters
```javascript
// ✅ Correct - camelCase
GET /api/v1/projects?departmentId=1&pageSize=20&sortBy=createdAt
```

---

## 📦 Installation Commands

### Quick Setup
```bash
# Node.js Version (ใช้ nvm)
nvm install 18.19.1
nvm use 18.19.1

# Install exact versions
npm ci

# ตรวจสอบเวอร์ชัน
npm list --depth=0
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Inconsistent Patterns
```javascript
// Don't mix conventions
const getUserData = () => { ... }    // camelCase
const get_user_profile = () => { ... } // snake_case
const GetUserRoles = () => { ... }   // PascalCase
```

### ❌ Boolean Variables
```javascript
// Use clear boolean naming
const isActive = true;        // ✅ Clear boolean
const hasPermission = false;  // ✅ Clear boolean
const canEdit = true;         // ✅ Clear boolean
```

---

**หมายเหตุ**: เวอร์ชันเหล่านี้ได้รับการทดสอบและใช้งานร่วมกันได้ดี อัปเดตล่าสุด **มกราคม 2025**

**Last Updated**: January 2025
**Version**: 1.0.0
