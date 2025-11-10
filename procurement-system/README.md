# ระบบจัดการโครงการจัดซื้อจัดจ้าง
## เทศบาลตำบลหัวทะเล

ระบบบริหารจัดการโครงการจัดซื้อจัดจ้างภาครัฐแบบครบวงจร สำหรับเทศบาลตำบลหัวทะเล จังหวัดภูเก็ต

---

## 🎯 คุณสมบัติหลัก (MVP)

### ✅ Authentication & Authorization
- เข้าสู่ระบบตามประเภทผู้ใช้ (เจ้าหน้าที่กอง / Admin / ผู้บริหาร)
- การเข้าถึงข้อมูลตาม Role และ Department
- JWT Token-based authentication

### ✅ Project Management
- สร้าง/แก้ไข/ลบโครงการจัดซื้อจัดจ้าง
- 3 วิธีจัดซื้อจัดจ้าง: ประกาศเชิญชวน / คัดเลือก / เฉพาะเจาะจง
- กรองข้อมูลตาม Department (เจ้าหน้าที่เห็นเฉพาะกองตนเอง)

### ✅ Step Management
- จัดการขั้นตอนการจัดซื้อแต่ละโครงการ
- อัพเดทสถานะความคืบหน้า
- เพิ่มหมายเหตุและรายละเอียด

### ✅ Dashboard & Reports
- ภาพรวมสถานะโครงการ
- สถิติการดำเนินงาน
- รายการโครงการล่าสุด

---

## 🏢 7 กอง/สำนักที่รองรับ

1. **กองคลัง** - Clerk
2. **กองช่าง** - Engineering
3. **กองการศึกษา** - Education
4. **กองสาธารณสุขและสิ่งแวดล้อม** - Health
5. **สำนักปลัด** - Municipal
6. **กองวิชาการและแผนงาน** - Strategy
7. **กองคลัง** - Treasury

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI Library (Latest)
- **Vite 7** - Next Generation Build Tool (เร็วมาก!)
- **Tailwind CSS 4** - Utility-first CSS Framework
- **React Router 7** - Client-side Routing
- **Axios** - HTTP Client
- **Context API** - State Management

### Backend
- **Node.js 20+** - JavaScript Runtime
- **Express.js** - Web Framework
- **better-sqlite3** - High-performance SQLite
- **JWT** - Token-based Authentication
- **bcrypt** - Password Hashing (10 rounds)
- **Winston** - Logging
- **express-validator** - Input Validation

### Testing
- **Jest** - Testing Framework
- **Supertest** - HTTP API Testing
- **9/9 Tests Passing** ✅

### DevOps
- **PM2** - Process Manager
- **Nginx** - Reverse Proxy
- **Certbot** - SSL/TLS Certificates

---

## 📋 Prerequisites

ก่อนเริ่มต้น ต้องติดตั้งโปรแกรมเหล่านี้:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (มากับ Node.js)
- **Git** ([Download](https://git-scm.com/))

ตรวจสอบเวอร์ชัน:
```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation & Setup

### ⚡ วิธีที่ 1: Auto Install (Ubuntu Server) - แนะนำ!

```bash
# Clone repository
git clone https://github.com/bogarb12/OpenGISData-Thailand.git
cd OpenGISData-Thailand/procurement-system

# รันสคริปต์ติดตั้งอัตโนมัติ
chmod +x install.sh
./install.sh

# เริ่มใช้งานด้วย PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**สคริปต์จะติดตั้งอัตโนมัติ:**
- ✅ Node.js 20.x (ถ้ายังไม่มี)
- ✅ PM2 Process Manager
- ✅ Backend Dependencies
- ✅ Frontend Dependencies
- ✅ Database + Sample Data
- ✅ Build Frontend
- ✅ สร้าง .env และ ecosystem.config.js

**หลังติดตั้งเสร็จ:**
- Backend API: `http://localhost:3000/api`
- Frontend: `http://localhost:3001` (dev) หรือใช้ Nginx (production)

📚 **คู่มือติดตั้งเต็ม**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

### 🔧 วิธีที่ 2: Manual Install (Development)

#### 1. Clone Repository
```bash
git clone https://github.com/bogarb12/OpenGISData-Thailand.git
cd OpenGISData-Thailand/procurement-system
```

#### 2. Install Backend
```bash
cd server
npm install

# สร้าง .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
DB_PATH=./data/database/procurement.db
LOG_LEVEL=info
EOF

# Initialize Database
npm run db:init
```

#### 3. Install Frontend
```bash
cd ../client
npm install
```

#### 4. Start Development Servers
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

#### 5. Open Application
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000/api`

---

## 📁 Project Structure

```
procurement-system/
├── client/                   # Frontend React + Vite App
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── Layout.jsx    # Main layout with nav
│   │   ├── contexts/         # React Contexts
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/            # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   └── OverduePage.jsx
│   │   ├── services/         # API services
│   │   │   └── api.js        # Axios API client
│   │   ├── assets/           # Static assets
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── vite.config.js        # Vite configuration
│   └── tailwind.config.js    # Tailwind CSS config
│
├── server/                   # Backend API (ES6 Modules)
│   ├── config/               # Configuration
│   │   └── database.js       # SQLite connection
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── steps.js
│   ├── controllers/          # Route controllers
│   ├── services/             # Business logic
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # JWT authentication
│   ├── validators/           # Input validation
│   ├── data/                 # Database & migrations
│   │   ├── database/         # SQLite database files
│   │   └── migrations/       # Database schema
│   ├── tests/                # Jest unit tests
│   │   └── *.test.js        # 9/9 tests passing ✅
│   ├── logs/                 # Application logs
│   └── server.js            # Entry point
│
├── DEPLOYMENT.md             # 📚 Full deployment guide
├── install.sh                # ⚡ Auto-install script
├── ecosystem.config.js       # PM2 configuration
└── README.md                 # This file
```

---

## 🔐 Default Users (สำหรับทดสอบ)

**ระบบมี Quick Login บนหน้า Login Page แล้ว!** 🚀

### 👨‍💼 Admin
- **Username**: `admin`
- **Password**: `password123`
- **Role**: `admin`
- **Access**: เข้าถึงและจัดการทุกกอง

### 👷 เจ้าหน้าที่กอง (Staff)
- **Username**: `staff_treasury`
- **Password**: `password123`
- **Role**: `staff`
- **Department**: กองคลัง

### 🎓 ผู้บริหาร (Executive)
- **Username**: `executive`
- **Password**: `password123`
- **Role**: `executive`
- **Access**: ดูข้อมูลทุกกอง (Read-only + Comment)

**หมายเหตุ:** ทุก user ใช้ password เดียวกันคือ `password123` เพื่อความสะดวกในการทดสอบ
⚠️ **ต้องเปลี่ยน password ก่อนใช้งานจริง!**

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### 🔐 Authentication
```http
POST   /api/auth/login              # Login (ส่ง username, password, role)
POST   /api/auth/refresh            # Refresh token
GET    /api/auth/me                 # Get current user info
```

### 📊 Projects
```http
GET    /api/projects                # List all projects (filtered by role/department)
GET    /api/projects/:id            # Get project details
GET    /api/projects/stats          # Get project statistics
POST   /api/projects                # Create new project [Admin/Staff]
PUT    /api/projects/:id            # Update project [Admin/Staff]
DELETE /api/projects/:id            # Delete project [Admin only]
```

### 📝 Steps (Nested under Projects)
```http
GET    /api/projects/:projectId/steps              # List project steps
GET    /api/projects/:projectId/steps/progress     # Get progress stats
PUT    /api/projects/:projectId/steps/:stepId      # Update step status
```

### ⚠️ Overdue Steps
```http
GET    /api/steps/overdue           # Get all overdue steps
```

### 📖 Full API Tests
```bash
cd server
npm test                             # 9/9 tests passing ✅
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

---

## 🧪 Testing

```bash
# Backend API Tests (Jest + Supertest)
cd server
npm test

# ผลลัพธ์: 9/9 tests passing ✅
# ✓ Authentication API (3 tests)
# ✓ Projects API (4 tests)
# ✓ Steps API (2 tests)
```

**Test Coverage:**
- ✅ Login API
- ✅ Protected Routes (JWT)
- ✅ Projects CRUD
- ✅ Role-based Access Control
- ✅ Steps Management
- ✅ Progress Tracking
- ✅ Overdue Detection

---

## 🏗️ Build & Deploy

### Development
```bash
# Start backend
cd server && npm start

# Start frontend (dev server)
cd client && npm run dev
```

### Production Build
```bash
# Build frontend for production
cd client
npm run build              # Output: dist/

# The built files will be served by Nginx
# or can be served from Express backend
```

### Production Deployment
```bash
# Use PM2 for process management
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Monitor
pm2 status
pm2 logs
pm2 monit
```

📚 **อ่านเพิ่มเติม:** [DEPLOYMENT.md](./DEPLOYMENT.md) - คู่มือติดตั้งเต็มรูปแบบ

---

## 📅 Development Roadmap

### ✅ Phase 1: MVP - **COMPLETED!** 🎉
- [x] Project structure (React 19 + Vite 7)
- [x] Authentication system (JWT + Role-based)
- [x] Project management (CRUD + Filtering)
- [x] Step management (Progress tracking)
- [x] Dashboard (Stats + Recent projects)
- [x] Overdue tracking (Delay detection)
- [x] Backend API (9/9 tests passing)
- [x] Frontend UI (5 pages complete)
- [x] Database setup (SQLite with sample data)
- [x] Deployment ready (install.sh + PM2)

**🚀 Status:** Production Ready!

---

### 🔄 Phase 2: Enhanced Features (Next)
- [ ] File upload/attachments for projects
- [ ] Comment system (with real-time updates)
- [ ] Email notifications (overdue alerts)
- [ ] Advanced filtering & search
- [ ] Export reports (PDF, Excel)
- [ ] User management (CRUD users)
- [ ] Department management

### 🔮 Phase 3: Advanced Features
- [ ] Gantt Chart visualization
- [ ] Dashboard analytics & charts
- [ ] Calendar view
- [ ] Mobile responsive improvements
- [ ] Audit logs (who did what, when)
- [ ] Backup & restore system
- [ ] Multi-language support

### 🚀 Phase 4: Enterprise Ready
- [ ] LINE Notify integration
- [ ] E-GP system integration
- [ ] Advanced reporting & BI
- [ ] Performance optimization
- [ ] High availability setup
- [ ] Migrate to MariaDB/PostgreSQL
- [ ] Docker containerization

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Development Team**
- Project Lead: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]
- UX/UI Designer: [Name]

**Client**
- เทศบาลตำบลหัวทะเล
- จังหวัดภูเก็ต

---

## 📞 Support

หากมีปัญหาหรือคำถาม:
- 📧 Email: support@huatalay.go.th
- 📱 Tel: 076-xxx-xxxx
- 🌐 Website: https://huatalay.go.th

---

## 🙏 Acknowledgments

- เทศบาลตำบลหัวทะเล
- ทีมพัฒนาระบบ
- ผู้ใช้งานทุกท่าน

---

## 🎯 Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/bogarb12/OpenGISData-Thailand.git
cd OpenGISData-Thailand/procurement-system

# 2. Auto Install
chmod +x install.sh && ./install.sh

# 3. Start with PM2
pm2 start ecosystem.config.js

# 4. Access
# API: http://localhost:3000/api
# Frontend Dev: http://localhost:3001
```

**Default Login:**
- Username: `admin`
- Password: `password123`
- Role: `admin`

---

**Last Updated**: November 10, 2024
**Version**: 1.0.0-MVP ✅ Production Ready
**React**: 19 | **Vite**: 7 | **Node.js**: 20+
