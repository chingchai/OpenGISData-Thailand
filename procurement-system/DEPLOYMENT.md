# 🚀 Deployment Guide - ระบบจัดซื้อจัดจ้าง

คู่มือการ Deploy และการอัพเดตระบบจัดซื้อจัดจ้าง

## 📋 สารบัญ

- [Quick Start](#quick-start)
- [การ Pull โค้ดล่าสุด](#การ-pull-โค้ดล่าสุด)
- [การ Deploy แบบเต็มรูปแบบ](#การ-deploy-แบบเต็มรูปแบบ)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## 🎯 Quick Start

### สำหรับ Production Server (49.231.27.66)

```bash
# 1. SSH เข้า Server
ssh root@49.231.27.66

# 2. ไปที่โฟลเดอร์โปรเจค
cd /root/OpenGISData-Thailand/procurement-system

# 3. Pull และ Deploy ด้วยคำสั่งเดียว
chmod +x pull.sh deploy.sh
./deploy.sh
```

---

## 📥 การ Pull โค้ดล่าสุด

### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
cd /root/OpenGISData-Thailand/procurement-system
chmod +x pull.sh
./pull.sh
```

### วิธีที่ 2: Manual

```bash
cd /root/OpenGISData-Thailand/procurement-system

# Fetch updates
git fetch origin

# Checkout branch
git checkout claude/opengisdata-thailand-setup-01HZXbbUHkwi6iwLWuYHfazb

# Pull latest
git pull origin claude/opengisdata-thailand-setup-01HZXbbUHkwi6iwLWuYHfazb

# ตรวจสอบสถานะ
git status
git log --oneline -5
```

---

## 🚀 การ Deploy แบบเต็มรูปแบบ

### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
cd /root/OpenGISData-Thailand/procurement-system
chmod +x deploy.sh
./deploy.sh
```

Script จะทำงานตามลำดับ:
1. ✅ Pull โค้ดล่าสุด
2. ✅ Install backend dependencies
3. ✅ Build frontend
4. ✅ Restart server (PM2 หรือ manual)
5. ✅ ตรวจสอบสถานะ server

### วิธีที่ 2: Manual (ทีละขั้นตอน)

```bash
# 1. Pull โค้ดล่าสุด
cd /root/OpenGISData-Thailand/procurement-system
git fetch origin
git checkout claude/opengisdata-thailand-setup-01HZXbbUHkwi6iwLWuYHfazb
git pull origin claude/opengisdata-thailand-setup-01HZXbbUHkwi6iwLWuYHfazb

# 2. Install backend dependencies
cd server
npm install

# 3. Build frontend
cd ../client
npm install
npm run build

# 4a. Restart with PM2 (ถ้ามี)
cd ../server
pm2 restart all
pm2 save

# 4b. Restart แบบ Manual (ถ้าไม่มี PM2)
cd ../server
pkill -f 'node server.js'
nohup npm start > ../server.log 2>&1 &

# 5. ตรวจสอบสถานะ
curl http://localhost:3000/health
# หรือ
pm2 status
```

---

## 🔧 การแก้ไขปัญหา

### ปัญหา: 401 Unauthorized หลัง Deploy

**สาเหตุ:** Token เก่าใน localStorage หมดอายุ

**วิธีแก้:**

1. เปิดเบราว์เซอร์ไปที่ `http://49.231.27.66`
2. กด **F12** เปิด Console
3. พิมพ์คำสั่ง:
```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```
4. Login ใหม่

### ปัญหา: Server ไม่ทำงาน

**ตรวจสอบ Log:**

```bash
# ถ้าใช้ PM2
pm2 logs procurement-system

# ถ้าใช้ manual
tail -f /root/OpenGISData-Thailand/procurement-system/server.log
```

**Restart Server:**

```bash
cd /root/OpenGISData-Thailand/procurement-system/server

# ด้วย PM2
pm2 restart all

# แบบ Manual
pkill -f 'node server.js'
npm start
```

### ปัญหา: Port 3000 ถูกใช้งานอยู่

```bash
# หา Process ที่ใช้ port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# หรือ
pkill -f 'node server.js'
```

### ปัญหา: Dependencies ไม่ครบ

```bash
# ลบ node_modules และติดตั้งใหม่
cd /root/OpenGISData-Thailand/procurement-system/server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 ตรวจสอบสถานะระบบ

### ตรวจสอบ Git Status

```bash
cd /root/OpenGISData-Thailand/procurement-system
git status
git log --oneline -5
git branch -a
```

### ตรวจสอบ Server

```bash
# ตรวจสอบว่า Server ทำงานหรือไม่
curl http://localhost:3000/health

# ตรวจสอบ Process
ps aux | grep node

# ถ้าใช้ PM2
pm2 status
pm2 logs
```

### ตรวจสอบ Port

```bash
# ดู Port ที่เปิดอยู่
netstat -tulpn | grep :3000
# หรือ
lsof -i :3000
```

---

## 🔑 ข้อมูล Login ทดสอบ

### Admin
- **Username:** `admin`
- **Password:** `password123`
- **Role:** `admin`

### Staff (เจ้าหน้าที่)
- **Username:** `staff_engineering`
- **Password:** `password123`
- **Role:** `staff`

### Executive (ผู้บริหาร)
- **Username:** `executive_mayor`
- **Password:** `password123`
- **Role:** `executive`

---

## 📝 Git Branches

- **Main Branch:** `master`
- **Current Branch:** `claude/opengisdata-thailand-setup-01HZXbbUHkwi6iwLWuYHfazb`

---

## 🔗 URLs

- **Production:** `http://49.231.27.66`
- **Local Development:** `http://localhost:3000`
- **API Endpoint:** `/api`

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา

---

## 📜 Recent Updates

### Latest Features (Commit b8af0c9)
- ✅ แก้ไข Server ให้ serve static frontend files
- ✅ ติดตั้ง pdfkit และ dependencies ที่ขาดหาย
- ✅ เพิ่ม Lucide Icons แทน Emoji
- ✅ ปรับปรุงปุ่มให้มองเห็นชัดเจน (iOS Design)
- ✅ รองรับ client-side routing

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0
