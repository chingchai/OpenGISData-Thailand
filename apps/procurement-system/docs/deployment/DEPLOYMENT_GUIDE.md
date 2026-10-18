# 🚀 Production Deployment Guide
## ระบบจัดซื้อจัดจ้าง - เทศบาลตำบลหัวทะเล

---

## 📋 ข้อมูลเบื้องต้น

**Production Server:** `49.231.27.66`
**Branch:** `master`
**Project Path:** `/root/OpenGISData-Thailand/apps/procurement-system`

---

## 🎯 วิธี Deploy (Quick Start)

### ขั้นตอนที่ 1: SSH เข้า Server

```bash
ssh root@49.231.27.66
```

### ขั้นตอนที่ 2: ไปที่ Project Directory

```bash
cd /root/OpenGISData-Thailand
```

### ขั้นตอนที่ 3: ตรวจสอบสถานะปัจจุบัน (Optional)

```bash
git status
git log --oneline -3
```

### ขั้นตอนที่ 4: Pull โค้ดล่าสุด

```bash
git fetch origin
git checkout master
git pull origin master
```

### ขั้นตอนที่ 5: Deploy

```bash
cd apps/procurement-system
chmod +x deploy.sh
./deploy.sh
```

**หรือใช้คำสั่งเดียว:**
```bash
cd /root/OpenGISData-Thailand && \
git fetch origin && \
git checkout master && \
git pull origin master && \
cd apps/procurement-system && \
chmod +x deploy.sh && \
./deploy.sh
```

---

## 🔍 สิ่งที่ deploy.sh จะทำ

1. ✅ **Pull โค้ดล่าสุด** จาก GitHub
2. ✅ **Install Backend Dependencies** (`npm install` ใน server/)
3. ✅ **Build Frontend** (`npm run build` ใน client/)
4. ✅ **Restart Server** (ด้วย PM2 หรือ manual)
5. ✅ **Health Check** (ตรวจสอบว่า server ทำงานปกติ)

---

## 📦 ตรวจสอบหลัง Deploy

### 1. ตรวจสอบ Process

```bash
# ถ้าใช้ PM2
pm2 status
pm2 logs procurement-system --lines 50

# ถ้าไม่ใช้ PM2
ps aux | grep node
```

### 2. ตรวจสอบ Server Response

```bash
# ตรวจสอบ Backend
curl http://localhost:3000/health

# หรือ
curl http://localhost:3000/api/auth/health
```

### 3. ตรวจสอบ Frontend

```bash
# ตรวจสอบว่า build files มีหรือไม่
ls -la client/dist/
```

### 4. ทดสอบผ่าน Browser

เปิด browser:
```
http://49.231.27.66
```

ถ้าเห็นหน้า Login = Deploy สำเร็จ! ✅

---

## 🔧 แก้ปัญหาทั่วไป

### ปัญหา 1: Server ไม่ทำงาน

```bash
# ตรวจสอบ logs
cd /root/OpenGISData-Thailand/apps/procurement-system/server
cat ../server.log

# หรือ
pm2 logs
```

### ปัญหา 2: Database Connection Error

```bash
# ตรวจสอบ .env file
cd /root/OpenGISData-Thailand/apps/procurement-system/server
cat .env

# ตรวจสอบว่า Database running
mysql -u root -p -e "SHOW DATABASES;"
```

### ปัญหา 3: Frontend ไม่แสดงผล

```bash
# Rebuild frontend
cd /root/OpenGISData-Thailand/apps/procurement-system/client
npm run build

# ตรวจสอบ dist folder
ls -la dist/
```

### ปัญหา 4: Port ถูกใช้งานอยู่

```bash
# หา process ที่ใช้ port 3000
lsof -i :3000

# Kill process (ระวัง!)
kill -9 <PID>

# หรือใช้
pm2 delete all
```

---

## 🔄 Rollback (ถ้ามีปัญหา)

### วิธี 1: Rollback Git

```bash
cd /root/OpenGISData-Thailand
git log --oneline -10  # ดู commit ที่ต้องการ rollback ไป
git checkout <commit-hash>
cd apps/procurement-system
./deploy.sh
```

### วิธี 2: Restore Backup

```bash
# ถ้ามี backup ไว้
cd /root
cp -r OpenGISData-Thailand-backup OpenGISData-Thailand
cd OpenGISData-Thailand/apps/procurement-system
./deploy.sh
```

---

## 📝 Post-Deployment Checklist

- [ ] Server ทำงานปกติ (`pm2 status` หรือ `ps aux | grep node`)
- [ ] Frontend accessible ที่ http://49.231.27.66
- [ ] Login ได้ปกติ
- [ ] Database connection ทำงาน
- [ ] ลองสร้างโครงการทดสอบ
- [ ] ลอง Export Report (PDF/Excel/CSV)
- [ ] ตรวจสอบ logs ไม่มี error

---

## 🔐 Security Notes

1. **ไม่ควร commit .env file** ที่มี credentials จริง
2. **ควรเปลี่ยน default passwords** ทั้งหมด
3. **ควรตั้ง Firewall** ให้เหลือแค่ port ที่จำเป็น
4. **ควร backup database** เป็นประจำ

---

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ logs ใน `/root/OpenGISData-Thailand/apps/procurement-system/server/logs/`
2. ตรวจสอบ `pm2 logs`
3. ดู DEPLOYMENT.md ใน `procurement-system/` folder

---

## 🎉 Deployment Complete!

หลังจาก deploy สำเร็จ:
1. แจ้งทีมให้ทดสอบระบบ
2. Monitor logs สัก 1-2 ชั่วโมงแรก
3. สร้าง backup database

**Good luck!** 🚀
