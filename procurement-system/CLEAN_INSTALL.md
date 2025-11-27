# Clean Installation Script

สคริป Node.js สำหรับติดตั้ง Procurement System แบบ clean installation

## คุณสมบัติ

✅ ลบและสร้างใหม่ทั้งหมด - ไม่มีไฟล์เก่าหลงเหลือ
✅ ติดตั้งอัตโนมัติทุกขั้นตอน - ไม่ต้องรันคำสั่งทีละขั้น
✅ ตรวจสอบ errors - หยุดทันทีเมื่อเจอปัญหา
✅ แสดงสถานะทุกขั้นตอน - รู้ว่าเกิดอะไรขึ้น
✅ ทดสอบ endpoints - ยืนยันว่าระบบทำงานได้

## ความต้องการ

- Node.js 18+ (ติดตั้งแล้วบน production server)
- sudo privileges
- Git
- PM2 (จะถูกใช้โดย script)
- Nginx (ติดตั้งแล้วบน production server)

## วิธีใช้

### ขั้นตอนที่ 1: Clone repository (ถ้ายังไม่มี)

```bash
cd /tmp
git clone https://github.com/bogarb12/OpenGISData-Thailand.git
cd OpenGISData-Thailand
git checkout claude/pull-opengis-thailand-setup-018ToN3x1p5eZ6HTy1q4VAAi
```

### ขั้นตอนที่ 2: รัน installation script

```bash
sudo node procurement-system/clean-install.cjs
```

**หรือ** ถ้าต้องการทำให้ executable:

```bash
chmod +x procurement-system/clean-install.cjs
sudo ./procurement-system/clean-install.cjs
```

## สิ่งที่ Script ทำ

### Step 1: Cleanup
- หยุด PM2 processes ทั้งหมด
- ลบ Nginx configurations เก่า
- ลบโฟลเดอร์ติดตั้งเก่าทั้งหมด:
  - `/var/www/OpenGISData-Thailand`
  - `/root/OpenGISData-Thailand/procurement-system`
  - `/home/ubuntu/OpenGISData-Thailand/procurement-system`

### Step 2: Clone Repository
- Clone repository ไปที่ `/var/www/OpenGISData-Thailand`
- Checkout ไปยัง branch ที่ถูกต้อง

### Step 3: Build Frontend
- ติดตั้ง dependencies (npm install)
- Build frontend (npm run build)
- สร้าง optimized production files

### Step 4: Setup Backend
- ติดตั้ง backend dependencies
- สร้าง database directory

### Step 5: Set Permissions
- ตั้ง owner ของ frontend files เป็น `www-data` (สำหรับ Nginx)
- ตั้ง owner ของ backend files เป็น user ที่รัน PM2

### Step 6: Setup Nginx
- Copy Nginx configuration ไปยัง `/etc/nginx/sites-available/`
- สร้าง symlink ใน `/etc/nginx/sites-enabled/`
- ทดสอบและ reload Nginx

### Step 7: Start Backend
- Start backend ด้วย PM2
- ตั้งชื่อ process เป็น `procurement-backend`
- Save PM2 configuration

### Step 8: Testing
- ทดสอบ HTML endpoint
- ทดสอบ CSS/JS assets
- ทดสอบ API endpoint

## ผลลัพธ์

เมื่อติดตั้งสำเร็จ ระบบจะพร้อมใช้งานที่:

- **Frontend:** http://49.231.27.66/procurement/
- **API:** http://49.231.27.66/procurement/api/

## คำสั่งที่มีประโยชน์

```bash
# ตรวจสอบสถานะ PM2
pm2 status

# ดู logs ของ backend
pm2 logs procurement-backend

# Restart backend
pm2 restart procurement-backend

# ตรวจสอบ Nginx status
sudo systemctl status nginx

# ดู Nginx error logs
sudo tail -f /var/log/nginx/error.log

# ดู Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Script หยุดทำงานระหว่างทาง

ตรวจสอบ error message ที่แสดง - script จะบอกว่าหยุดที่ขั้นตอนไหน

### Frontend ไม่โหลด (404)

```bash
# ตรวจสอบว่าไฟล์ dist ถูกสร้าง
ls -la /var/www/OpenGISData-Thailand/procurement-system/client/dist/

# ตรวจสอบ permissions
ls -la /var/www/OpenGISData-Thailand/procurement-system/client/dist/ | head

# ควรเห็น owner เป็น www-data:www-data
```

### Backend ไม่ทำงาน (API 502)

```bash
# ตรวจสอบ PM2 status
pm2 status

# ดู logs
pm2 logs procurement-backend

# Restart
pm2 restart procurement-backend
```

### Nginx error

```bash
# Test configuration
sudo nginx -t

# ดู error logs
sudo tail -50 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## การ Uninstall

หากต้องการลบระบบทั้งหมด:

```bash
# หยุด PM2
pm2 stop procurement-backend
pm2 delete procurement-backend
pm2 save

# ลบไฟล์
sudo rm -rf /var/www/OpenGISData-Thailand
sudo rm -f /etc/nginx/sites-enabled/procurement
sudo rm -f /etc/nginx/sites-available/procurement

# Reload Nginx
sudo nginx -s reload
```

## ข้อควรระวัง

⚠️ **Script นี้จะลบข้อมูลทั้งหมด!** รวมถึง database files ใน `server/data/`
⚠️ **ต้องใช้ sudo** เพื่อเข้าถึง system directories
⚠️ **ใช้เวลาประมาณ 5-10 นาที** ขึ้นอยู่กับความเร็ว internet และ CPU

## Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ error logs (`pm2 logs`, `nginx error.log`)
2. ดู troubleshooting section ด้านบน
3. รัน script อีกครั้ง (script ถูกออกแบบให้รันซ้ำได้)
