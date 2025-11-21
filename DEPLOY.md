# คู่มือการ Deploy บน Ubuntu Server + Nginx

## ข้อกำหนดเบื้องต้น
- Ubuntu Server (18.04 ขึ้นไป)
- Nginx ติดตั้งแล้ว
- Git ติดตั้งแล้ว
- สิทธิ์ sudo

## วิธีการติดตั้งและ Pull Code

### 1. ติดตั้ง Git (ถ้ายังไม่ได้ติดตั้ง)
```bash
sudo apt update
sudo apt install git -y
```

### 2. สร้าง SSH Key สำหรับ GitHub (ถ้าใช้ git@github.com)
```bash
# สร้าง SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# คัดลอก public key
cat ~/.ssh/id_ed25519.pub
```

จากนั้นเพิ่ม SSH key ไปที่ GitHub:
- ไปที่ https://github.com/settings/keys
- คลิก "New SSH key"
- วาง public key ที่คัดลอกมา

### 3. กำหนดตำแหน่งที่จะเก็บข้อมูล
```bash
# สร้างโฟลเดอร์สำหรับเว็บไซต์
sudo mkdir -p /var/www/opengisdata
sudo chown -R $USER:$USER /var/www/opengisdata
```

### 4. Clone Repository
```bash
cd /var/www/opengisdata
git clone git@github.com:chingchai/OpenGISData-Thailand.git
cd OpenGISData-Thailand
```

### 5. ตั้งค่า Nginx

สร้างไฟล์ config สำหรับ nginx:
```bash
sudo nano /etc/nginx/sites-available/opengisdata
```

วางข้อมูลนี้:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # เปลี่ยนเป็น domain ของคุณ

    root /var/www/opengisdata/OpenGISData-Thailand;
    index index.html;

    location / {
        try_files $uri $uri/ =404;

        # Enable CORS for GeoJSON files
        if ($request_filename ~* \.(geojson)$) {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods 'GET, OPTIONS';
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        }
    }

    # Cache GeoJSON files
    location ~* \.geojson$ {
        expires 1d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # Compression for JSON files
    gzip on;
    gzip_types application/json application/geo+json;
    gzip_min_length 1000;
}
```

### 6. เปิดใช้งาน Site
```bash
# สร้าง symbolic link
sudo ln -s /etc/nginx/sites-available/opengisdata /etc/nginx/sites-enabled/

# ตรวจสอบ config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## การ Pull Code อัพเดทใหม่

### วิธีที่ 1: Pull แบบ Manual
```bash
cd /var/www/opengisdata/OpenGISData-Thailand
git pull origin master
```

### วิธีที่ 2: ใช้สคริปต์อัตโนมัติ

ดูไฟล์ `deploy.sh` ที่มาพร้อมกัน:
```bash
# ให้สิทธิ์ execute
chmod +x deploy.sh

# รันสคริปต์
./deploy.sh
```

### วิธีที่ 3: ตั้งค่า Cron Job (อัพเดทอัตโนมัติ)
```bash
# แก้ไข crontab
crontab -e

# เพิ่มบรรทัดนี้เพื่ออัพเดททุกวันเวลา 3:00 น.
0 3 * * * cd /var/www/opengisdata/OpenGISData-Thailand && git pull origin master >> /var/log/git-pull.log 2>&1
```

## การตรวจสอบ

### ตรวจสอบว่า Nginx ทำงาน
```bash
sudo systemctl status nginx
```

### ทดสอบเข้าถึงไฟล์ GeoJSON
```bash
# ทดสอบจาก localhost
curl http://localhost/provinces.geojson

# หรือเปิดจาก browser
# http://your-domain.com/provinces.geojson
```

### ตรวจสอบ Git Status
```bash
cd /var/www/opengisdata/OpenGISData-Thailand
git status
git log -1  # ดู commit ล่าสุด
```

## การแก้ปัญหา

### ถ้า Permission Denied
```bash
sudo chown -R www-data:www-data /var/www/opengisdata/OpenGISData-Thailand
```

### ถ้า Git Pull ขึ้น Conflict
```bash
cd /var/www/opengisdata/OpenGISData-Thailand
git fetch origin
git reset --hard origin/master
```

### ถ้า Nginx ไม่ทำงาน
```bash
# ดู log
sudo tail -f /var/log/nginx/error.log

# ตรวจสอบ config
sudo nginx -t
```

## ตัวอย่างการใช้งาน API

ข้อมูล GeoJSON สามารถเข้าถึงได้ผ่าน URL:
- `http://your-domain.com/provinces.geojson` - ข้อมูลจังหวัด 77 จังหวัด
- `http://your-domain.com/districts.geojson` - ข้อมูลอำเภอ 928 อำเภอ
- `http://your-domain.com/subdistricts.geojson` - ข้อมูลตำบล 7,367 ตำบล
- `http://your-domain.com/reg_royin.geojson` - ภูมิภาค 7 ภูมิภาค
- `http://your-domain.com/reg_nesdb.geojson` - ภูมิภาค 6 ภูมิภาค

## Security (ถ้าต้องการ HTTPS)

### ติดตั้ง Let's Encrypt SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```
