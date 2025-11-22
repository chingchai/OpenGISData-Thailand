# คู่มือการติดตั้งระบบบน Production Server (Ubuntu + Nginx)

## ภาพรวม

เว็บนี้ออกแบบให้ทำงานเป็น **subdirectory** ของระบบหลักที่มีอยู่แล้ว ไม่ใช่ standalone site

**URL ตัวอย่าง:**
- `https://your-domain.com/tpmap/household-dashboard.html`
- `https://your-domain.com/tpmap/indicators-selector.html`

## ข้อกำหนดเบื้องต้น

- Ubuntu Server 20.04 LTS หรือใหม่กว่า
- **Nginx ติดตั้งและทำงานอยู่แล้ว** (ระบบหลักรันอยู่)
- สิทธิ์ root หรือ sudo
- ระบบหลักมี nginx config อยู่แล้วใน `/etc/nginx/sites-available/`

## ขั้นตอนการติดตั้ง

### 1. ตรวจสอบ Nginx ที่มีอยู่

```bash
# ตรวจสอบว่า Nginx ทำงานอยู่
sudo systemctl status nginx

# ดูไฟล์ config ของระบบหลัก
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# ตรวจสอบ config ปัจจุบัน
sudo nginx -t
```

### 2. สร้างไดเรกทอรีและคัดลอกไฟล์

```bash
# สร้างไดเรกทอรีสำหรับ TPMAP
sudo mkdir -p /var/www/tpmap-household-dashboard

# วิธีที่ 1: ใช้ Git (แนะนำ)
cd /var/www/tpmap-household-dashboard
sudo git clone https://github.com/bogarb12/OpenGISData-Thailand.git .

# วิธีที่ 2: ใช้ SCP/SFTP จากเครื่อง local
# scp -r tpmap_act user@your-server:/tmp/
# sudo mv /tmp/tpmap_act /var/www/tpmap-household-dashboard/

# ตั้งค่าสิทธิ์
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo chmod -R 755 /var/www/tpmap-household-dashboard
```

### 3. เพิ่ม Location Block ใน Nginx Config ของระบบหลัก

**สำคัญ:** ไม่ต้องสร้างไฟล์ config ใหม่ แต่เพิ่ม location block เข้าไปในไฟล์ที่มีอยู่

```bash
# หาไฟล์ config ของระบบหลัก
# ตัวอย่าง: /etc/nginx/sites-available/your-main-site
# หรือ: /etc/nginx/sites-available/default

# ดูรายชื่อไฟล์ config
ls -la /etc/nginx/sites-available/

# เปิดไฟล์ config ของระบบหลัก (แทน 'your-main-site' ด้วยชื่อจริง)
sudo nano /etc/nginx/sites-available/your-main-site
```

**เพิ่ม location block นี้เข้าไปใน `server { }` block:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/your-main-site;

    # ระบบหลักที่มีอยู่แล้ว
    location / {
        # main site configuration
    }

    # เพิ่ม location block สำหรับ TPMAP
    location /tpmap/ {
        alias /var/www/tpmap-household-dashboard/tpmap_act/;
        index household-dashboard.html indicators-selector.html;
        try_files $uri $uri/ =404;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

**บันทึกและทดสอบ:**

```bash
# ทดสอบคอนฟิก
sudo nginx -t

# ถ้า OK ให้ reload nginx
sudo systemctl reload nginx

# ตรวจสอบ error log ถ้ามีปัญหา
sudo tail -f /var/log/nginx/error.log
```

### 4. ทดสอบการทำงาน

```bash
# ทดสอบการเข้าถึงด้วย curl
curl -I http://your-domain.com/tpmap/household-dashboard.html
curl -I http://your-domain.com/tpmap/indicators-selector.html

# ตรวจสอบ nginx access log
sudo tail -f /var/log/nginx/access.log

# ตรวจสอบ nginx error log
sudo tail -f /var/log/nginx/error.log
```

**เปิดเว็บเบราว์เซอร์และทดสอบ:**
- `http://your-domain.com/tpmap/household-dashboard.html`
- `http://your-domain.com/tpmap/indicators-selector.html`
- `https://your-domain.com/tpmap/household-dashboard.html` (ถ้ามี SSL)

### 5. (ทางเลือก) ตั้งค่า Custom Subdirectory Path

หากต้องการใช้ path อื่นแทน `/tpmap/` เช่น `/household/` หรือ `/dashboard/`:

```nginx
# แทนที่ /tpmap/ ด้วย path ที่ต้องการ
location /household/ {
    alias /var/www/tpmap-household-dashboard/tpmap_act/;
    index household-dashboard.html indicators-selector.html;
    try_files $uri $uri/ =404;
}

# หรือ
location /dashboard/tpmap/ {
    alias /var/www/tpmap-household-dashboard/tpmap_act/;
    index household-dashboard.html indicators-selector.html;
    try_files $uri $uri/ =404;
}
```

**URL ที่ได้:**
- `https://your-domain.com/household/household-dashboard.html`
- `https://your-domain.com/dashboard/tpmap/household-dashboard.html`

---

## การอัปเดตแอปพลิเคชัน

### วิธีที่ 1: ใช้ Git Pull (แนะนำ)

```bash
cd /var/www/tpmap-household-dashboard
sudo git pull origin main  # หรือ branch ที่ต้องการ
sudo systemctl reload nginx
```

### วิธีที่ 2: ใช้ SCP/SFTP

```bash
# จากเครื่อง local
scp -r /path/to/local/tpmap_act/* user@server:/var/www/tpmap-household-dashboard/tpmap_act/

# บนเซิร์ฟเวอร์
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo systemctl reload nginx
```

---

## การแก้ไขปัญหาที่พบบ่อย

### 1. ไม่สามารถเข้าถึงเว็บไซต์ได้

```bash
# ตรวจสอบสถานะ Nginx
sudo systemctl status nginx

# ตรวจสอบคอนฟิก
sudo nginx -t

# ดู error logs
sudo tail -50 /var/log/nginx/error.log
```

### 2. Permission Denied

```bash
# ตั้งค่าสิทธิ์ใหม่
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo chmod -R 755 /var/www/tpmap-household-dashboard
```

### 3. SSL Certificate ไม่ทำงาน

```bash
# ต่ออายุ certificate
sudo certbot renew

# หรือขอใหม่
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --force-renewal
```

### 4. 502 Bad Gateway

```bash
# ตรวจสอบว่า Nginx ทำงานปกติ
sudo systemctl restart nginx

# ตรวจสอบ SELinux (ถ้ามี)
sudo setenforce 0
```

---

## Performance Optimization (ทางเลือก)

### 1. เปิดใช้งาน HTTP/2

แก้ไขในไฟล์ `/etc/nginx/sites-available/tpmap-household-dashboard`:

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

### 2. เพิ่ม Browser Caching

```nginx
location ~* \.(html|css|js)$ {
    expires 7d;
    add_header Cache-Control "public, must-revalidate";
}
```

### 3. เปิดใช้งาน Brotli Compression (นอกเหนือจาก gzip)

```bash
# ติดตั้ง Brotli module
sudo apt install nginx-module-brotli -y

# เพิ่มในคอนฟิก nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json;
```

---

## Security Best Practices

### 1. ตั้งค่า Fail2Ban (ป้องกัน Brute Force)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. ซ่อน Nginx Version

เพิ่มใน `/etc/nginx/nginx.conf`:

```nginx
server_tokens off;
```

### 3. จำกัด Request Rate

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=30r/m;
limit_req zone=one burst=5;
```

### 4. ตั้งค่า CORS (ถ้าจำเป็น)

```nginx
location / {
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
}
```

---

## Monitoring และ Logging

### 1. ตรวจสอบ Resource Usage

```bash
# CPU และ Memory
htop

# Disk usage
df -h

# Nginx processes
ps aux | grep nginx
```

### 2. Log Rotation

สร้างไฟล์ `/etc/logrotate.d/tpmap-household-dashboard`:

```
/var/log/nginx/tpmap-household-dashboard-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

---

## Backup Strategy

### แบ็กอัปแอปพลิเคชัน

```bash
# สร้างสคริปต์แบ็กอัป
sudo nano /usr/local/bin/backup-tpmap.sh
```

เนื้อหาสคริปต์:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/tpmap"
APP_DIR="/var/www/tpmap-household-dashboard"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/tpmap-backup-$DATE.tar.gz $APP_DIR

# เก็บแบ็กอัป 7 วันล่าสุด
find $BACKUP_DIR -name "tpmap-backup-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/tpmap-backup-$DATE.tar.gz"
```

```bash
# ให้สิทธิ์รัน
sudo chmod +x /usr/local/bin/backup-tpmap.sh

# ตั้งค่า cron job (รันทุกวันเวลา 2:00 AM)
sudo crontab -e
# เพิ่มบรรทัด:
0 2 * * * /usr/local/bin/backup-tpmap.sh
```

---

## การติดต่อและการสนับสนุน

หากมีปัญหาหรือคำถาม:
- GitHub Issues: https://github.com/bogarb12/OpenGISData-Thailand/issues
- Email: [your-email@example.com]

---

**หมายเหตุ:** ระบบนี้ใช้ไฟล์ HTML แบบ standalone ไม่มี backend หรือ database ดังนั้นการติดตั้งจึงเรียบง่ายและไม่ต้องติดตั้ง PHP, Node.js หรือ Database ใดๆ
