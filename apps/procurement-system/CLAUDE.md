# CLAUDE.md - AI Context File
## ระบบจัดการโครงการจัดซื้อจัดจ้าง - เทศบาลตำบลหัวทะเล

> **AI Context File**: ไฟล์นี้ใช้เป็นบริบทหลักสำหรับ AI ในการพัฒนาระบบ มีข้อมูลภาพรวม Architecture และมาตรฐานการพัฒนา

---

## 📋 Project Overview

### ระบบงาน
**ระบบจัดการโครงการจัดซื้อจัดจ้าง** สำหรับเทศบาลตำบลหัวทะเล ติดตามความคืบหน้าโครงการจัดซื้อจัดจ้าง จัดการขั้นตอนตามกฎหมาย และสร้าง dashboard สำหรับผู้บริหาร

### ผู้ใช้งาน (3 ประเภท)
- **เจ้าหน้าที่กอง** (7 กอง/สำนัก): จัดการโครงการของกองตนเอง
- **Admin**: จัดการโครงการทุกกอง + ตั้งค่าระบบ + SLA + Notifications
- **ผู้บริหาร**: ดูภาพรวม + Comment + อนุมัติ + รายงาน

### กอง/สำนัก (7 หน่วยงาน)
1. สำนักปลัด (ADM)
2. กองคลัง (FIN)
3. กองช่าง (ENG)
4. กองการศึกษา (EDU)
5. กองสาธารณสุขและสิ่งแวดล้อม (PHH)
6. กองสวัสดิการสังคม (SOC)
7. กองยุทธศาสตร์และงบประมาณ (STR)

### วิธีจัดซื้อจัดจ้าง (3 วิธี)
1. **ประกาศเชิญชวนทั่วไป** - 7 ขั้นตอน (21-45 วัน)
2. **วิธีคัดเลือก** - 8 ขั้นตอน (25-50 วัน)
3. **วิธีเฉพาะเจาะจง** - 10 ขั้นตอน (35-65 วัน)

---

## 🏗️ System Architecture

### Technology Stack (Version Locked)
```yaml
Frontend:
  - React: "18.2.0"
  - Vite: "5.4.7"
  - Tailwind CSS: "3.4.10"
  - TanStack Query: "5.54.1"
  - React Router: "6.26.1"

Backend:
  - Node.js: ">=18.19.0"
  - Express: "4.19.2"
  - MySQL2: "3.11.0"
  - Knex.js: "3.1.0"
  - JWT: "9.0.2"
  - bcryptjs: "2.4.3"

Database:
  - MariaDB: "10.11.8-LTS" (Recommended)
  - MySQL: "8.0.39+" (Compatible)

Development:
  - ESLint: "9.9.1"
  - Prettier: "3.3.3"
  - Nodemon: "3.1.4"
```

### Folder Structure Pattern
```
procurement-system/
├── client/                    # React Frontend
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── features/          # Feature-specific components
│       │   ├── auth/          # Authentication
│       │   ├── dashboard/     # Dashboard
│       │   ├── projects/      # Project management
│       │   └── steps/         # Step management
│       ├── services/          # API calls
│       ├── hooks/             # Custom React hooks
│       ├── utils/             # Helper functions
│       └── context/           # React context
│
└── server/                    # Node.js Backend
    ├── controllers/           # Route handlers
    ├── services/              # Business logic
    ├── models/                # Database models
    ├── middleware/            # Express middleware
    ├── routes/                # API routes
    ├── config/                # Configuration
    └── utils/                 # Server utilities
```

### Database Schema Key Tables
```sql
-- Core Tables
users                 # ผู้ใช้งาน + roles + departments
departments           # 7 กอง/สำนัก
projects              # โครงการหลัก
project_steps         # ขั้นตอนแต่ละโครงการ
sla_config           # การตั้งค่า SLA แต่ละวิธี

-- Management Tables
comments              # ความเห็น/หมายเหตุ
notifications         # การแจ้งเตือน
extension_requests    # คำขอขยายเวลา
file_attachments     # ไฟล์แนบ
audit_logs           # บันทึกการใช้งาน
```

---

## 🎯 Core Functions & Features

### Authentication & Authorization
```typescript
authenticateUser()     # JWT + Role-based access
checkPermission()      # Department-level filtering
validateToken()        # Session management
```

### Project Management
```typescript
createProject()        # Auto-generate steps by method
updateProject()        # Track changes + notifications
deleteProject()        # Soft delete with audit
getProjects()          # Filtered by role/department
```

### Step Management
```typescript
updateProjectStep()    # Status updates + SLA tracking
extendStepDeadline()   # Extension requests + approval
getStepHistory()       # Audit trail per step
```

### SLA & Notifications
```typescript
configureSLA()         # Define timelines per method
checkSLACompliance()   # Monitor delays + risks
generateSLAAlerts()    # Automated notifications
```

### Comments & Collaboration
```typescript
addProjectComment()    # Project-level comments (Admin/Executive)
addStepComment()       # Step-level feedback
getCommentThread()     # Threaded discussions
```

### Reporting & Analytics
```typescript
generateOverviewReport()    # Executive dashboard
generateDelayReport()       # Project delays analysis
generatePerformanceReport() # KPI & efficiency metrics
```

---

## 📊 Data Access Patterns

### Role-Based Data Filtering
```javascript
// เจ้าหน้าที่กอง - เห็นเฉพาะกองตนเอง
const staffQuery = (query, user) => {
  return query.where('department_id', user.departmentId);
};

// Admin/ผู้บริหาร - เห็นทุกกอง
const adminQuery = (query, user) => {
  return query; // No filter
};
```

### Permission Matrix
| Action | เจ้าหน้าที่กอง | Admin | ผู้บริหาร |
|--------|---------------|-------|----------|
| View Projects | Own Dept Only | All | All |
| Create/Edit Project | Own Dept | All | ❌ |
| Comment Projects | ❌ | ✅ | ✅ |
| Set SLA | ❌ | ✅ | ✅ |
| Export Data | ❌ | ✅ | ✅ |

---

## 🔧 Coding Standards

### Naming Conventions
```javascript
// Functions: camelCase
const getUserById = () => { ... }
const createProject = () => { ... }

// Components: PascalCase
const UserCard = () => { ... }
const ProjectForm = () => { ... }

// Files: kebab-case
user-service.js
project-controller.js
auth-middleware.js

// Database: snake_case
users, project_steps, created_at
department_id, project_code

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

### File Structure Standards
```
# Frontend Components
components/feature/component-name.jsx

# Backend Services
services/feature-service.js
controllers/feature-controller.js

# Database Tables
table_name (plural, snake_case)
column_name (snake_case)
```

### API Endpoint Patterns
```javascript
// RESTful Convention
GET    /api/v1/projects
POST   /api/v1/projects
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id

// Nested Resources
GET    /api/v1/projects/:id/steps
PUT    /api/v1/projects/:id/steps/:stepId
POST   /api/v1/projects/:id/comments
```

---

## 💻 Common Commands

### Development Setup
```bash
# Install dependencies
npm ci                    # Install from package-lock.json
npm install --exact       # Install exact versions

# Development servers
npm run dev               # Start both client + server
npm run client           # Frontend only (port 5173)
npm run server           # Backend only (port 3001)

# Database operations
npm run db:migrate       # Run migrations
npm run db:seed          # Seed initial data
npm run db:reset         # Reset + migrate + seed
```

### Code Quality
```bash
# Linting & Formatting
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix lint issues
npm run format           # Prettier formatting

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Production Build
```bash
# Build for production
npm run build            # Build client
NODE_ENV=production npm start # Start production server

# Docker operations
docker build -t procurement-app .
docker run -p 3000:3000 procurement-app
```

### Database Management
```bash
# Migration commands
knex migrate:make create_table_name
knex migrate:latest
knex migrate:rollback

# Seed data
knex seed:make seed_name
knex seed:run
```

---

## 🛡️ Security Guidelines

### Authentication Flow
```javascript
// JWT Token Structure
{
  userId: number,
  role: 'staff' | 'admin' | 'executive',
  departmentId: number | null,
  permissions: string[],
  exp: timestamp
}

// Password Requirements
- Minimum 8 characters
- bcrypt hashing with salt rounds 12
- Password expiry: 90 days
```

### Data Validation
```javascript
// Input Validation Pattern
const validateProjectData = (data) => {
  return Joi.object({
    name: Joi.string().min(5).max(200).required(),
    budget: Joi.number().min(1).max(50000000).required(),
    departmentId: Joi.number().integer().required(),
    procurementMethod: Joi.string().valid('public_invitation', 'selection', 'specific').required()
  }).validate(data);
};
```

### Permission Checking
```javascript
// Middleware Pattern
const checkPermission = (action, resource) => {
  return (req, res, next) => {
    const user = req.user;
    if (hasPermission(user, action, resource, req.params)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
```

---

## 📈 Performance Guidelines

### Database Optimization
```sql
-- Key Indexes
CREATE INDEX idx_projects_dashboard ON projects (department_id, status, budget_year);
CREATE INDEX idx_steps_timeline ON project_steps (project_id, status, planned_end_date);
CREATE INDEX idx_notifications_inbox ON notifications (user_id, is_read, created_at DESC);
```

### API Response Patterns
```javascript
// Standard Response Format
{
  success: boolean,
  data?: any,
  error?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Caching Strategy
```javascript
// React Query Cache Keys
const QUERY_KEYS = {
  projects: ['projects'],
  projectsByDept: (deptId) => ['projects', 'department', deptId],
  projectSteps: (projectId) => ['projects', projectId, 'steps'],
  notifications: ['notifications']
};
```

---

## 🔄 Business Logic Patterns

### SLA Calculation Example
```javascript
const calculateSLAStatus = (step, slaConfig) => {
  const daysRemaining = daysBetween(new Date(), step.plannedEnd);
  const warningThreshold = slaConfig.warningDays;

  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 1) return 'critical';
  if (daysRemaining <= warningThreshold) return 'warning';
  return 'on_track';
};
```

### Notification Generation
```javascript
const createSLANotification = (project, step, alertType) => {
  const notification = {
    type: alertType,
    title: `โครงการ ${project.name} ${alertType === 'overdue' ? 'เกินกำหนด' : 'ใกล้ครบกำหนด'}`,
    message: `ขั้นตอน "${step.stepName}" ${step.delayDays > 0 ? `ล่าช้า ${step.delayDays} วัน` : `เหลือ ${daysRemaining} วัน`}`,
    recipients: getNotificationRecipients(project, step),
    projectId: project.id,
    stepId: step.id
  };
  return notification;
};
```

### Auto-Step Generation
```javascript
const generateProjectSteps = (project, slaConfig) => {
  const method = project.procurementMethod;
  const steps = SLA_TEMPLATES[method];

  return steps.map((step, index) => ({
    projectId: project.id,
    stepNumber: index + 1,
    stepName: step.name,
    sladays: slaConfig[method][index].standardDays,
    plannedStartDate: calculateStartDate(project.startDate, index),
    plannedEndDate: calculateEndDate(project.startDate, index, step.days),
    status: 'pending'
  }));
};
```

---

## 🚨 Error Handling Standards

### API Error Response
```javascript
const handleError = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // Log error
  logger.error(`${statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.status(statusCode).json(response);
};
```

### Frontend Error Boundaries
```javascript
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Application Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <ErrorFallback onReset={() => setHasError(false)} />;
  }

  return children;
};
```

---

## 📝 Development Checklist

### Before Committing
- [ ] Code follows naming conventions
- [ ] Functions have proper JSDoc comments
- [ ] Error handling implemented
- [ ] Tests written and passing
- [ ] Security vulnerabilities checked (`npm audit`)
- [ ] Performance considerations addressed

### Before Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Production build tested
- [ ] Security headers configured
- [ ] SSL certificates installed
- [ ] Backup procedures tested

---

## 🎯 Key Reminders for AI

### Context Understanding
- This is a **government procurement tracking system** with strict compliance requirements
- **Role-based access** is critical - staff only see their department data
- **SLA monitoring** and **audit trails** are mandatory features
- **Thai government procurement law** compliance is required

### Development Priorities
1. **Security first** - proper authentication and authorization
2. **Data integrity** - audit logs and change tracking
3. **Performance** - handle multiple departments efficiently
4. **User experience** - clear interfaces for non-technical users
5. **Compliance** - meet government standards and reporting needs

### Common Patterns to Use
- Always filter data by user role and department
- Include audit logging for critical operations
- Use soft deletes for important records
- Implement proper error handling and validation
- Follow RESTful API conventions
- Use consistent naming throughout the stack

---

*Last Updated: January 2025*
*AI Context Version: 1.0*
