# คู่มือติดตั้งระบบจัดซื้อจัดจ้าง บน Ubuntu Server

## 📋 สิ่งที่ต้องเตรียม

### ความต้องการของระบบ
- Ubuntu Server 20.04 LTS หรือสูงกว่า
- RAM อย่างน้อย 2GB
- Disk Space อย่างน้อย 10GB
- สิทธิ์ sudo

### Software ที่ต้องติดตั้ง
- Node.js v18 หรือสูงกว่า
- npm v9 หรือสูงกว่า
- Git
- Nginx (ถ้าต้องการใช้ reverse proxy)
- PM2 (สำหรับรัน process ใน production)

---

## 🚀 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Node.js และ npm

```bash
# Update package list
sudo apt update

# ติดตั้ง Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ตรวจสอบเวอร์ชัน
node --version  # ควรได้ v20.x.x
npm --version   # ควรได้ v10.x.x
```

### 2. ติดตั้ง Git

```bash
sudo apt install -y git
```

### 3. ติดตั้ง PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 4. Clone โปรเจค

```bash
# Clone repository
cd /home/ubuntu  # หรือ directory ที่ต้องการ
git clone https://github.com/bogarb12/OpenGISData-Thailand.git

# เข้าไปใน directory
cd OpenGISData-Thailand/procurement-system
```

---

## 🔧 ตั้งค่า Backend API

### 1. ติดตั้ง Dependencies

```bash
cd server
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
# สร้างไฟล์ .env
cat > .env << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Secret (เปลี่ยนเป็นค่าที่ปลอดภัย)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DB_PATH=./data/database/procurement.db

# CORS Configuration
CORS_ORIGIN=http://your-domain.com

# Logging
LOG_LEVEL=info
EOF

# แก้ไขค่าตามต้องการ
nano .env
```

### 3. สร้างฐานข้อมูล

```bash
# สร้าง directory สำหรับฐานข้อมูล
mkdir -p data/database

# Initialize database
npm run db:init

# ตรวจสอบว่าสร้างสำเร็จ
ls -lh data/database/
```

### 4. ทดสอบรัน Backend

```bash
# รันแบบ development
npm start

# หรือรันแบบ production
NODE_ENV=production npm start
```

**ทดสอบ API:**
```bash
curl http://localhost:3000/api/
```

---

## 🎨 ตั้งค่า Frontend

### 1. ติดตั้ง Dependencies

```bash
cd ../client
npm install
```

### 2. แก้ไข API URL (สำหรับ Production)

```bash
# แก้ไขไฟล์ vite.config.js
nano vite.config.js
```

เปลี่ยนจาก:
```javascript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

เป็น:
```javascript
server: {
  port: 3001,
  host: '0.0.0.0',  // เพิ่มบรรทัดนี้เพื่อให้เข้าถึงจากภายนอกได้
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

### 3. Build Frontend สำหรับ Production

```bash
# Build production bundle
npm run build

# ไฟล์ที่ build จะอยู่ใน dist/
ls -la dist/
```

---

## 🔒 รันระบบด้วย PM2 (Production)

### 1. สร้างไฟล์ Config สำหรับ PM2

```bash
cd /home/ubuntu/OpenGISData-Thailand/procurement-system

# สร้างไฟล์ ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'procurement-api',
      cwd: './server',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'procurement-frontend',
      cwd: './client',
      script: 'npm',
      args: 'run preview -- --port 3001 --host 0.0.0.0',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF
```

### 2. สร้าง Directory สำหรับ Logs

```bash
mkdir -p server/logs client/logs
```

### 3. รันด้วย PM2

```bash
# Start ทั้ง backend และ frontend
pm2 start ecosystem.config.js

# ดู status
pm2 status

# ดู logs
pm2 logs

# ดู logs เฉพาะ backend
pm2 logs procurement-api

# ดู logs เฉพาะ frontend
pm2 logs procurement-frontend
```

### 4. ตั้งค่าให้ PM2 รันตอน boot

```bash
# สร้าง startup script
pm2 startup

# บันทึก process list
pm2 save
```

### 5. คำสั่ง PM2 ที่ใช้บ่อย

```bash
# Restart
pm2 restart all
pm2 restart procurement-api
pm2 restart procurement-frontend

# Stop
pm2 stop all
pm2 stop procurement-api

# Delete/Remove
pm2 delete all
pm2 delete procurement-api

# Monitor
pm2 monit

# Update PM2
pm2 update
```

---

## 🌐 ตั้งค่า Nginx Reverse Proxy (แนะนำ)

### 1. ติดตั้ง Nginx

```bash
sudo apt install -y nginx
```

### 2. สร้าง Config File

```bash
sudo nano /etc/nginx/sites-available/procurement
```

**วาง config นี้:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;  # เปลี่ยนเป็น domain ของคุณ

    # Logging
    access_log /var/log/nginx/procurement-api-access.log;
    error_log /var/log/nginx/procurement-api-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;  # เปลี่ยนเป็น domain ของคุณ

    # Logging
    access_log /var/log/nginx/procurement-frontend-access.log;
    error_log /var/log/nginx/procurement-frontend-error.log;

    # Serve static files from dist
    root /home/ubuntu/OpenGISData-Thailand/procurement-system/client/dist;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable Config และ Restart Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/procurement /etc/nginx/sites-enabled/

# ทดสอบ config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# ตรวจสอบ status
sudo systemctl status nginx
```

### 4. ติดตั้ง SSL Certificate (แนะนำ)

```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# ขอ SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal จะถูกตั้งค่าอัตโนมัติ
# ทดสอบ renewal
sudo certbot renew --dry-run
```

---

## 🔐 ตั้งค่า Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP และ HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# ตรวจสอบ status
sudo ufw status
```

---

## 📊 Monitoring และ Maintenance

### ดู Logs

```bash
# PM2 logs
pm2 logs --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/procurement-*-access.log
sudo tail -f /var/log/nginx/procurement-*-error.log

# System logs
sudo journalctl -u nginx -f
```

### Backup Database

```bash
# สร้าง backup script
cat > /home/ubuntu/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DB_PATH="/home/ubuntu/OpenGISData-Thailand/procurement-system/server/data/database/procurement.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/procurement_backup_$DATE.db

# เก็บ backup ล่าสุด 7 วัน
find $BACKUP_DIR -name "procurement_backup_*.db" -mtime +7 -delete

echo "Backup completed: procurement_backup_$DATE.db"
EOF

chmod +x /home/ubuntu/backup-db.sh
```

### ตั้งค่า Cron สำหรับ Auto Backup

```bash
# เปิด crontab
crontab -e

# เพิ่มบรรทัดนี้ (backup ทุกวันเวลา 2 นาฬิกา)
0 2 * * * /home/ubuntu/backup-db.sh
```

---

## 🔄 Update ระบบ

```bash
cd /home/ubuntu/OpenGISData-Thailand

# Pull latest code
git pull origin main

# Update backend
cd procurement-system/server
npm install
pm2 restart procurement-api

# Update frontend
cd ../client
npm install
npm run build
pm2 restart procurement-frontend

# หรือ restart ทั้งหมด
pm2 restart all
```

---

## 🚨 Troubleshooting

### ตรวจสอบว่า Service รันอยู่หรือไม่

```bash
# PM2 status
pm2 status

# ตรวจสอบ port
sudo netstat -tlnp | grep -E '3000|3001'

# หรือ
sudo lsof -i :3000
sudo lsof -i :3001
```

### ปัญหา Permission

```bash
# ตั้งค่า ownership
sudo chown -R $USER:$USER /home/ubuntu/OpenGISData-Thailand

# ตั้งค่า permissions
chmod -R 755 /home/ubuntu/OpenGISData-Thailand
chmod -R 644 /home/ubuntu/OpenGISData-Thailand/procurement-system/server/data/database/
```

### ปัญหา Database

```bash
# Reset database
cd /home/ubuntu/OpenGISData-Thailand/procurement-system/server
npm run db:reset

# Verify database
node scripts/verifyDatabase.js
```

### ปัญหา Memory

```bash
# เพิ่ม swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📝 URLs สำหรับเข้าใช้งาน

### Development Mode
- Frontend: `http://your-server-ip:3001`
- Backend API: `http://your-server-ip:3000/api`

### Production Mode (with Nginx)
- Frontend: `http://your-domain.com`
- Backend API: `http://api.your-domain.com`
- หรือ: `http://your-domain.com/api`

---

## 👥 Default Users

| Username | Password | Role | สิทธิ์ |
|----------|----------|------|--------|
| admin | password123 | admin | ทุกอย่าง |
| staff_treasury | password123 | staff | กองคลัง |
| staff_engineering | password123 | staff | กองช่าง |
| staff_education | password123 | staff | กองการศึกษา |
| executive_mayor | password123 | executive | ดูอย่างอย่าง |

⚠️ **สำคัญ:** เปลี่ยนรหัสผ่านหลังติดตั้ง!

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ logs: `pm2 logs`
2. ตรวจสอบ status: `pm2 status`
3. ตรวจสอบ nginx: `sudo nginx -t`
4. ดู error logs: `tail -f server/logs/api-error.log`

---

## 📄 License

© 2024 เทศบาลตำบลหัวทะเล
