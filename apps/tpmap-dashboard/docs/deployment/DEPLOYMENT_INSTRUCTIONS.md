# คำสั่งสำหรับ Deploy บน Production Server

## 🖥️ Production Server Info
- **Webmin Shell**: https://49.231.27.66:10000/shell/?xnavigation=1
- **Subdirectory**: `apps/tpmap-dashboard` (source ใน checkout; public URL เดิม `/tpmap_act/`)
- **ไฟล์**: `household-dashboard.html`

---

## 📋 ขั้นตอนการ Deploy

### 1️⃣ เข้าสู่ Webmin Shell
เปิด browser ไปที่: https://49.231.27.66:10000/shell/?xnavigation=1

### 2️⃣ ตรวจสอบ Directory ปัจจุบัน
```bash
pwd
ls -la
```

### 3️⃣ เข้าไปยัง Directory ที่ต้องการ Deploy
**(เปลี่ยน path ให้ตรงกับ document root ของคุณ)**
```bash
# ตัวอย่าง paths ที่เป็นไปได้:
cd /var/www/html
# หรือ
cd /home/yourusername/public_html
# หรือ
cd /usr/share/nginx/html
```

### 4️⃣ ตรวจสอบว่ามี Git Repository อยู่แล้วหรือไม่

**กรณีที่ 1: ถ้ายังไม่มี Repository (Clone ครั้งแรก)**
```bash
# Clone repository
git clone https://github.com/chingchai/OpenGISData-Thailand.git

# เข้าไปใน directory
cd OpenGISData-Thailand

# เปลี่ยนไปยัง branch ที่ต้องการ
git checkout master
```

**กรณีที่ 2: ถ้ามี Repository อยู่แล้ว (Update)**
```bash
# เข้าไปใน directory ของ repository
cd OpenGISData-Thailand

# Fetch ข้อมูลล่าสุดจาก remote
git fetch origin

# เปลี่ยนไปยัง branch ที่ต้องการ
git checkout master

# Pull ข้อมูลล่าสุด
git pull origin master
```

### 5️⃣ ตรวจสอบว่าไฟล์อยู่ในตำแหน่งที่ถูกต้อง
```bash
# ตรวจสอบว่ามีไฟล์อยู่ใน apps/tpmap-dashboard/
ls -la apps/tpmap-dashboard/

# ควรจะเห็น household-dashboard.html
```

### 6️⃣ ตั้งค่า Permission (ถ้าจำเป็น)
```bash
# ให้สิทธิ์อ่านไฟล์
chmod 644 apps/tpmap-dashboard/household-dashboard.html

# ให้สิทธิ์เข้าถึง directory
chmod 755 apps/tpmap-dashboard
```

### กำหนด public URL เดิมในเว็บเซิร์ฟเวอร์

source ย้ายเข้า `apps/tpmap-dashboard/` แล้ว ถ้าใช้ Nginx ให้แก้ filesystem alias โดยคง public URL `/tpmap_act/` เดิม ตัวอย่างสำหรับ checkout ด้านบน

```nginx
location /tpmap_act/ {
    alias /var/www/html/OpenGISData-Thailand/apps/tpmap-dashboard/;
    index household-dashboard.html;
}
```

เปลี่ยน path ให้ตรงกับ checkout จริง ทดสอบ `nginx -t` ก่อน reload หากใช้ Apache หรือ cPanel ให้กำหนด alias ของเว็บเซิร์ฟเวอร์ให้ชี้โฟลเดอร์ source เดียวกันตามระบบที่ติดตั้ง

### 7️⃣ ทดสอบการเข้าถึง
เปิด browser และทดสอบเข้าถึง:
```
http://49.231.27.66/tpmap_act/household-dashboard.html
```
หรือ
```
http://your-domain.com/tpmap_act/household-dashboard.html
```

---

## 🔧 คำสั่งแบบรวม (Copy ทั้งหมดได้เลย)

### สำหรับ Clone ครั้งแรก:
```bash
cd /var/www/html
git clone https://github.com/chingchai/OpenGISData-Thailand.git
cd OpenGISData-Thailand
git checkout master
chmod 755 apps/tpmap-dashboard
chmod 644 apps/tpmap-dashboard/household-dashboard.html
ls -la apps/tpmap-dashboard/
```

### สำหรับ Update (ถ้ามี repo อยู่แล้ว):
```bash
cd /var/www/html/OpenGISData-Thailand
git fetch origin
git checkout master
git pull origin master
ls -la apps/tpmap-dashboard/
```

---

## 🚨 แก้ปัญหาที่พบบ่อย

### ปัญหา: Permission Denied
```bash
# ให้สิทธิ์ owner เป็น web server user (เช่น www-data, apache, nginx)
sudo chown -R www-data:www-data apps/tpmap-dashboard/
# หรือ
sudo chown -R apache:apache apps/tpmap-dashboard/
```

### ปัญหา: Git not found
```bash
# ติดตั้ง git
sudo apt-get update
sudo apt-get install git
# หรือสำหรับ CentOS/RHEL
sudo yum install git
```

### ปัญหา: ไม่สามารถเข้าถึงผ่าน browser
```bash
# ตรวจสอบ SELinux (สำหรับ CentOS/RHEL)
sudo chcon -R -t httpd_sys_content_t apps/tpmap-dashboard/

# หรือปิด SELinux ชั่วคระว
sudo setenforce 0
```

---

## 📝 หมายเหตุ

1. **Document Root**: path อาจแตกต่างกันตามการตั้งค่า web server ของคุณ
   - Apache บน Ubuntu/Debian: `/var/www/html`
   - Apache บน CentOS: `/var/www/html`
   - Nginx: `/usr/share/nginx/html`
   - cPanel: `/home/username/public_html`

2. **Branch**: ตอนนี้ใช้ branch `master`

3. **URL เข้าถึง**: `http://your-server/tpmap_act/household-dashboard.html`

4. **ถ้าต้องการ merge เข้า main branch**:
   ```bash
   git checkout main
   git merge master
   git push origin main
   ```

---

## ✅ Checklist
- [ ] เข้า Webmin Shell สำเร็จ
- [ ] Clone/Pull repository สำเร็จ
- [ ] ไฟล์อยู่ใน `apps/tpmap-dashboard/household-dashboard.html`
- [ ] ตั้งค่า Permission ถูกต้อง
- [ ] ทดสอบเข้าถึงผ่าน browser สำเร็จ
