# คู่มือ Deployment ระบบ OpenGISData-Thailand ฉบับสมบูรณ์

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
3. [ข้อกำหนดของ Server](#ข้อกำหนดของ-server)
4. [การติดตั้ง Procurement System](#การติดตั้ง-procurement-system)
5. [การติดตั้ง TPMAP Dashboard](#การติดตั้ง-tpmap-dashboard)
6. [Nginx Configuration](#nginx-configuration)
7. [การแก้ปัญหาที่พบบ่อย](#การแก้ปัญหาที่พบบ่อย)
8. [คำสั่งบำรุงรักษา](#คำสั่งบำรุงรักษา)

---

## ภาพรวมระบบ

### ระบบที่ติดตั้งบน Server

Server นี้รองรับ **2 ระบบหลัก** ที่รันแบบ subdirectory:

| ระบบ | URL | Type | Backend | Database |
|------|-----|------|---------|----------|
| **Procurement System** | `/procurement/` | React SPA + API | Express.js (PM2) | SQLite |
| **TPMAP Dashboard** | `/tpmap/` | Static HTML | ไม่มี | ไม่มี |

### URL การเข้าถึง

#### Production URLs
- **Procurement System:**
  - http://49.231.27.66/procurement/
  - http://202.29.4.66/procurement/
  - API: http://49.231.27.66/procurement/api/

- **TPMAP Dashboard:**
  - http://49.231.27.66/tpmap/
  - http://202.29.4.66/tpmap/

#### Default Credentials (Procurement System)
- **Username:** admin
- **Password:** password123
- **Role:** ผู้ดูแลระบบ (admin)

---

## สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│              Production Server (49.231.27.66)                │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Nginx (Port 80) - /var/www/html             │  │
│  └──────┬──────────────┬──────────────┬───────────────┬──┘  │
│         │              │              │               │      │
│         ▼              ▼              ▼               ▼      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ /tpmap/  │  │/procure  │  │/procure  │  │ Default  │   │
│  │          │  │ment/     │  │ment/api/ │  │    /     │   │
│  │ (Static) │  │ (React)  │  │ (Proxy)  │  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘   │
│       │             │              │                         │
│       ▼             ▼              ▼                         │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐               │
│  │ /var/   │  │Symlink  │  │ PM2:3000     │               │
│  │www/     │  │ to dist │  │ Express.js   │               │
│  │project- │  │         │  │              │               │
│  │tracking/│  │         │  │ ┌──────────┐ │               │
│  │tpmap_   │  │         │  │ │ SQLite   │ │               │
│  │act/     │  │         │  │ │ Database │ │               │
│  └─────────┘  └─────────┘  │ └──────────┘ │               │
│                             └──────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Paths

```
/var/www/
├── html/
│   ├── procurement -> (symlink to ../OpenGISData-Thailand/procurement-system/client/dist)
│   └── index.nginx-debian.html
│
├── OpenGISData-Thailand/
│   └── procurement-system/
│       ├── client/
│       │   ├── src/
│       │   ├── dist/  (build output)
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── server/
│       │   ├── server.js
│       │   ├── data/database/procurement.db
│       │   └── package.json
│       └── nginx.conf.production
│
└── project-tracking/
    └── tpmap_act/
        ├── household-dashboard.html
        ├── indicators-selector.html
        └── indicators-38-snippet.html

/etc/nginx/
└── sites-available/
    └── procurement  (main config file)
```

---

## ข้อกำหนดของ Server

### Software Requirements

```bash
# 1. Node.js 20.x
node --version  # v20.x.x

# 2. npm
npm --version   # 10.x.x

# 3. PM2 (for Procurement backend)
pm2 --version   # 6.x.x

# 4. Nginx
nginx -v        # nginx/1.24.0

# 5. SQLite3 CLI (optional, for database management)
sqlite3 --version  # 3.45.x

# 6. Git
git --version   # 2.x.x
```

### System Requirements
- **OS:** Ubuntu 20.04+ (Linux)
- **RAM:** ขั้นต่ำ 1GB (แนะนำ 2GB+ สำหรับ Procurement System)
- **Disk:** ขั้นต่ำ 2GB
- **Network:** Port 80 เปิดสำหรับ HTTP

### Installation Prerequisites

```bash
# Update system
sudo apt-get update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install SQLite3 (optional)
sudo apt-get install -y sqlite3

# Install Git
sudo apt-get install -y git
```

---

## การติดตั้ง Procurement System

### วิธีที่ 1: Automated Installation (แนะนำ)

```bash
# 1. Clone repository
cd /tmp
git clone https://github.com/bogarb12/OpenGISData-Thailand.git
cd OpenGISData-Thailand
git checkout claude/pull-opengis-thailand-setup-018ToN3x1p5eZ6HTy1q4VAAi

# 2. รัน automated script
sudo node procurement-system/clean-install.cjs
```

Script จะทำ:
- ✅ ลบ installations เก่า
- ✅ Clone repository ใหม่
- ✅ Build frontend
- ✅ Install backend dependencies
- ✅ Initialize database
- ✅ Configure Nginx
- ✅ Create symlink
- ✅ Start PM2 backend

### วิธีที่ 2: Manual Installation

#### Step 1: Clone Repository

```bash
sudo mkdir -p /var/www/OpenGISData-Thailand
cd /var/www/OpenGISData-Thailand
sudo git clone https://github.com/bogarb12/OpenGISData-Thailand.git .
sudo git checkout claude/pull-opengis-thailand-setup-018ToN3x1p5eZ6HTy1q4VAAi
```

#### Step 2: Build Frontend

```bash
cd /var/www/OpenGISData-Thailand/procurement-system/client

# Install dependencies
npm install

# Build for production
npm run build

# Set permissions
sudo chmod -R 755 dist
```

**⚠️ สำคัญ:** ตรวจสอบว่า `vite.config.js` มี `base: '/procurement'`

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/procurement',  // ⚠️ CRITICAL
  // ...
})
```

#### Step 3: Setup Backend

```bash
cd /var/www/OpenGISData-Thailand/procurement-system/server

# Install dependencies
npm install

# Database จะ initialize อัตโนมัติเมื่อ start server
```

#### Step 4: Create Symlink

```bash
# Create symlink สำหรับ frontend
sudo ln -sf /var/www/OpenGISData-Thailand/procurement-system/client/dist /var/www/html/procurement

# ตรวจสอบ
ls -la /var/www/html/procurement
```

#### Step 5: Start Backend with PM2

```bash
cd /var/www/OpenGISData-Thailand/procurement-system/server

# Start
pm2 start server.js --name procurement-backend

# Save
pm2 save

# Enable startup (optional)
pm2 startup
```

#### Step 6: Update Passwords

```bash
cd /var/www/OpenGISData-Thailand/procurement-system/server

# Generate password hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password123', 10, (err, hash) => { console.log(hash); });"

# Update all users (replace HASH with output from above)
sqlite3 data/database/procurement.db "UPDATE users SET password = '\$2b\$10\$HASH';"
```

---

## การติดตั้ง TPMAP Dashboard

### วิธีที่ 1: Clone from GitHub (แนะนำ)

```bash
# 1. ไปที่ temp directory
cd /tmp

# 2. Clone repository
git clone https://github.com/chingchai/OpenGISData-Thailand.git temp-tpmap
cd temp-tpmap
git checkout 30c75e7aa3fd2ef5ad016fb8c3ad9f094a826940

# 3. ตรวจสอบไฟล์
ls -la tpmap_act/

# 4. Copy ไป production location
sudo mkdir -p /var/www/project-tracking
sudo cp -r tpmap_act /var/www/project-tracking/

# 5. Set permissions
sudo chown -R www-data:www-data /var/www/project-tracking/tpmap_act
sudo chmod -R 755 /var/www/project-tracking/tpmap_act

# 6. ตรวจสอบ
ls -lh /var/www/project-tracking/tpmap_act/*.html

# 7. ลบ temp folder
cd /tmp
rm -rf temp-tpmap
```

### วิธีที่ 2: Download ZIP (เร็วกว่า)

```bash
cd /tmp
wget https://github.com/chingchai/OpenGISData-Thailand/archive/30c75e7aa3fd2ef5ad016fb8c3ad9f094a826940.zip -O tpmap.zip
unzip tpmap.zip
sudo mkdir -p /var/www/project-tracking
sudo cp -r OpenGISData-Thailand-30c75e7aa3fd2ef5ad016fb8c3ad9f094a826940/tpmap_act /var/www/project-tracking/
sudo chown -R www-data:www-data /var/www/project-tracking/tpmap_act
sudo chmod -R 755 /var/www/project-tracking/tpmap_act
rm -rf OpenGISData-Thailand-30c75e7aa3fd2ef5ad016fb8c3ad9f094a826940 tpmap.zip
```

### ไฟล์ที่ติดตั้ง

TPMAP Dashboard ประกอบด้วย:
- `household-dashboard.html` (81KB) - Dashboard หลัก
- `indicators-selector.html` (52KB) - หน้าเลือก indicators
- `indicators-38-snippet.html` (26KB) - 38 indicators snippet
- ไฟล์เอกสาร: README.md, DEPLOYMENT.md, etc.

**หมายเหตุ:** TPMAP เป็น static HTML ไม่ต้อง build, ไม่มี backend, ไม่มี database

---

## Nginx Configuration

### ⚠️ สำคัญมาก: ไฟล์ที่ถูกต้อง

Nginx บน server นี้ใช้ไฟล์:
```
/etc/nginx/sites-available/procurement
```

**ไม่ใช่** `/etc/nginx/sites-available/default` ❌

### Configuration ฉบับสมบูรณ์

แก้ไขไฟล์ `/etc/nginx/sites-available/procurement`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 202.29.4.66 49.231.27.66 _;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    # ==================================================================
    # TPMAP Household Dashboard
    # ==================================================================
    location /tpmap/ {
        alias /var/www/project-tracking/tpmap_act/;
        index household-dashboard.html indicators-selector.html index.html;
        try_files $uri $uri/ =404;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Redirect /tpmap to /tpmap/
    location = /tpmap {
        return 301 /tpmap/;
    }

    # ==================================================================
    # Procurement System - API Proxy to Backend
    # ==================================================================
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

    # ==================================================================
    # Procurement System - Frontend (React SPA)
    # ==================================================================
    # Requires symlink: ln -sf /var/www/OpenGISData-Thailand/procurement-system/client/dist /var/www/html/procurement
    location /procurement/ {
        try_files $uri $uri/ /procurement/index.html;
    }

    # Redirect /procurement to /procurement/
    location = /procurement {
        return 301 /procurement/;
    }

    # ==================================================================
    # Default Location (Other Applications)
    # ==================================================================
    location / {
        try_files $uri $uri/ =404;
    }

    # ==================================================================
    # Security Settings
    # ==================================================================

    # Disable access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Disable access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### วิธีแก้ไข Nginx Config

#### ใช้ Webmin File Manager (แนะนำ):
1. เปิดไฟล์ `/etc/nginx/sites-available/procurement`
2. แทนที่เนื้อหาทั้งหมดด้วย config ด้านบน
3. บันทึกไฟล์

#### ใช้ Command Line:

```bash
# Backup
sudo cp /etc/nginx/sites-available/procurement /etc/nginx/sites-available/procurement.backup

# แก้ไขไฟล์ (copy content จาก config ด้านบน)
sudo nano /etc/nginx/sites-available/procurement

# หรือใช้ tee
sudo tee /etc/nginx/sites-available/procurement > /dev/null <<'EOF'
[วางเนื้อหา config ที่นี่]
EOF
```

### Test และ Reload

```bash
# Test config
sudo nginx -t

# ถ้าผ่าน ให้ reload
sudo systemctl reload nginx

# หรือ restart
sudo systemctl restart nginx
```

### ตรวจสอบ Symlink

```bash
# ดู symlink ที่ใช้งาน
ls -la /etc/nginx/sites-enabled/

# ควรเห็น:
# lrwxrwxrwx 1 root root 38 procurement -> /etc/nginx/sites-available/procurement
```

---

## การแก้ปัญหาที่พบบ่อย

### ปัญหาที่ 1: Procurement - CSS/JS Assets 404

**อาการ:** หน้าเว็บโหลดได้แต่ไม่มี style

**สาเหตุ:**
- Permission ไม่ถูกต้อง
- Symlink ไม่มี
- Vite config ไม่มี `base: '/procurement'`

**แก้ไข:**
```bash
# Fix permissions
chmod -R 755 /var/www/OpenGISData-Thailand/procurement-system/client/dist

# Check symlink
ls -la /var/www/html/procurement

# Recreate if needed
sudo ln -sf /var/www/OpenGISData-Thailand/procurement-system/client/dist /var/www/html/procurement

# Rebuild if needed
cd /var/www/OpenGISData-Thailand/procurement-system/client
npm run build
```

### ปัญหาที่ 2: Procurement - Login ไม่ได้

**อาการ:** กด login แล้วได้ error

**สาเหตุ:**
- API_URL ผิด (ต้องเป็น `/procurement/api`)
- Backend ไม่ได้รัน
- Password hash ไม่ถูกต้อง

**แก้ไข:**
```bash
# 1. Check API_URL
grep "API_URL" /var/www/OpenGISData-Thailand/procurement-system/client/src/services/api.js
# ต้องเป็น: const API_URL = '/procurement/api';

# 2. Check backend
pm2 status
pm2 logs procurement-backend

# 3. Test API
curl http://localhost/procurement/api/

# 4. Test login
curl -X POST http://localhost/procurement/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123","role":"admin"}'
```

### ปัญหาที่ 3: TPMAP - 404 Not Found

**อาการ:** เข้า /tpmap/ แล้วได้ 404

**สาเหตุ:**
- Nginx config ไม่มี location block สำหรับ /tpmap/
- ไฟล์ไม่มีที่ /var/www/project-tracking/tpmap_act/
- Permission ผิด
- แก้ไขผิดไฟล์ nginx (แก้ default แทน procurement)

**แก้ไข:**
```bash
# 1. Check files
ls -la /var/www/project-tracking/tpmap_act/*.html

# 2. Check permissions
sudo chmod -R 755 /var/www/project-tracking/tpmap_act
sudo chown -R www-data:www-data /var/www/project-tracking/tpmap_act

# 3. Check nginx config (⚠️ ไฟล์ที่ถูกต้อง)
grep -A 5 "location /tpmap/" /etc/nginx/sites-available/procurement

# 4. Check which config nginx is using
ls -la /etc/nginx/sites-enabled/
# ต้องเห็น symlink ไปที่ 'procurement'

# 5. Test
curl -I http://localhost/tpmap/indicators-selector.html

# 6. Check error log
sudo tail -20 /var/log/nginx/error.log
```

### ปัญหาที่ 4: Nginx แก้ไขแล้วไม่มีผล

**อาการ:** แก้ config แล้วแต่ยังได้ผลลัพธ์เดิม

**สาเหตุ:**
- แก้ไขผิดไฟล์ (แก้ default แทน procurement)
- Nginx ไม่ได้ reload
- Browser cache

**แก้ไข:**
```bash
# 1. ตรวจสอบว่า nginx ใช้ไฟล์ไหน
ls -la /etc/nginx/sites-enabled/

# 2. แก้ไขไฟล์ที่ถูกต้อง
sudo nano /etc/nginx/sites-available/procurement

# 3. Test และ restart (ไม่ใช่ reload)
sudo nginx -t
sudo systemctl stop nginx
sudo systemctl start nginx

# 4. Clear browser cache
# กด Ctrl+Shift+R
```

### ปัญหาที่ 5: PM2 Backend Crash

**อาการ:** Backend หยุดทำงาน

**สาเหตุ:**
- Database permission
- Port 3000 ถูกใช้
- Code error

**แก้ไข:**
```bash
# Check logs
pm2 logs procurement-backend --lines 50

# Check port
sudo netstat -tlnp | grep 3000

# Restart
pm2 restart procurement-backend

# If still fails, delete and start fresh
pm2 delete procurement-backend
cd /var/www/OpenGISData-Thailand/procurement-system/server
pm2 start server.js --name procurement-backend
pm2 save
```

---

## คำสั่งบำรุงรักษา

### Procurement System

#### Update Code

```bash
cd /var/www/OpenGISData-Thailand
git pull origin claude/pull-opengis-thailand-setup-018ToN3x1p5eZ6HTy1q4VAAi

# Rebuild frontend
cd procurement-system/client
npm run build

# Restart backend
pm2 restart procurement-backend
```

#### Backup Database

```bash
# Create backup directory
sudo mkdir -p /var/backups/procurement

# Backup
sudo cp /var/www/OpenGISData-Thailand/procurement-system/server/data/database/procurement.db \
   /var/backups/procurement/procurement-$(date +%Y%m%d-%H%M%S).db

# List backups
ls -lh /var/backups/procurement/
```

#### View Logs

```bash
# Backend logs
pm2 logs procurement-backend
pm2 logs procurement-backend --lines 100 --nostream

# Nginx logs
sudo tail -50 /var/log/nginx/access.log
sudo tail -50 /var/log/nginx/error.log
```

#### Check Status

```bash
# PM2
pm2 status
pm2 show procurement-backend

# Nginx
sudo systemctl status nginx

# Test endpoints
curl -I http://localhost/procurement/login
curl http://localhost/procurement/api/
```

### TPMAP Dashboard

#### Update Files

```bash
# Re-deploy (if updated in git)
cd /tmp
git clone https://github.com/chingchai/OpenGISData-Thailand.git temp-tpmap
cd temp-tpmap
git checkout 30c75e7aa3fd2ef5ad016fb8c3ad9f094a826940
sudo cp -r tpmap_act /var/www/project-tracking/
sudo chown -R www-data:www-data /var/www/project-tracking/tpmap_act
sudo chmod -R 755 /var/www/project-tracking/tpmap_act
cd /tmp && rm -rf temp-tpmap
```

#### Check Files

```bash
# List files
ls -lh /var/www/project-tracking/tpmap_act/*.html

# Check permissions
ls -la /var/www/project-tracking/tpmap_act/

# Test
curl -I http://localhost/tpmap/indicators-selector.html
```

### Nginx

#### Test Configuration

```bash
# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Check which config is active
sudo nginx -T 2>&1 | grep -E "server_name|location"
```

#### View Active Config

```bash
# See what nginx is actually using
sudo nginx -T 2>&1 | less

# Find specific location
sudo nginx -T 2>&1 | grep -A 10 "location /tpmap/"
sudo nginx -T 2>&1 | grep -A 10 "location /procurement/"
```

---

## Health Check Script

สร้างไฟล์ `/var/www/health-check.sh`:

```bash
#!/bin/bash

echo "=== System Health Check ==="
echo ""

# 1. PM2 Status
echo "1. PM2 Backend:"
pm2 status procurement-backend 2>/dev/null | grep procurement || echo "   ⚠️  PM2 not running"
echo ""

# 2. Nginx
echo "2. Nginx:"
sudo systemctl is-active nginx
echo ""

# 3. Procurement Frontend
echo "3. Procurement Frontend:"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost/procurement/login
echo ""

# 4. Procurement API
echo "4. Procurement API:"
curl -s http://localhost/procurement/api/ | grep -o '"success":true' >/dev/null && echo "   ✅ OK" || echo "   ❌ Failed"
echo ""

# 5. TPMAP
echo "5. TPMAP Dashboard:"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost/tpmap/indicators-selector.html
echo ""

# 6. Disk Space
echo "6. Disk Space:"
df -h /var/www | tail -1
echo ""

echo "=== Check Complete ==="
```

ใช้งาน:
```bash
chmod +x /var/www/health-check.sh
/var/www/health-check.sh
```

---

## Quick Reference

### URLs
- **Procurement:** http://49.231.27.66/procurement/
- **TPMAP:** http://49.231.27.66/tpmap/

### Paths
- **Procurement App:** `/var/www/OpenGISData-Thailand/procurement-system/`
- **TPMAP App:** `/var/www/project-tracking/tpmap_act/`
- **Nginx Config:** `/etc/nginx/sites-available/procurement` ⚠️
- **Symlink:** `/var/www/html/procurement` → `dist`

### Commands
```bash
# Status
pm2 status
sudo systemctl status nginx

# Logs
pm2 logs procurement-backend
sudo tail -f /var/log/nginx/error.log

# Restart
pm2 restart procurement-backend
sudo systemctl reload nginx

# Test
curl -I http://localhost/procurement/login
curl -I http://localhost/tpmap/indicators-selector.html
```

---

## สรุป

เอกสารนี้ครอบคลุม:
- ✅ การติดตั้ง Procurement System (React + Express + SQLite)
- ✅ การติดตั้ง TPMAP Dashboard (Static HTML)
- ✅ Nginx configuration สำหรับทั้ง 2 ระบบ
- ✅ การแก้ปัญหาที่พบบ่อย
- ✅ คำสั่งบำรุงรักษา

**สิ่งสำคัญที่ต้องจำ:**
1. Nginx ใช้ไฟล์ `/etc/nginx/sites-available/procurement` **ไม่ใช่ default**
2. Procurement ต้อง build และมี symlink
3. TPMAP เป็น static files ไม่ต้อง build
4. ทั้ง 2 ระบบใช้ subdirectory deployment
5. Test ก่อน deploy ทุกครั้ง

---

*Last Updated: 2024-11-24*
*Document Version: 1.0*
*Author: Claude Code AI Assistant*
