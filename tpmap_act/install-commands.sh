#!/bin/bash
################################################################################
# TPMAP Household Dashboard - Installation Commands
# คัดลอกและรันคำสั่งทีละบล็อก
################################################################################

# =============================================================================
# ส่วนที่ 1: คัดลอกไฟล์จากเครื่อง Local ไปยังเซิร์ฟเวอร์
# =============================================================================

# รันจากเครื่อง LOCAL (แทน user และ your-server ด้วยค่าจริง)
scp -r tpmap_act user@your-server:/tmp/

# หรือใช้ rsync (แนะนำ - เร็วกว่า)
rsync -avz --progress tpmap_act/ user@your-server:/tmp/tpmap_act/

# =============================================================================
# ส่วนที่ 2: SSH เข้าเซิร์ฟเวอร์และสร้างไดเรกทอรี
# =============================================================================

# SSH เข้าเซิร์ฟเวอร์
ssh user@your-server

# สร้างไดเรกทอรีสำหรับ TPMAP
sudo mkdir -p /var/www/tpmap-household-dashboard

# ย้ายไฟล์จาก /tmp
sudo mv /tmp/tpmap_act /var/www/tpmap-household-dashboard/

# =============================================================================
# ส่วนที่ 3: ตั้งค่าสิทธิ์ไฟล์
# =============================================================================

# ตั้งค่า ownership
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard

# ตั้งค่า permissions
sudo chmod -R 755 /var/www/tpmap-household-dashboard

# ตรวจสอบสิทธิ์
ls -la /var/www/tpmap-household-dashboard/

# =============================================================================
# ส่วนที่ 4: ดูไฟล์ Nginx Config ของระบบหลัก
# =============================================================================

# ดูรายชื่อไฟล์ config
ls -la /etc/nginx/sites-available/

# ดูไฟล์ config ที่ active
ls -la /etc/nginx/sites-enabled/

# ดู config ปัจจุบัน (แทน your-site ด้วยชื่อจริง)
sudo cat /etc/nginx/sites-available/your-site | head -50

# =============================================================================
# ส่วนที่ 5: Backup Config เดิมก่อนแก้ไข
# =============================================================================

# สำรองไฟล์ config (แทน your-site ด้วยชื่อจริง)
sudo cp /etc/nginx/sites-available/your-site /etc/nginx/sites-available/your-site.backup

# ตรวจสอบ backup
ls -la /etc/nginx/sites-available/*.backup

# =============================================================================
# ส่วนที่ 6: แก้ไขไฟล์ Nginx Config
# =============================================================================

# เปิดแก้ไขไฟล์ (แทน your-site ด้วยชื่อจริง)
sudo nano /etc/nginx/sites-available/your-site

# หรือใช้ vi
sudo vi /etc/nginx/sites-available/your-site

# =============================================================================
# เพิ่มโค้ดนี้เข้าไปใน server { } block:
# =============================================================================
# location /tpmap/ {
#     alias /var/www/tpmap-household-dashboard/tpmap_act/;
#     index household-dashboard.html indicators-selector.html;
#     try_files $uri $uri/ =404;
#
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header X-XSS-Protection "1; mode=block" always;
# }
# =============================================================================

# หรือใช้คำสั่งเพิ่มโค้ดโดยอัตโนมัติ (ระวัง - ต้องแก้ your-site)
# sudo sed -i '/^[[:space:]]*location \/ {/i\    location /tpmap/ {\n        alias /var/www/tpmap-household-dashboard/tpmap_act/;\n        index household-dashboard.html indicators-selector.html;\n        try_files $uri $uri/ =404;\n    }\n' /etc/nginx/sites-available/your-site

# =============================================================================
# ส่วนที่ 7: ทดสอบและ Reload Nginx
# =============================================================================

# ทดสอบ config
sudo nginx -t

# ถ้าผ่าน ให้ reload nginx
sudo systemctl reload nginx

# หรือ restart nginx
sudo systemctl restart nginx

# ตรวจสอบสถานะ
sudo systemctl status nginx

# =============================================================================
# ส่วนที่ 8: ทดสอบการทำงาน
# =============================================================================

# ทดสอบด้วย curl (แทน your-domain.com ด้วยโดเมนจริง)
curl -I http://your-domain.com/tpmap/household-dashboard.html

curl -I http://your-domain.com/tpmap/indicators-selector.html

# ดู access log
sudo tail -f /var/log/nginx/access.log

# ดู error log
sudo tail -f /var/log/nginx/error.log

# =============================================================================
# ส่วนที่ 9: คำสั่งอื่นๆ ที่มีประโยชน์
# =============================================================================

# ดูรายละเอียดไฟล์
ls -lh /var/www/tpmap-household-dashboard/tpmap_act/

# นับจำนวนไฟล์
ls -1 /var/www/tpmap-household-dashboard/tpmap_act/ | wc -l

# ดูขนาดโฟลเดอร์
du -sh /var/www/tpmap-household-dashboard/

# ค้นหาไฟล์ HTML
find /var/www/tpmap-household-dashboard/ -name "*.html"

# ตรวจสอบว่า nginx รันด้วยพอร์ตอะไรบ้าง
sudo ss -tulpn | grep nginx

# ดู nginx processes
ps aux | grep nginx

# =============================================================================
# ส่วนที่ 10: วิธีแก้ปัญหา (ถ้ามีปัญหา)
# =============================================================================

# ถ้า 404 Not Found - ตรวจสอบ path
ls -la /var/www/tpmap-household-dashboard/tpmap_act/household-dashboard.html

# ถ้า 403 Forbidden - แก้ permissions
sudo chmod -R 755 /var/www/tpmap-household-dashboard
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard

# ถ้า nginx ไม่ reload ได้ - ตรวจสอบ syntax error
sudo nginx -t
sudo tail -50 /var/log/nginx/error.log

# Restart nginx แบบ force
sudo systemctl stop nginx
sudo systemctl start nginx

# เคลียร์ browser cache
# กด Ctrl+Shift+R (Chrome/Firefox) หรือ Cmd+Shift+R (Mac)

# ถ้าต้องการย้อนกลับ config เดิม
sudo cp /etc/nginx/sites-available/your-site.backup /etc/nginx/sites-available/your-site
sudo nginx -t
sudo systemctl reload nginx

# =============================================================================
# ส่วนที่ 11: การอัปเดตในอนาคต
# =============================================================================

# วิธีที่ 1: ใช้ Git Pull
cd /var/www/tpmap-household-dashboard
sudo git pull origin main
sudo systemctl reload nginx

# วิธีที่ 2: ใช้ SCP/SFTP (จาก local)
scp -r tpmap_act/* user@your-server:/tmp/tpmap_act_new/
# แล้ว SSH เข้าเซิร์ฟเวอร์
sudo rsync -av /tmp/tpmap_act_new/ /var/www/tpmap-household-dashboard/tpmap_act/
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo systemctl reload nginx

# =============================================================================
# ส่วนที่ 12: ลบและถอนการติดตั้ง (ถ้าจำเป็น)
# =============================================================================

# ลบโฟลเดอร์
sudo rm -rf /var/www/tpmap-household-dashboard

# ลบ location block ออกจาก nginx config
# (ต้องเปิดไฟล์และลบด้วยมือ)
sudo nano /etc/nginx/sites-available/your-site

# Reload nginx
sudo nginx -t
sudo systemctl reload nginx

################################################################################
# จบการติดตั้ง - เปิดเบราว์เซอร์ทดสอบ
# http://your-domain.com/tpmap/household-dashboard.html
# http://your-domain.com/tpmap/indicators-selector.html
################################################################################
