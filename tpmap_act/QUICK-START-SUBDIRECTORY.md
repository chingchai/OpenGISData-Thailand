# Quick Start: ติดตั้ง TPMAP เป็น Subdirectory

เอกสารนี้แสดงวิธีติดตั้งแบบรวดเร็วสำหรับเพิ่ม TPMAP เข้าไปในระบบที่มีอยู่แล้ว

## ขั้นตอนย่อ (5 ขั้นตอน)

### 1. คัดลอกไฟล์ไปเซิร์ฟเวอร์

```bash
# จากเครื่อง local
scp -r tpmap_act user@your-server:/tmp/

# หรือใช้ Git
ssh user@your-server
cd /tmp
git clone https://github.com/bogarb12/OpenGISData-Thailand.git
```

### 2. ย้ายไฟล์ไปที่ต้องการ

```bash
sudo mkdir -p /var/www/tpmap-household-dashboard
sudo mv /tmp/tpmap_act /var/www/tpmap-household-dashboard/
# หรือ
sudo mv /tmp/OpenGISData-Thailand/tpmap_act /var/www/tpmap-household-dashboard/
```

### 3. ตั้งค่าสิทธิ์

```bash
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo chmod -R 755 /var/www/tpmap-household-dashboard
```

### 4. แก้ไข Nginx Config

```bash
# หาไฟล์ config ของระบบหลัก
ls /etc/nginx/sites-enabled/

# แก้ไขไฟล์ (เปลี่ยน 'your-site' เป็นชื่อจริง)
sudo nano /etc/nginx/sites-available/your-site
```

**เพิ่มโค้ดนี้เข้าไปใน `server { }` block:**

```nginx
location /tpmap/ {
    alias /var/www/tpmap-household-dashboard/tpmap_act/;
    index household-dashboard.html indicators-selector.html;
    try_files $uri $uri/ =404;
}
```

**บันทึกไฟล์:** กด `Ctrl+X` จากนั้น `Y` แล้ว `Enter`

### 5. Reload Nginx

```bash
# ทดสอบ config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## ทดสอบการทำงาน

เปิดเบราว์เซอร์และเข้า:
- `http://your-domain.com/tpmap/household-dashboard.html`
- `http://your-domain.com/tpmap/indicators-selector.html`

---

## วิธีแก้ปัญหา

### ปัญหา: 404 Not Found

```bash
# ตรวจสอบ path
ls -la /var/www/tpmap-household-dashboard/tpmap_act/

# ตรวจสอบ permissions
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo chmod -R 755 /var/www/tpmap-household-dashboard

# ดู error log
sudo tail -f /var/log/nginx/error.log
```

### ปัญหา: 403 Forbidden

```bash
# แก้ permissions
sudo chmod -R 755 /var/www/tpmap-household-dashboard

# ตรวจสอบ SELinux (ถ้ามี)
sudo setenforce 0
```

### ปัญหา: CSS/JS ไม่ทำงาน

ระบบนี้ไม่มี external CSS/JS files - ทุกอย่างอยู่ใน HTML แล้ว
ถ้ามีปัญหาลองเคลียร์ browser cache

---

## ตัวอย่าง Config สำหรับระบบต่างๆ

### WordPress

```nginx
server {
    server_name example.com;
    root /var/www/wordpress;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    # เพิ่มส่วนนี้
    location /tpmap/ {
        alias /var/www/tpmap-household-dashboard/tpmap_act/;
        index household-dashboard.html;
        try_files $uri $uri/ =404;
    }
}
```

### Node.js/Express

```nginx
server {
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    # เพิ่มส่วนนี้
    location /tpmap/ {
        alias /var/www/tpmap-household-dashboard/tpmap_act/;
        index household-dashboard.html;
        try_files $uri $uri/ =404;
    }
}
```

### Static HTML

```nginx
server {
    server_name example.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # เพิ่มส่วนนี้
    location /tpmap/ {
        alias /var/www/tpmap-household-dashboard/tpmap_act/;
        index household-dashboard.html;
        try_files $uri $uri/ =404;
    }
}
```

---

## Custom Path

ถ้าต้องการใช้ path อื่นแทน `/tpmap/`:

```nginx
# ใช้ /household/ แทน
location /household/ {
    alias /var/www/tpmap-household-dashboard/tpmap_act/;
    index household-dashboard.html;
    try_files $uri $uri/ =404;
}

# URL: http://example.com/household/household-dashboard.html
```

---

## คำสั่งที่มีประโยชน์

```bash
# ตรวจสอบ nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# ดู logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# ทดสอบด้วย curl
curl -I http://your-domain.com/tpmap/household-dashboard.html
```

---

## เอกสารเพิ่มเติม

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - คู่มือแบบละเอียด
- [`nginx-subdirectory-example.conf`](./nginx-subdirectory-example.conf) - ตัวอย่าง config
- [`README.md`](./README.md) - เอกสารหลัก
