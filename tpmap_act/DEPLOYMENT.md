# คู่มือการติดตั้งระบบบน Production Server (Ubuntu + Nginx)

## ข้อกำหนดเบื้องต้น

- Ubuntu Server 20.04 LTS หรือใหม่กว่า
- Nginx
- สิทธิ์ root หรือ sudo
- (Optional) Domain name สำหรับใช้ HTTPS

## ขั้นตอนการติดตั้ง

### 1. อัปเดตระบบและติดตั้ง Nginx

```bash
# อัปเดตแพ็กเกจ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Nginx
sudo apt install nginx -y

# เริ่มและเปิดใช้งาน Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# ตรวจสอบสถานะ
sudo systemctl status nginx
```

### 2. สร้างไดเรกทอรีสำหรับแอปพลิเคชัน

```bash
# สร้างไดเรกทอรีหลัก
sudo mkdir -p /var/www/tpmap-household-dashboard

# คัดลอกไฟล์โปรเจกต์ไปยังเซิร์ฟเวอร์
# วิธีที่ 1: ใช้ Git (แนะนำ)
cd /var/www/tpmap-household-dashboard
sudo git clone https://github.com/bogarb12/OpenGISData-Thailand.git .

# วิธีที่ 2: ใช้ SCP/SFTP
# scp -r /path/to/local/tpmap_act user@server:/var/www/tpmap-household-dashboard/

# ตั้งค่าสิทธิ์
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo chmod -R 755 /var/www/tpmap-household-dashboard
```

### 3. ตั้งค่า Nginx

```bash
# คัดลอกไฟล์คอนฟิก
sudo cp /var/www/tpmap-household-dashboard/tpmap_act/nginx.conf \
    /etc/nginx/sites-available/tpmap-household-dashboard

# แก้ไขคอนฟิกให้เหมาะกับโดเมนของคุณ
sudo nano /etc/nginx/sites-available/tpmap-household-dashboard
# เปลี่ยน "your-domain.com" เป็นโดเมนจริงของคุณ

# สร้าง symbolic link ไปยัง sites-enabled
sudo ln -s /etc/nginx/sites-available/tpmap-household-dashboard \
    /etc/nginx/sites-enabled/

# ลบคอนฟิกเริ่มต้น (ถ้ามี)
sudo rm /etc/nginx/sites-enabled/default

# ทดสอบคอนฟิก
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. ตั้งค่า Firewall (UFW)

```bash
# เปิดใช้งาน UFW
sudo ufw enable

# อนุญาตการเข้าถึง HTTP และ HTTPS
sudo ufw allow 'Nginx Full'

# หรือระบุพอร์ตเอง
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# อนุญาต SSH (สำคัญ!)
sudo ufw allow OpenSSH

# ตรวจสอบสถานะ
sudo ufw status
```

### 5. ติดตั้ง SSL Certificate ด้วย Let's Encrypt (แนะนำ)

```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx -y

# ขอ SSL Certificate (แทน your-domain.com ด้วยโดเมนจริง)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# ตอบคำถามตามที่ Certbot ถาม:
# - Email address สำหรับการแจ้งเตือน
# - ยอมรับเงื่อนไขการใช้งาน
# - เลือก redirect HTTP to HTTPS (แนะนำ: Yes)

# ทดสอบการต่ออายุอัตโนมัติ
sudo certbot renew --dry-run
```

### 6. ตรวจสอบการทำงาน

```bash
# ตรวจสอบ logs
sudo tail -f /var/log/nginx/tpmap-household-dashboard-access.log
sudo tail -f /var/log/nginx/tpmap-household-dashboard-error.log

# ทดสอบการเข้าถึง
curl http://your-domain.com
curl https://your-domain.com
```

เปิดเว็บเบราว์เซอร์และเข้าถึง:
- `http://your-domain.com/household-dashboard.html`
- `http://your-domain.com/indicators-selector.html`

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
