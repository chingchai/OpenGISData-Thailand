# 🚀 คู่มือ Deploy ไปยัง Production Server (49.231.27.66)

## ขั้นตอนการ Deploy

### วิธีที่ 1: ใช้ Script อัตโนมัติ (แนะนำ)

```bash
# 1. SSH เข้า Production Server
ssh root@49.231.27.66

# 2. ไปที่โฟลเดอร์โปรเจค
cd /root/OpenGISData-Thailand/apps/procurement-system

# 3. รัน git-deploy script (Pull + Build + Restart ครั้งเดียว)
./git-deploy.sh
```

### วิธีที่ 2: แยกขั้นตอน

```bash
# 1. SSH เข้า Production Server
ssh root@49.231.27.66

# 2. ไปที่โฟลเดอร์โปรเจค
cd /root/OpenGISData-Thailand/apps/procurement-system

# 3. Pull โค้ดล่าสุด
./pull.sh

# 4. Deploy
./deploy.sh
```

### วิธีที่ 3: Manual (ทำเองทีละขั้นตอน)

```bash
# 1. SSH เข้า Production Server
ssh root@49.231.27.66

# 2. ไปที่โฟลเดอร์โปรเจค
cd /root/OpenGISData-Thailand/apps/procurement-system

# 3. Pull โค้ดล่าสุด
git fetch origin
git checkout master
git pull origin master

# 4. ติดตั้ง dependencies (ถ้าจำเป็น)
cd server
npm install

# 5. Build frontend
cd ../client
npm install
npm run build

# 6. Restart server
cd ../server
pkill -f "node server.js"
nohup node server.js > /tmp/server.log 2>&1 &

# 7. ตรวจสอบ
curl http://localhost:3000/health
```

---

## ✅ ตรวจสอบการ Deploy

หลังจาก Deploy เสร็จแล้ว ตรวจสอบว่าระบบทำงานปกติ:

```bash
# ตรวจสอบ Process
ps aux | grep "node server.js"

# ตรวจสอบ Log
tail -f /tmp/server.log

# ทดสอบ API
curl http://localhost:3000/health
```

---

## 🌐 เข้าใช้งานระบบ

- **Production URL:** http://49.231.27.66
- **Health Check:** http://49.231.27.66/health

---

## 📦 Features ที่เพิ่มล่าสุด

### Commit e2273af - อัพเดต Deployment Scripts
- อัพเดตชื่อ branch ใน deployment scripts
- แก้ไข DEPLOYMENT.md ให้ตรงกับ branch ปัจจุบัน

### Commit 748df69 - ระบบแผนที่และพิกัดโครงการด้วย GeoJSON
- ✅ เพิ่ม MapPicker component สำหรับเลือกตำแหน่งบนแผนที่
- ✅ เพิ่ม ProjectMapDashboard แสดงโครงการทั้งหมดบนแผนที่
- ✅ เพิ่มฟิลด์ location (GeoJSON) ในฐานข้อมูล
- ✅ ค่าเริ่มต้น: สำนักงานเทศบาลตำบลหัวทะเล จ.นครราชสีมา (102.0983, 14.9753)
- ✅ รองรับ Leaflet และ React-Leaflet สำหรับแผนที่
- ✅ แสดง Marker สีต่างกันตามสถานะโครงการ
- ✅ ระบบกรองและค้นหาบนแผนที่

---

## 🔐 ข้อมูล Login ทดสอบ

### Admin
- Username: `admin`
- Password: `password123`

### Staff
- Username: `staff_engineering`
- Password: `password123`

### Executive
- Username: `executive_mayor`
- Password: `password123`

---

## 🔧 แก้ไขปัญหา

### ปัญหา: ไม่สามารถเข้าใช้งานผ่าน http://49.231.27.66

**วิธีแก้:**

1. ตรวจสอบว่า Server ทำงานอยู่:
```bash
ps aux | grep "node server.js"
curl http://localhost:3000/health
```

2. ตรวจสอบ Reverse Proxy (nginx/apache):
```bash
systemctl status nginx
# หรือ
systemctl status apache2
```

3. ตรวจสอบ Firewall:
```bash
ufw status
# หรือ
iptables -L
```

### ปัญหา: 401 Unauthorized หลัง Login

**วิธีแก้:** Clear browser cache และ localStorage
```javascript
// เปิด Browser Console (F12) และพิมพ์
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📞 สรุป

1. **Push โค้ด:** ทำผ่าน Claude Code (เสร็จแล้ว ✅)
2. **Deploy:** SSH เข้า 49.231.27.66 และรัน `./git-deploy.sh`
3. **เข้าใช้งาน:** http://49.231.27.66

---

**Last Updated:** 2025-11-20
**Latest Commit:** e2273af
