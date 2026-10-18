# ระบบกำกับติดตามความก้าวหน้าโครงการ - คู่มือ Deployment ฉบับสมบูรณ์

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
3. [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
4. [โครงสร้างไดเรกทอรี](#โครงสร้างไดเรกทอรี)
5. [ข้อกำหนดของ Server](#ข้อกำหนดของ-server)
6. [การ Deploy แบบ Subdirectory](#การ-deploy-แบบ-subdirectory)
7. [ไฟล์ Configuration ที่สำคัญ](#ไฟล์-configuration-ที่สำคัญ)
8. [ขั้นตอนการติดตั้ง](#ขั้นตอนการติดตั้ง)
9. [การแก้ปัญหาที่พบบ่อย](#การแก้ปัญหาที่พบบ่อย)
10. [คำสั่งบำรุงรักษา](#คำสั่งบำรุงรักษา)

---

## ภาพรวมระบบ

### ชื่อระบบ
**ระบบกำกับติดตามความก้าวหน้าโครงการ** (Procurement System)

### วัตถุประสงค์
ระบบสำหรับติดตามความก้าวหน้าของโครงการจัดซื้อจัดจ้างของเทศบาลตำบลหัวทะเล

### URL การเข้าถึง
- **Production:** http://49.231.27.66/procurement/
- **Alternative:** http://202.29.4.66/procurement/
- **API Endpoint:** http://49.231.27.66/procurement/api/

### ข้อมูลสำคัญ
- ระบบถูก deploy ที่ **subdirectory** `/procurement/` **ไม่ใช่ root path**
- ระบบต้องอยู่ร่วมกับ applications อื่นบน server เดียวกัน
- ใช้ Nginx เป็น reverse proxy สำหรับ frontend และ API

---

## สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Production Server (49.231.27.66)                │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Nginx (Port 80)                      │  │
│  │              root /var/www/html                        │  │
│  └──────────────┬────────────────────────┬────────────────┘  │
│                 │                        │                    │
│                 ▼                        ▼                    │
│  ┌──────────────────────┐  ┌────────────────────────────┐   │
│  │   Static Files       │  │    API Proxy               │   │
│  │   /procurement/      │  │    /procurement/api/       │   │
│  │   (Symlink)          │  │    → localhost:3000        │   │
│  └──────────┬───────────┘  └────────────┬───────────────┘   │
│             │                            │                    │
│             ▼                            ▼                    │
│  ┌──────────────────────┐  ┌────────────────────────────┐   │
│  │ /var/www/html/       │  │   PM2 Process Manager      │   │
│  │ procurement          │  │   (Port 3000)              │   │
│  │     ↓ (symlink)      │  │                            │   │
│  │ /var/www/            │  │   Express.js Backend       │   │
│  │ OpenGISData-Thailand/│  │                            │   │
│  │ procurement-system/  │  │   ┌──────────────────┐    │   │
│  │ client/dist/         │  │   │  SQLite Database │    │   │
│  └──────────────────────┘  │   │  (procurement.db)│    │   │
│                             │   └──────────────────┘    │   │
│                             └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Flow การทำงาน

1. **User เข้า `/procurement/`**
   - Nginx serve static files จาก symlink → dist folder
   - React SPA โหลดและจัดการ client-side routing ด้วย React Router

2. **User ทำ API call**
   - Frontend เรียก `/procurement/api/*`
   - Nginx proxy_pass ไปที่ `http://localhost:3000/api/*`
   - Express.js backend ประมวลผลและตอบกลับ
   - Backend เชื่อมต่อ SQLite database

3. **React Router Handling**
   - Router มี `basename="/procurement"`
   - ทุก route จะถูกเติม `/procurement` prefix อัตโนมัติ
   - เช่น `/dashboard` จะกลายเป็น `/procurement/dashboard`

---

## เทคโนโลยีที่ใช้

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 7.2.4
- **Router:** React Router DOM 7.1.1
- **Styling:** Tailwind CSS 4.0.0
- **HTTP Client:** Axios 1.7.9
- **Icons:** Font Awesome
- **State Management:** React Context API
- **Map:** Leaflet.js (สำหรับแสดงแผนที่โครงการ)

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js 4.21.2
- **Database:** SQLite 3 (sqlite3 npm package 5.1.7)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcrypt 5.1.1
- **Process Manager:** PM2 (ใช้รัน backend ใน production)
- **Validation:** express-validator 7.2.1
- **CORS:** cors 2.8.5
- **Logging:** Winston 3.17.0

### Server & Infrastructure
- **OS:** Ubuntu (Linux)
- **Web Server:** Nginx 1.24.0
- **Process Manager:** PM2 6.0.10
- **Git:** Version control
- **Node.js:** v20.x (จาก NodeSource repository)

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git

---

## โครงสร้างไดเรกทอรี

```
/var/www/OpenGISData-Thailand/
└── procurement-system/
    ├── client/                          # Frontend (React)
    │   ├── src/
    │   │   ├── components/              # React components
    │   │   ├── contexts/                # Context API (AuthContext)
    │   │   ├── pages/                   # Page components
    │   │   │   ├── LoginPage.jsx        # หน้า Login
    │   │   │   ├── DashboardPage.jsx    # Dashboard
    │   │   │   ├── ProjectsPage.jsx     # รายการโครงการ
    │   │   │   ├── ProjectDetailPage.jsx
    │   │   │   ├── ProjectMapDashboard.jsx
    │   │   │   ├── OverduePage.jsx
    │   │   │   └── ...
    │   │   ├── services/
    │   │   │   └── api.js               # ⚠️ สำคัญ: API_URL = '/procurement/api'
    │   │   ├── App.jsx                  # ⚠️ สำคัญ: <Router basename="/procurement">
    │   │   └── main.jsx
    │   ├── public/
    │   ├── dist/                        # Build output (หลัง npm run build)
    │   │   ├── index.html
    │   │   ├── assets/
    │   │   │   ├── index-*.js
    │   │   │   └── index-*.css
    │   │   └── clear-storage.html
    │   ├── package.json
    │   ├── vite.config.js               # ⚠️ สำคัญ: base: '/procurement'
    │   └── tailwind.config.js
    │
    ├── server/                          # Backend (Express.js)
    │   ├── controllers/
    │   │   ├── authController.js        # Authentication logic
    │   │   ├── projectController.js
    │   │   └── ...
    │   ├── middleware/
    │   │   ├── auth.js                  # JWT verification
    │   │   └── validation.js            # Input validation
    │   ├── routes/
    │   │   ├── auth.js                  # /api/auth/*
    │   │   ├── projects.js              # /api/projects/*
    │   │   └── ...
    │   ├── data/
    │   │   └── database/
    │   │       ├── procurement.db       # ⚠️ สำคัญ: SQLite database file
    │   │       ├── schema.sql           # Database schema
    │   │       └── seed.sql             # Initial data
    │   ├── uploads/                     # ไฟล์ที่ upload
    │   ├── server.js                    # ⚠️ สำคัญ: Main entry point
    │   └── package.json
    │
    ├── nginx.conf.production            # ⚠️ สำคัญ: Nginx config template
    ├── clean-install.cjs                # Automated installation script
    ├── diagnose-nginx.cjs               # Diagnostic tool
    ├── DEPLOYMENT_GUIDE.md              # เอกสารนี้
    ├── DEPLOYMENT_SUCCESS.md            # Deployment summary
    └── README.md

/var/www/html/
└── procurement → /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist/
    # ⚠️ สำคัญ: Symlink สำหรับให้ Nginx serve ไฟล์ static

/etc/nginx/sites-available/
└── default                             # ⚠️ สำคัญ: Nginx configuration
```

---

## ข้อกำหนดของ Server

### Software Requirements

```bash
# 1. Node.js 20.x
node --version  # v20.x.x

# 2. npm
npm --version   # 10.x.x

# 3. PM2
pm2 --version   # 6.x.x

# 4. Nginx
nginx -v        # nginx/1.24.0

# 5. SQLite3 (CLI tool)
sqlite3 --version  # 3.45.x

# 6. Git
git --version   # 2.x.x
```

### System Requirements
- **OS:** Ubuntu 20.04+ (หรือ Linux distribution อื่นที่รองรับ Node.js)
- **RAM:** ขั้นต่ำ 1GB (แนะนำ 2GB+)
- **Disk Space:** ขั้นต่ำ 2GB (สำหรับ code, dependencies, และ database)
- **Network:** Port 80 เปิดสำหรับ HTTP traffic

### User Permissions
- Backend ควรรันด้วย user ที่มีสิทธิ์เข้าถึง database file
- Frontend static files ต้อง readable โดย `www-data` (Nginx user)
- Nginx ต้องสามารถ proxy ไปที่ `localhost:3000`

---

## การ Deploy แบบ Subdirectory

### ⚠️ สิ่งสำคัญที่ต้องเข้าใจ

ระบบนี้ **ไม่ได้ deploy ที่ root path** (`/`) แต่ deploy ที่ **subdirectory** (`/procurement/`)

นี่คือความท้าทายหลักของการ deploy และต้องแก้ไขในหลายจุด:

### 1. Frontend Configuration

#### **vite.config.js**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/procurement',  // ⚠️ สำคัญมาก: กำหนด base path สำหรับ assets
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

**เหตุผล:** Vite ต้องรู้ว่า assets (CSS, JS) จะถูก serve จาก `/procurement/assets/` ไม่ใช่ `/assets/`

#### **App.jsx**
```javascript
function App() {
  return (
    <AuthProvider>
      <Router basename="/procurement">  {/* ⚠️ สำคัญมาก */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          {/* ... */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

**เหตุผล:** React Router ต้องรู้ว่า base path คือ `/procurement` เพื่อที่จะ:
- Render ถูก route เมื่อ user เข้า `/procurement/dashboard`
- Navigate ไปยัง `/procurement/login` เมื่อไม่ authenticated
- Generate links ที่ถูกต้อง

#### **services/api.js**
```javascript
const API_URL = '/procurement/api';  // ⚠️ สำคัญมาก: ไม่ใช่ '/api'

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/procurement/login';  // ⚠️ ต้องมี /procurement prefix
    }
    return Promise.reject(error);
  }
);
```

**เหตุผล:** API calls ต้องไปที่ `/procurement/api/*` ไม่ใช่ `/api/*`

### 2. Nginx Configuration

#### **Nginx Config Strategy: root + symlink**

เราใช้วิธี **root directive + symlink** แทน **alias directive** เพราะ:
- `alias` มีปัญหากับ `try_files` fallback ใน subdirectory
- `root` + symlink ทำให้ path resolution ทำงานถูกต้อง

```nginx
server {
    listen 80 default_server;
    server_name 202.29.4.66 49.231.27.66 _;

    root /var/www/html;  # ⚠️ ใช้ root, ไม่ใช่ alias

    # API Proxy
    location ^~ /procurement/api/ {
        proxy_pass http://localhost:3000/api/;  # ⚠️ remove /procurement prefix
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend static files
    location /procurement/ {
        try_files $uri $uri/ /procurement/index.html;  # ⚠️ fallback ต้องระบุ full path
    }

    # Redirect /procurement to /procurement/
    location = /procurement {
        return 301 /procurement/;
    }

    # Other applications
    location / {
        try_files $uri $uri/ =404;
    }
}
```

#### **Symlink Setup**
```bash
# สร้าง symlink
ln -sf /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist /var/www/html/procurement

# ตรวจสอบ
ls -la /var/www/html/procurement
# lrwxrwxrwx 1 root root 60 Nov 24 03:53 /var/www/html/procurement -> /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist
```

**เหตุผล:**
- Nginx `root /var/www/html` + `location /procurement/` จะหาไฟล์ที่ `/var/www/html/procurement/`
- Symlink ทำให้ Nginx เข้าถึง dist folder ได้โดยไม่ต้อง copy files
- เมื่อ rebuild frontend, ไฟล์ใหม่จะถูก serve ทันทีผ่าน symlink

### 3. Backend Configuration

Backend **ไม่ต้องรู้** เรื่อง `/procurement` prefix เพราะ:
- Nginx strip prefix ออกก่อน proxy
- Request จาก `/procurement/api/auth/login` จะถูก proxy เป็น `http://localhost:3000/api/auth/login`
- Backend เห็นแค่ `/api/auth/login`

```javascript
// server.js
app.use('/api/auth', authRoutes);       // Backend route: /api/auth
app.use('/api/projects', projectRoutes); // Backend route: /api/projects
// ...

// Nginx จะแปลง:
// /procurement/api/auth/login → proxy_pass → http://localhost:3000/api/auth/login
```

---

## ไฟล์ Configuration ที่สำคัญ

### 1. `/var/www/OpenGISData-Thailand/apps/procurement-system/client/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/procurement',  // ⚠️ CRITICAL: ห้ามลืม!
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

### 2. `/var/www/OpenGISData-Thailand/apps/procurement-system/client/src/services/api.js`

```javascript
import axios from 'axios';

const API_URL = '/procurement/api';  // ⚠️ CRITICAL: ต้องมี /procurement prefix

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/procurement/login';  // ⚠️ CRITICAL: มี /procurement prefix
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password, role) =>
    api.post('/auth/login', { username, password, role }),
  // ...
};
```

### 3. `/var/www/OpenGISData-Thailand/apps/procurement-system/client/src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router basename="/procurement">  {/* ⚠️ CRITICAL: basename */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          {/* ... other routes ... */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 4. `/var/www/OpenGISData-Thailand/apps/procurement-system/server/server.js`

```javascript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - ⚠️ สังเกตว่า backend routes ไม่มี /procurement prefix
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/departments', departmentsRoutes);
// ... other routes ...

// Health check
app.get('/api/', (req, res) => {
  res.json({
    success: true,
    message: 'ระบบกำกับติดตามความก้าวหน้าโครงการ API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      // ...
    }
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Server is ready!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### 5. `/etc/nginx/sites-available/default`

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 202.29.4.66 49.231.27.66 _;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    # API Proxy to Backend
    location ^~ /procurement/api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve procurement frontend (using symlink)
    # Requires: ln -sf /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist /var/www/html/procurement
    location /procurement/ {
        try_files $uri $uri/ /procurement/index.html;
    }

    # Redirect /procurement to /procurement/
    location = /procurement {
        return 301 /procurement/;
    }

    # Default location for other applications
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 6. `/var/www/OpenGISData-Thailand/apps/procurement-system/server/middleware/validation.js`

```javascript
import { body } from 'express-validator';

// ⚠️ สำคัญ: Login validation requires 'role' field
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  body('role')
    .notEmpty().withMessage('User type is required')
    .isIn(['staff', 'admin', 'executive']).withMessage('Invalid user type'),

  handleValidationErrors
];
```

---

## ขั้นตอนการติดตั้ง

### วิธีที่ 1: Clean Install (Automated)

ใช้ script อัตโนมัติสำหรับติดตั้งใหม่ทั้งหมด:

```bash
# 1. Clone repository
cd /tmp
git clone https://github.com/chingchai/OpenGISData-Thailand.git
cd OpenGISData-Thailand
git checkout master

# 2. รัน clean installation script
sudo node apps/procurement-system/clean-install.cjs
```

Script จะทำสิ่งเหล่านี้โดยอัตโนมัติ:
1. ✅ หยุดและลบ PM2 processes เดิม
2. ✅ ลบ Nginx configs เดิม
3. ✅ ลบ directories เดิม
4. ✅ Clone repository ใหม่
5. ✅ Build frontend
6. ✅ Install backend dependencies
7. ✅ Set permissions
8. ✅ Configure Nginx
9. ✅ Create symlink
10. ✅ Start PM2 backend
11. ✅ Test endpoints

### วิธีที่ 2: Manual Installation

#### Step 1: Install Prerequisites

```bash
# Update system
sudo apt-get update

# Install Node.js 20.x (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (if not installed)
sudo apt-get install -y nginx

# Install SQLite3 CLI
sudo apt-get install -y sqlite3

# Install Git (if not installed)
sudo apt-get install -y git
```

#### Step 2: Clone Repository

```bash
# Create directory
sudo mkdir -p /var/www/OpenGISData-Thailand
cd /var/www/OpenGISData-Thailand

# Clone
sudo git clone https://github.com/chingchai/OpenGISData-Thailand.git .
sudo git checkout master
```

#### Step 3: Build Frontend

```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/client

# Install dependencies
npm install

# Build for production
npm run build

# Set permissions
sudo chmod -R 755 dist
```

#### Step 4: Setup Backend

```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server

# Install dependencies
npm install

# Database จะถูก initialize อัตโนมัติเมื่อ start server
```

#### Step 5: Configure Nginx

```bash
# Backup existing config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Copy production config
sudo cp /var/www/OpenGISData-Thailand/apps/procurement-system/nginx.conf.production /etc/nginx/sites-available/default

# Create symlink for frontend
sudo ln -sf /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist /var/www/html/procurement

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 6: Start Backend with PM2

```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server

# Start with PM2
pm2 start server.js --name procurement-backend

# Save PM2 config
pm2 save

# Setup PM2 startup (optional)
pm2 startup
# Follow the instructions provided
```

#### Step 7: Set Correct Passwords

```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server

# Generate password hash for "password123"
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password123', 10, (err, hash) => { console.log(hash); });"

# Copy the output hash, then update all users
sqlite3 data/database/procurement.db "UPDATE users SET password = '\$2b\$10\$YOUR_HASH_HERE';"
```

#### Step 8: Test Installation

```bash
# Test frontend
curl -I http://localhost/procurement/login
# Expected: HTTP/1.1 200 OK, Content-Length: 1291

# Test API
curl http://localhost/procurement/api/
# Expected: JSON with success: true

# Test login
curl -X POST http://localhost/procurement/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123","role":"admin"}'
# Expected: JSON with token
```

---

## การแก้ปัญหาที่พบบ่อย

### ปัญหาที่ 1: CSS/JS Assets 404

**อาการ:** หน้าเว็บโหลดได้แต่ไม่มี style, ไฟล์ .css และ .js ไม่โหลด

**สาเหตุ:**
- Permission ไม่ถูกต้อง
- Symlink ไม่มีหรือชี้ผิด
- Vite config ไม่มี `base: '/procurement'`

**แก้ไข:**
```bash
# ตรวจสอบ permission
chmod -R 755 /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist

# ตรวจสอบ symlink
ls -la /var/www/html/procurement
# ถ้าไม่มี:
sudo ln -sf /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist /var/www/html/procurement

# ตรวจสอบ vite.config.js
grep "base:" /var/www/OpenGISData-Thailand/apps/procurement-system/client/vite.config.js
# ต้องเห็น: base: '/procurement'

# ถ้าไม่ถูกต้อง แก้ไขแล้ว rebuild
cd /var/www/OpenGISData-Thailand/apps/procurement-system/client
npm run build
```

### ปัญหาที่ 2: Login ไม่ได้ - API Error

**อาการ:** กด login แล้วแสดง "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"

**สาเหตุ:**
- `api.js` มี API_URL = '/api' (ไม่มี /procurement prefix)
- Backend ไม่ได้รัน
- Database ไม่มี users หรือ password ไม่ถูกต้อง

**แก้ไข:**
```bash
# 1. ตรวจสอบ API_URL
grep "API_URL" /var/www/OpenGISData-Thailand/apps/procurement-system/client/src/services/api.js
# ต้องเป็น: const API_URL = '/procurement/api';

# ถ้าไม่ถูกต้อง:
cd /var/www/OpenGISData-Thailand/apps/procurement-system/client/src/services
sed -i "s|const API_URL = '/api';|const API_URL = '/procurement/api';|g" api.js
cd /var/www/OpenGISData-Thailand/apps/procurement-system/client
npm run build

# 2. ตรวจสอบ backend
pm2 status
# procurement-backend ต้อง status: online

# ถ้าไม่รัน:
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server
pm2 start server.js --name procurement-backend

# 3. ตรวจสอบ database users
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server
sqlite3 data/database/procurement.db "SELECT username, role FROM users;"

# 4. ทดสอบ login API
curl -X POST http://localhost/procurement/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123","role":"admin"}'
```

### ปัญหาที่ 3: 404 หลัง Login

**อาการ:** Login สำเร็จแต่ redirect ไปที่หน้า 404

**สาเหตุ:**
- React Router ไม่มี `basename="/procurement"`
- Browser cache ยังใช้ JavaScript เวอร์ชันเก่า

**แก้ไข:**
```bash
# 1. ตรวจสอบ basename
grep -n "basename" /var/www/OpenGISData-Thailand/apps/procurement-system/client/src/App.jsx
# ต้องเห็น: <Router basename="/procurement">

# ถ้าไม่มี ต้องแก้ไขใน App.jsx แล้ว rebuild

# 2. Clear browser cache
# กด Ctrl+Shift+Delete แล้วเลือก "Cached images and files"
# หรือกด Ctrl+Shift+R (Hard Refresh)

# 3. ตรวจสอบว่า Nginx serve index.html ได้
curl -I http://localhost/procurement/dashboard
# Expected: HTTP/1.1 200 OK, Content-Length: 1291
```

### ปัญหาที่ 4: PM2 Backend Crash

**อาการ:** Backend หยุดทำงาน, PM2 status แสดง "stopped" หรือ "errored"

**สาเหตุ:**
- Database file permission ไม่ถูกต้อง
- Database schema ไม่ครบ
- Port 3000 ถูกใช้งานอยู่

**แก้ไข:**
```bash
# ดู PM2 logs
pm2 logs procurement-backend --lines 50

# ตรวจสอบ database file
ls -la /var/www/OpenGISData-Thailand/apps/procurement-system/server/data/database/procurement.db

# Set permission
chmod 644 /var/www/OpenGISData-Thailand/apps/procurement-system/server/data/database/procurement.db

# ตรวจสอบ port 3000
sudo netstat -tlnp | grep 3000

# Restart backend
pm2 restart procurement-backend
pm2 logs procurement-backend
```

### ปัญหาที่ 5: Nginx 502 Bad Gateway

**อาการ:** เข้า /procurement/api/* แล้วได้ 502 Bad Gateway

**สาเหตุ:**
- Backend ไม่ได้รัน (PM2 stopped)
- Nginx proxy_pass ชี้ผิด port

**แก้ไข:**
```bash
# ตรวจสอบ backend
pm2 status
pm2 logs procurement-backend

# ตรวจสอบ Nginx config
sudo grep -A 10 "location.*procurement/api" /etc/nginx/sites-available/default
# ต้องเป็น: proxy_pass http://localhost:3000/api/;

# Test Nginx config
sudo nginx -t

# Restart services
pm2 restart procurement-backend
sudo systemctl reload nginx
```

### ปัญหาที่ 6: Database "no such table: users"

**อาการ:** Login error, logs แสดง "no such table: users"

**สาเหตุ:**
- Database ไม่ได้ initialize
- ใช้ database file ผิดตัว

**แก้ไข:**
```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server

# ตรวจสอบว่า database มีตารางหรือไม่
sqlite3 data/database/procurement.db ".tables"

# ถ้าไม่มีตาราง ต้อง restart backend เพื่อ initialize
pm2 restart procurement-backend
pm2 logs procurement-backend --lines 30

# ควรเห็น:
# ✅ Database schema initialized
# ✅ Database seeded successfully
```

### ปัญหาที่ 7: Password ไม่ถูกต้อง

**อาการ:** Login ด้วย username/password ที่ถูกต้องแล้วยังไม่ได้

**สาเหตุ:**
- Password ใน database เป็น placeholder hash (`$2b$10$YourHashedPasswordHere`)
- ใช้ password ผิด

**แก้ไข:**
```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server

# สร้าง hash สำหรับ password123
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password123', 10, (err, hash) => { console.log(hash); });"

# Update ทุก users (เอา hash ที่ได้มาใส่)
sqlite3 data/database/procurement.db "UPDATE users SET password = '\$2b\$10\$YOUR_GENERATED_HASH';"

# ตรวจสอบ
sqlite3 data/database/procurement.db "SELECT username, substr(password,1,30) FROM users LIMIT 3;"
```

### ปัญหาที่ 8: Git Push 403 Forbidden

**อาการ:** `git push` ล้มเหลวด้วย HTTP 403

**สาเหตุ:**
- Branch name ไม่ตรงกับ session ID
- Network issues

**แก้ไข:**
```bash
# ตรวจสอบ branch name
git branch --show-current
# ต้องเป็น: master

# ถ้า push ล้มเหลว ลองใหม่พร้อม retry
git push -u origin master
# ถ้ายังไม่ได้ รอ 2 วินาที แล้วลองอีกครั้ง
```

---

## คำสั่งบำรุงรักษา

### ตรวจสอบสถานะระบบ

```bash
# ตรวจสอบ PM2 backend
pm2 status
pm2 logs procurement-backend --lines 20

# ตรวจสอบ Nginx
sudo systemctl status nginx
sudo nginx -t

# ตรวจสอบ disk space
df -h /var/www/OpenGISData-Thailand/

# ตรวจสอบ database size
ls -lh /var/www/OpenGISData-Thailand/apps/procurement-system/server/data/database/procurement.db
```

### Update Code จาก Git

```bash
cd /var/www/OpenGISData-Thailand

# Pull latest changes
git pull origin master

# Rebuild frontend
cd apps/procurement-system/client
npm run build

# Restart backend (if needed)
pm2 restart procurement-backend
```

### Backup Database

```bash
# Create backup directory
sudo mkdir -p /var/backups/procurement-system

# Backup database
sudo cp /var/www/OpenGISData-Thailand/apps/procurement-system/server/data/database/procurement.db \
   /var/backups/procurement-system/procurement-$(date +%Y%m%d-%H%M%S).db

# List backups
ls -lh /var/backups/procurement-system/
```

### Restore Database

```bash
# Stop backend
pm2 stop procurement-backend

# Restore from backup
sudo cp /var/backups/procurement-system/procurement-20241124-120000.db \
   /var/www/OpenGISData-Thailand/apps/procurement-system/server/data/database/procurement.db

# Set permissions
sudo chmod 644 /var/www/OpenGISData-Thailand/apps/procurement-system/server/data/database/procurement.db

# Start backend
pm2 start procurement-backend
```

### View Logs

```bash
# PM2 backend logs
pm2 logs procurement-backend
pm2 logs procurement-backend --lines 100 --nostream

# Nginx access logs
sudo tail -50 /var/log/nginx/access.log

# Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Nginx logs สำหรับ procurement เท่านั้น
sudo tail -100 /var/log/nginx/access.log | grep "/procurement"
```

### Restart Services

```bash
# Restart backend only
pm2 restart procurement-backend

# Restart all PM2 processes
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Restart both
pm2 restart procurement-backend && sudo systemctl reload nginx
```

### Update User Password

```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/server

# Generate new password hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('newpassword123', 10, (err, hash) => { console.log(hash); });"

# Update specific user
sqlite3 data/database/procurement.db "UPDATE users SET password = '\$2b\$10\$NEW_HASH' WHERE username='admin';"

# Verify
sqlite3 data/database/procurement.db "SELECT username, role FROM users WHERE username='admin';"
```

### Clean Rebuild

```bash
cd /var/www/OpenGISData-Thailand/apps/procurement-system/client

# Remove old build
rm -rf dist

# Remove node_modules and reinstall (ถ้าจำเป็น)
rm -rf node_modules
npm install

# Build fresh
npm run build

# Set permissions
chmod -R 755 dist
```

### Test Endpoints

```bash
# Test frontend
curl -I http://localhost/procurement/login

# Test API health
curl http://localhost/procurement/api/

# Test login
curl -X POST http://localhost/procurement/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123","role":"admin"}'

# Test with external IP
curl -I http://49.231.27.66/procurement/login
```

### Monitor Resources

```bash
# CPU and Memory usage
pm2 monit

# Detailed PM2 info
pm2 show procurement-backend

# System resources
htop  # or top
```

---

## ข้อมูล Users และ Credentials

### Default Users (หลังติดตั้งใหม่)

| Username | Password | Role | Department | Description |
|----------|----------|------|------------|-------------|
| admin | password123 | admin | - | ผู้ดูแลระบบ |
| admin_treasury | password123 | admin | Treasury (1) | ผู้ช่วยผู้ดูแล กองคลัง |
| staff_treasury | password123 | staff | Treasury (1) | เจ้าหน้าที่ กองคลัง |
| staff_engineering | password123 | staff | Engineering (2) | เจ้าหน้าที่ กองช่าง |
| staff_education | password123 | staff | Education (3) | เจ้าหน้าที่ กองการศึกษา |
| staff_health | password123 | staff | Public Health (4) | เจ้าหน้าที่ กองสาธารณสุข |
| staff_municipal | password123 | staff | Municipal Admin (5) | เจ้าหน้าที่ สำนักปลัด |
| staff_strategy | password123 | staff | Planning (6) | เจ้าหน้าที่ กองวิชาการและแผนงาน |
| staff_clerk | password123 | staff | General Affairs (7) | เจ้าหน้าที่ สำนักปลัด |
| executive | password123 | executive | - | ปลัดเทศบาล |
| executive_mayor | password123 | executive | - | นายกเทศมนตรี |

**⚠️ สำคัญ:** เปลี่ยน password ทันทีหลังติดตั้ง production!

### Role Permissions

- **admin:** จัดการทุกอย่างในระบบ (users, projects, departments)
- **staff:** จัดการโครงการในแผนกของตัวเอง, อัปเดต progress
- **executive:** ดูรายงานและ dashboard, ให้ feedback

---

## Database Schema Overview

### Tables

1. **users** - ข้อมูลผู้ใช้งาน
2. **departments** - แผนก/กอง
3. **projects** - โครงการจัดซื้อจัดจ้าง
4. **project_steps** - ขั้นตอนของแต่ละโครงการ
5. **sla_templates** - Template ขั้นตอนตาม SLA
6. **sla_config** - การกำหนด SLA สำหรับแต่ละวิธีจัดซื้อ
7. **comments** - ความคิดเห็นในโครงการ
8. **notifications** - การแจ้งเตือน
9. **audit_log** - บันทึกการเปลี่ยนแปลง
10. **sessions** - JWT refresh tokens

### Views

- **v_projects_overview** - สรุปข้อมูลโครงการ
- **v_delayed_projects** - โครงการที่ล่าช้า
- **v_user_notifications** - การแจ้งเตือนของ user

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Projects
- `GET /api/projects` - List projects (with filters)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/stats` - Get statistics

### Steps
- `GET /api/projects/:id/steps` - Get project steps
- `GET /api/projects/:id/steps/progress` - Get progress
- `PATCH /api/steps/:id/status` - Update step status
- `PUT /api/steps/:id` - Update step
- `GET /api/steps/overdue` - Get overdue steps

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Departments
- `GET /api/departments` - List departments
- `GET /api/departments/:id` - Get department

### Uploads
- `POST /api/upload/images` - Upload images
- `POST /api/upload/documents` - Upload documents

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Supervisor Reviews
- `POST /api/supervisor-reviews` - Create review
- `GET /api/supervisor-reviews/project/:id` - Get reviews by project
- `GET /api/supervisor-reviews/report` - Get report

---

## Performance Optimization

### Frontend
- ใช้ Vite สำหรับ fast builds
- Code splitting (manual chunks) สำหรับ bundle ขนาดใหญ่
- Lazy loading สำหรับ routes
- Image optimization

### Backend
- SQLite ใช้ indexes สำหรับ queries ที่ใช้บ่อย
- Connection pooling
- PM2 cluster mode (ถ้าจำเป็น)

### Nginx
- Gzip compression enabled
- Static file caching
- Keep-alive connections

---

## Security Considerations

### Authentication
- JWT tokens with expiration
- Refresh token mechanism
- Password hashing with bcrypt (10 rounds)
- Session management

### API Security
- CORS configured
- Input validation (express-validator)
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)

### Server Security
- Nginx รันด้วย www-data user (low privileges)
- Backend รันด้วย PM2 (process isolation)
- Database file permissions (644)
- Uploads directory outside public web root

### Recommendations
1. เปลี่ยน default passwords ทันที
2. ใช้ HTTPS (SSL/TLS) ใน production
3. ตั้งค่า firewall (ufw) ให้เปิดแค่ port 80, 443
4. Regular security updates (`apt-get update && apt-get upgrade`)
5. Backup database เป็นประจำ

---

## Monitoring และ Alerts

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Show detailed info
pm2 show procurement-backend

# Enable web dashboard (optional)
pm2 web
# Access at http://localhost:9615
```

### Log Rotation

PM2 มี built-in log rotation:

```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Health Check Script

สร้างไฟล์ `/var/www/OpenGISData-Thailand/apps/procurement-system/health-check.sh`:

```bash
#!/bin/bash

echo "=== Procurement System Health Check ==="
echo ""

# Check PM2
echo "1. PM2 Status:"
pm2 status procurement-backend | grep procurement-backend
echo ""

# Check Nginx
echo "2. Nginx Status:"
sudo systemctl is-active nginx
echo ""

# Check Frontend
echo "3. Frontend Test:"
curl -s -o /dev/null -w "HTTP Code: %{http_code}\n" http://localhost/procurement/login
echo ""

# Check API
echo "4. API Test:"
curl -s http://localhost/procurement/api/ | grep -o '"success":true' || echo "API Error"
echo ""

# Check Database
echo "5. Database:"
ls -lh /var/www/OpenGISData-Thailand/apps/procurement-system/server/data/database/procurement.db
echo ""

# Check Disk Space
echo "6. Disk Space:"
df -h /var/www | tail -1
echo ""

echo "=== Health Check Complete ==="
```

ใช้งาน:
```bash
chmod +x /var/www/OpenGISData-Thailand/apps/procurement-system/health-check.sh
/var/www/OpenGISData-Thailand/apps/procurement-system/health-check.sh
```

---

## Scaling Considerations

### Horizontal Scaling
- ใช้ PM2 cluster mode สำหรับ multi-core
- Load balancer ถ้ามีหลาย servers
- Separate database server

### Vertical Scaling
- เพิ่ม RAM สำหรับ Node.js processes
- เพิ่ม CPU cores สำหรับ PM2 cluster
- SSD สำหรับ database I/O

### Database Scaling
- พิจารณาเปลี่ยนเป็น PostgreSQL หรือ MySQL สำหรับ production ใหญ่
- Database replication
- Caching layer (Redis)

---

## Known Issues และ Limitations

### Current Limitations

1. **Database:** ใช้ SQLite ซึ่งไม่เหมาะกับ high-concurrency
   - **Solution:** พิจารณาเปลี่ยนเป็น PostgreSQL

2. **File Uploads:** เก็บบน local filesystem
   - **Solution:** ใช้ S3-compatible storage

3. **No HTTPS:** ใช้ HTTP เท่านั้น
   - **Solution:** ติดตั้ง Let's Encrypt SSL certificate

4. **Single Server:** ไม่มี redundancy
   - **Solution:** Deploy multi-server with load balancer

5. **No Real-time Updates:** ต้อง refresh หน้าเพื่อดูข้อมูลใหม่
   - **Solution:** เพิ่ม WebSocket (Socket.io)

---

## Development Environment Setup

ถ้าต้องการ develop locally:

```bash
# Clone repository
git clone https://github.com/chingchai/OpenGISData-Thailand.git
cd OpenGISData-Thailand/apps/procurement-system

# Frontend
cd client
npm install
npm run dev  # รันที่ http://localhost:3001

# Backend (terminal ใหม่)
cd server
npm install
node server.js  # รันที่ http://localhost:3000

# เปิด browser ที่ http://localhost:3001
```

**หมายเหตุ:** Dev environment ไม่ต้องใช้ `/procurement` prefix เพราะ Vite dev server มี proxy

---

## CI/CD Pipeline (Future)

แนวทางสำหรับ automated deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Build Frontend
        run: |
          cd client
          npm install
          npm run build

      - name: Deploy to Server
        run: |
          # SSH to server and update
          # rsync files
          # Restart PM2
```

---

## ติดต่อและสนับสนุน

### Repository
- **GitHub:** https://github.com/bogarb12/OpenGISData-Thailand
- **Branch:** master

### Documentation Files
- `DEPLOYMENT_GUIDE.md` - เอกสารนี้
- `DEPLOYMENT_SUCCESS.md` - Deployment summary
- `README.md` - Project overview

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              PROCUREMENT SYSTEM QUICK REFERENCE              │
├─────────────────────────────────────────────────────────────┤
│ Production URL: http://49.231.27.66/procurement/           │
│ Default Login:  admin / password123 / ผู้ดูแลระบบ         │
├─────────────────────────────────────────────────────────────┤
│ PATHS:                                                      │
│  • App:      /var/www/OpenGISData-Thailand/procurement-    │
│              system/                                        │
│  • Frontend: /var/www/html/procurement (symlink)           │
│  • Database: /var/www/OpenGISData-Thailand/procurement-    │
│              system/server/data/database/procurement.db    │
│  • Logs:     ~/.pm2/logs/ or pm2 logs procurement-backend  │
├─────────────────────────────────────────────────────────────┤
│ COMMON COMMANDS:                                            │
│  • Status:   pm2 status                                     │
│  • Logs:     pm2 logs procurement-backend                   │
│  • Restart:  pm2 restart procurement-backend                │
│  • Rebuild:  cd client && npm run build                     │
│  • Database: sqlite3 server/data/database/procurement.db    │
│  • Nginx:    sudo nginx -t && sudo systemctl reload nginx   │
├─────────────────────────────────────────────────────────────┤
│ TROUBLESHOOTING:                                            │
│  • 404 on assets → chmod -R 755 client/dist                 │
│  • Login fails → Check api.js API_URL='/procurement/api'   │
│  • 404 after login → Check App.jsx basename="/procurement" │
│  • 502 error → pm2 restart procurement-backend              │
│  • Clear cache → Ctrl+Shift+R in browser                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Changelog

### Version 1.0 (2024-11-24)
- ✅ Initial deployment สำเร็จ
- ✅ Support subdirectory deployment (`/procurement/`)
- ✅ Nginx root + symlink configuration
- ✅ React Router basename setup
- ✅ API prefix configuration
- ✅ Database initialization และ seeding
- ✅ User authentication ทำงานได้
- ✅ PM2 process management
- ✅ Automated clean install script
- ✅ Diagnostic tools
- ✅ Complete documentation

---

## สรุป

เอกสารนี้ครอบคลุมทุกแง่มุมของ Procurement System deployment:

1. ✅ **สถาปัตยกรรม** - เข้าใจ flow ทั้งหมด
2. ✅ **Configuration** - ไฟล์สำคัญและการตั้งค่า
3. ✅ **Subdirectory Deployment** - เข้าใจความท้าทายและวิธีแก้
4. ✅ **Installation** - ขั้นตอนแบบ automated และ manual
5. ✅ **Troubleshooting** - แก้ปัญหาทั่วไป
6. ✅ **Maintenance** - คำสั่งบำรุงรักษา
7. ✅ **Security** - ความปลอดภัย
8. ✅ **Monitoring** - ตรวจสอบระบบ

**อ่านเอกสารนี้แล้วจะเข้าใจทั้งระบบและสามารถ deploy ได้เอง** 🎉

---

*Last Updated: 2024-11-24*
*Document Version: 1.0*
*Author: Claude Code AI Assistant*
