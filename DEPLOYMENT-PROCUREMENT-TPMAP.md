# คู่มือการ Deploy: Procurement System + TPMAP Dashboard

คู่มือนี้แสดงวิธีการติดตั้งระบบ Procurement System ร่วมกับ TPMAP Dashboard บนเซิร์ฟเวอร์ Ubuntu + nginx

## 📋 ระบบที่จะติดตั้ง

1. **Procurement System**
   - Frontend: React/Vue/Angular (Static files)
   - Backend: Node.js/Express API (port 3000)
   - URL: `http://your-ip/`

2. **TPMAP Dashboard**
   - Static HTML dashboard
   - URL: `http://your-ip/tpmap/`

---

## 🚀 ขั้นตอนการติดตั้ง

### 1. Clone Repository

```bash
cd /var/www
git clone https://github.com/chingchai/OpenGISData-Thailand.git
# หรือ
git clone git@github.com:bogarb12/OpenGISData-Thailand.git
```

### 2. ดึงไฟล์ TPMAP (ถ้ายังไม่มี)

```bash
cd /var/www/OpenGISData-Thailand
git remote add upstream https://github.com/chingchai/OpenGISData-Thailand.git
git fetch upstream
git checkout upstream/master -- tpmap_act/
```

### 3. ตั้งค่าสิทธิ์

```bash
# ตั้งค่าสิทธิ์สำหรับ TPMAP
sudo chown -R www-data:www-data /var/www/OpenGISData-Thailand/tpmap_act
sudo chmod -R 755 /var/www/OpenGISData-Thailand/tpmap_act

# ตั้งค่าสิทธิ์สำหรับ Procurement System (ถ้าจำเป็น)
sudo chown -R www-data:www-data /root/OpenGISData-Thailand/procurement-system/client/dist
sudo chmod -R 755 /root/OpenGISData-Thailand/procurement-system/client/dist
```

### 4. คัดลอก nginx Configuration

```bash
# คัดลอกไฟล์ config ตัวอย่าง
sudo cp /var/www/OpenGISData-Thailand/nginx-procurement-tpmap.conf.example \
    /etc/nginx/sites-available/procurement-system

# หรือถ้ามีไฟล์อยู่แล้ว ให้ backup ก่อน
sudo cp /etc/nginx/sites-available/procurement-system \
    /etc/nginx/sites-available/procurement-system.backup
```

### 5. แก้ไข nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/procurement-system
```

แก้ไขค่าเหล่านี้ให้ตรงกับเซิร์ฟเวอร์ของคุณ:

```nginx
# บรรทัด 17
server_name 49.231.27.66;  # เปลี่ยนเป็น IP หรือ domain ของคุณ

# บรรทัด 30
root /root/OpenGISData-Thailand/procurement-system/client/dist;  # เปลี่ยน path ถ้าต้องการ

# บรรทัด 46
proxy_pass http://localhost:3000;  # เปลี่ยน port ถ้า backend รันที่ port อื่น

# บรรทัด 66
alias /var/www/OpenGISData-Thailand/tpmap_act/;  # เปลี่ยน path ถ้าต้องการ
```

บันทึกไฟล์: `Ctrl+X` → `Y` → `Enter`

### 6. เปิดใช้งาน Site

```bash
# สร้าง symbolic link (ถ้ายังไม่มี)
sudo ln -s /etc/nginx/sites-available/procurement-system \
    /etc/nginx/sites-enabled/procurement-system

# ตรวจสอบ config
sudo nginx -t

# ถ้าผ่าน จะแสดง:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 7. Reload nginx

```bash
sudo systemctl reload nginx

# ตรวจสอบสถานะ
sudo systemctl status nginx
```

---

## ✅ ทดสอบการทำงาน

### ทดสอบ Procurement System

```bash
# ทดสอบ Frontend
curl -I http://49.231.27.66/

# ทดสอบ Backend API
curl -I http://49.231.27.66/api/
```

### ทดสอบ TPMAP Dashboard

```bash
# ทดสอบ household dashboard
curl -I http://49.231.27.66/tpmap/household-dashboard.html

# ทดสอบ indicators selector
curl -I http://49.231.27.66/tpmap/indicators-selector.html
```

### เปิดใน Browser

- **Procurement System:** `http://49.231.27.66/`
- **TPMAP Household Dashboard:** `http://49.231.27.66/tpmap/household-dashboard.html`
- **TPMAP Indicators Selector:** `http://49.231.27.66/tpmap/indicators-selector.html`

---

## 🔍 การแก้ปัญหา

### ปัญหา: 404 Not Found

```bash
# ตรวจสอบว่าไฟล์มีอยู่จริง
ls -la /var/www/OpenGISData-Thailand/tpmap_act/household-dashboard.html
ls -la /root/OpenGISData-Thailand/procurement-system/client/dist/index.html

# ตรวจสอบ error log
sudo tail -f /var/log/nginx/error.log
```

### ปัญหา: 403 Forbidden

```bash
# แก้ไข permissions
sudo chown -R www-data:www-data /var/www/OpenGISData-Thailand/tpmap_act
sudo chmod -R 755 /var/www/OpenGISData-Thailand/tpmap_act

# ตรวจสอบ SELinux (ถ้ามี)
sudo getenforce
sudo setenforce 0  # ปิดชั่วคราวเพื่อทดสอบ
```

### ปัญหา: API ไม่ทำงาน (502 Bad Gateway)

```bash
# ตรวจสอบว่า backend รันอยู่หรือไม่
netstat -tulpn | grep 3000
# หรือ
lsof -i :3000

# ตรวจสอบ logs ของ backend
# (ขึ้นกับว่าคุณใช้ pm2, systemd, หรืออื่นๆ)
pm2 logs
# หรือ
sudo journalctl -u your-backend-service -f
```

### ปัญหา: nginx -t ไม่ผ่าน

```bash
# ดู error message จาก nginx -t
sudo nginx -t

# ตรวจสอบ syntax ของไฟล์ config
sudo nginx -T | grep -A 20 "procurement-system"
```

### ปัญหา: TPMAP แสดงผลไม่ถูกต้อง

```bash
# เคลียร์ browser cache
# Chrome: Ctrl+Shift+R
# Firefox: Ctrl+F5

# ตรวจสอบว่าไฟล์ถูกต้อง
head -20 /var/www/OpenGISData-Thailand/tpmap_act/household-dashboard.html
```

---

## 📁 โครงสร้างไฟล์

```
/var/www/OpenGISData-Thailand/
├── tpmap_act/                          # TPMAP Dashboard
│   ├── household-dashboard.html
│   ├── indicators-selector.html
│   ├── indicators-38-snippet.html
│   ├── DEPLOYMENT.md
│   └── ...
├── provinces.geojson                   # GeoJSON data
├── districts.geojson
├── subdistricts.geojson
└── nginx-procurement-tpmap.conf.example  # nginx config ตัวอย่าง

/root/OpenGISData-Thailand/
└── procurement-system/
    └── client/
        └── dist/                       # Procurement Frontend
            └── index.html

/etc/nginx/
├── sites-available/
│   └── procurement-system              # nginx config
└── sites-enabled/
    └── procurement-system -> ../sites-available/procurement-system
```

---

## 🔄 การอัพเดทระบบ

### อัพเดท TPMAP Dashboard

```bash
cd /var/www/OpenGISData-Thailand
git fetch upstream
git checkout upstream/master -- tpmap_act/
sudo systemctl reload nginx
```

### อัพเดท Procurement System

```bash
cd /root/OpenGISData-Thailand/procurement-system
git pull origin master

# Build frontend
cd client
npm install
npm run build

# Restart backend
pm2 restart procurement-api
# หรือ
sudo systemctl restart procurement-backend
```

---

## 🔒 Security (Production)

### 1. ติดตั้ง SSL/TLS Certificate

```bash
# ติดตั้ง certbot
sudo apt install certbot python3-certbot-nginx -y

# รัน certbot
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# ตรวจสอบการต่ออายุอัตโนมัติ
sudo certbot renew --dry-run
```

### 2. ตั้งค่า Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. ซ่อน nginx version

```bash
sudo nano /etc/nginx/nginx.conf

# เพิ่มบรรทัดนี้ใน http block
server_tokens off;

sudo systemctl reload nginx
```

---

## 📊 Monitoring

### ดู Access Logs

```bash
# Real-time
sudo tail -f /var/log/nginx/procurement_access.log

# สถิติ
sudo cat /var/log/nginx/procurement_access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
```

### ดู Error Logs

```bash
sudo tail -f /var/log/nginx/procurement_error.log
```

### ตรวจสอบ nginx status

```bash
sudo systemctl status nginx
sudo nginx -V  # ดู version และ modules
```

---

## 📚 เอกสารเพิ่มเติม

- [TPMAP Quick Start](tpmap_act/QUICK-START-SUBDIRECTORY.md)
- [TPMAP Deployment Guide](tpmap_act/DEPLOYMENT.md)
- [nginx Configuration Example](nginx-procurement-tpmap.conf.example)
- [GeoJSON Deployment Guide](DEPLOY.md)

---

## 💡 Tips

1. **Backup ก่อนแก้ไข config**
   ```bash
   sudo cp /etc/nginx/sites-available/procurement-system{,.backup}
   ```

2. **ทดสอบก่อน reload**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **ใช้ symbolic link แทนการคัดลอก**
   - แก้ไขได้ที่ sites-available เพียงที่เดียว
   - ง่ายต่อการจัดการหลาย sites

4. **เก็บ logs สำหรับแต่ละ site แยกกัน**
   - ง่ายต่อการ debug และ monitoring
