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
- **React 18** - UI Library
- **Vite** - Build Tool (เร็วกว่า CRA)
- **Tailwind CSS** - Utility-first CSS Framework
- **React Router v6** - Client-side Routing
- **Axios** - HTTP Client

### Backend
- **Node.js 18+** - JavaScript Runtime
- **Express.js** - Web Framework
- **SQLite** - Database (MVP) → migrate to MariaDB later
- **JWT** - Authentication
- **bcrypt** - Password Hashing

### Development Tools
- **Concurrently** - Run multiple processes
- **Nodemon** - Auto-restart server
- **ESLint** - Code linting
- **Prettier** - Code formatting

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

### 1. Clone Repository
```bash
git clone <repository-url>
cd procurement-system
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, client, server)
npm install

# หรือติดตั้งแยก
cd client && npm install
cd ../server && npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# แก้ไขค่าใน .env ตามต้องการ
```

### 4. Initialize Database
```bash
# สร้าง database และข้อมูลเริ่มต้น
npm run db:setup
```

### 5. Start Development Server
```bash
# เริ่มทั้ง client และ server พร้อมกัน
npm run dev

# หรือเริ่มแยก
npm run dev:client    # Frontend only (port 5173)
npm run dev:server    # Backend only (port 3000)
```

### 6. Open Application
เปิดเบราว์เซอร์แล้วไปที่:
```
http://localhost:5173
```

---

## 📁 Project Structure

```
procurement-system/
├── client/              # Frontend React App
│   └── src/
│       ├── components/  # Reusable components
│       ├── features/    # Feature modules
│       ├── services/    # API services
│       ├── hooks/       # Custom React hooks
│       └── utils/       # Utility functions
│
├── server/              # Backend API
│   ├── config/          # Configuration files
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── models/          # Data models
│   ├── middleware/      # Express middleware
│   └── data/            # Database & seed data
│
└── docs/                # Documentation
```

---

## 🔐 Default Users (สำหรับทดสอบ)

### เจ้าหน้าที่กอง
- **Username**: `staff_treasury`
- **Password**: `password123`
- **Department**: กองคลัง

### Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: ทุกกอง

### ผู้บริหาร
- **Username**: `executive`
- **Password**: `exec123`
- **Access**: ดูทุกกอง (Read-only + Comment)

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify
```

### Projects
```http
GET    /api/projects           # List projects (filtered by role)
GET    /api/projects/:id       # Get project details
POST   /api/projects           # Create project
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
```

### Steps
```http
GET    /api/projects/:id/steps          # List project steps
PUT    /api/projects/:id/steps/:stepId  # Update step
POST   /api/projects/:id/steps/:stepId/complete  # Complete step
```

📖 Full API documentation: [docs/api-design.md](./docs/api-design.md)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test:auth
npm run test:projects
```

---

## 🏗️ Build for Production

```bash
# Build frontend
npm run build:client

# Build backend
npm run build:server

# Build all
npm run build

# Start production server
npm start
```

---

## 📅 Development Roadmap

### ✅ Phase 1: MVP (Current)
- [x] Project structure
- [ ] Authentication system
- [ ] Project management
- [ ] Step management
- [ ] Basic dashboard

### 🔄 Phase 2: Enhanced Features
- [ ] SLA Management
- [ ] Notification System
- [ ] Comment System
- [ ] Basic Reports

### 🔮 Phase 3: Advanced Features
- [ ] Gantt Chart
- [ ] Advanced Analytics
- [ ] File Attachments
- [ ] Email Notifications

### 🚀 Phase 4: Enterprise
- [ ] Advanced Reporting
- [ ] External API Integration
- [ ] Audit Logs
- [ ] System Administration

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

**Last Updated**: November 2024
**Version**: 1.0.0-MVP
