# Deploy tpmap_act โดยไม่ต้องใช้ Git Repository

## 🎯 วิธีวางโฟลเดอร์ tpmap_act ไปยัง directory ที่ต้องการ

---

## 🚀 วิธีที่ 1: Download ไฟล์โดยตรงจาก GitHub (แนะนำ)

### ขั้นตอน:

1. **เข้า Webmin Shell**: https://49.231.27.66:10000/shell/?xnavigation=1

2. **เข้าไปยัง directory ที่ต้องการวางโปรเจค** (เช่น document root ของ web server)
```bash
# เปลี่ยน path ตามที่ต้องการ
cd /var/www/html
# หรือ
cd /home/yourusername/public_html
# หรือ
cd /usr/share/nginx/html
```

3. **สร้างโฟลเดอร์ tpmap_act**
```bash
mkdir -p tpmap_act
cd tpmap_act
```

4. **Download ไฟล์ household-dashboard.html โดยตรง**
```bash
wget https://raw.githubusercontent.com/bogarb12/OpenGISData-Thailand/claude/household-data-dashboard-0174AUdvgg9Vkk6Ew942ATnG/tpmap_act/household-dashboard.html

# หรือถ้าไม่มี wget ให้ใช้ curl
curl -O https://raw.githubusercontent.com/bogarb12/OpenGISData-Thailand/claude/household-data-dashboard-0174AUdvgg9Vkk6Ew942ATnG/tpmap_act/household-dashboard.html
```

5. **ตั้งค่า Permission**
```bash
chmod 644 household-dashboard.html
cd ..
chmod 755 tpmap_act
```

6. **ตรวจสอบไฟล์**
```bash
ls -la tpmap_act/
```

### 📋 คำสั่งแบบรวม (Copy ได้เลย):
```bash
cd /var/www/html
mkdir -p tpmap_act
cd tpmap_act
wget https://raw.githubusercontent.com/bogarb12/OpenGISData-Thailand/claude/household-data-dashboard-0174AUdvgg9Vkk6Ew942ATnG/tpmap_act/household-dashboard.html
chmod 644 household-dashboard.html
cd ..
chmod 755 tpmap_act
ls -la tpmap_act/
```

---

## 🔄 วิธีที่ 2: Clone แบบชั่วคราว แล้ว Copy เฉพาะที่ต้องการ

### ขั้นตอน:

1. **เข้าไปยัง directory ที่ต้องการ**
```bash
cd /var/www/html
```

2. **Clone repository ลงใน temporary directory**
```bash
git clone --depth 1 --branch claude/household-data-dashboard-0174AUdvgg9Vkk6Ew942ATnG https://github.com/bogarb12/OpenGISData-Thailand.git temp_clone
```

3. **Copy เฉพาะโฟลเดอร์ tpmap_act**
```bash
cp -r temp_clone/tpmap_act ./
```

4. **ลบ temporary clone**
```bash
rm -rf temp_clone
```

5. **ตั้งค่า Permission**
```bash
chmod 755 tpmap_act
chmod 644 tpmap_act/*
```

6. **ตรวจสอบ**
```bash
ls -la tpmap_act/
```

### 📋 คำสั่งแบบรวม (Copy ได้เลย):
```bash
cd /var/www/html
git clone --depth 1 --branch claude/household-data-dashboard-0174AUdvgg9Vkk6Ew942ATnG https://github.com/bogarb12/OpenGISData-Thailand.git temp_clone
cp -r temp_clone/tpmap_act ./
rm -rf temp_clone
chmod 755 tpmap_act
chmod 644 tpmap_act/*
ls -la tpmap_act/
```

---

## 📤 วิธีที่ 3: Upload ผ่าน Webmin File Manager

### ขั้นตอน:

1. **เปิด Webmin File Manager** (ปกติจะอยู่ที่ Tools > File Manager)

2. **Navigate ไปยัง directory ที่ต้องการ** เช่น `/var/www/html`

3. **สร้างโฟลเดอร์ใหม่ชื่อ** `tpmap_act`

4. **Upload ไฟล์** `household-dashboard.html` จากเครื่องคุณเข้าไปในโฟลเดอร์ `tpmap_act`

5. **คลิกขวาที่ไฟล์ > Change Permissions** ตั้งเป็น `644` (rw-r--r--)

6. **คลิกขวาที่โฟลเดอร์ > Change Permissions** ตั้งเป็น `755` (rwxr-xr-x)

---

## 📥 วิธีที่ 4: ใช้ SFTP/FTP Upload

### ถ้าคุณมี FTP access:

1. **Connect ผ่าน FTP Client** (FileZilla, WinSCP, etc.)
   - Host: `49.231.27.66`
   - Port: `21` (FTP) หรือ `22` (SFTP)
   - Username/Password: ตามที่คุณมี

2. **Navigate ไปยัง document root** เช่น `/var/www/html`

3. **Upload โฟลเดอร์** `tpmap_act` ทั้งหมด

4. **ตั้งค่า Permissions**:
   - Folder `tpmap_act`: `755`
   - File `household-dashboard.html`: `644`

---

## 🔄 การ Update ไฟล์ในอนาคต

เมื่อมีการแก้ไขไฟล์ ให้ทำตามวิธีเดิมที่เลือก:

### วิธีที่ 1 (wget/curl):
```bash
cd /var/www/html/tpmap_act
rm household-dashboard.html
wget https://raw.githubusercontent.com/bogarb12/OpenGISData-Thailand/claude/household-data-dashboard-0174AUdvgg9Vkk6Ew942ATnG/tpmap_act/household-dashboard.html
chmod 644 household-dashboard.html
```

### วิธีที่ 2 (Clone & Copy):
```bash
cd /var/www/html
git clone --depth 1 --branch claude/household-data-dashboard-0174AUdvgg9Vkk6Ew942ATnG https://github.com/bogarb12/OpenGISData-Thailand.git temp_clone
rm -rf tpmap_act
cp -r temp_clone/tpmap_act ./
rm -rf temp_clone
chmod 755 tpmap_act
chmod 644 tpmap_act/*
```

---

## 🌐 ทดสอบการเข้าถึง

หลังจาก deploy เสร็จ ทดสอบที่:
```
http://49.231.27.66/tpmap_act/household-dashboard.html
```

หรือ (ถ้ามี domain):
```
http://your-domain.com/tpmap_act/household-dashboard.html
```

---

## 🗂️ โครงสร้างไฟล์ที่ได้

```
/var/www/html/               (หรือ document root ของคุณ)
└── tpmap_act/
    └── household-dashboard.html
```

---

## ⚙️ ตั้งค่า Permission ที่แนะนำ

```bash
# สำหรับโฟลเดอร์
chmod 755 tpmap_act

# สำหรับไฟล์ HTML
chmod 644 tpmap_act/household-dashboard.html

# ถ้าต้องการเปลี่ยน owner เป็น web server
sudo chown -R www-data:www-data tpmap_act/
# หรือ
sudo chown -R apache:apache tpmap_act/
```

---

## 🚨 แก้ปัญหาที่พบบ่อย

### ปัญหา: wget/curl ไม่มีในระบบ

**แก้ไข:**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install wget curl

# CentOS/RHEL
sudo yum install wget curl
```

### ปัญหา: Permission Denied

**แก้ไข:**
```bash
# ใช้ sudo
sudo mkdir -p /var/www/html/tpmap_act
sudo chown $USER:$USER /var/www/html/tpmap_act

# หรือเปลี่ยน owner เป็น web server user
sudo chown -R www-data:www-data /var/www/html/tpmap_act
```

### ปัญหา: 403 Forbidden เมื่อเข้าผ่าน browser

**แก้ไข:**
```bash
# ตรวจสอบ permission
ls -la /var/www/html/tpmap_act/

# ตั้งค่า permission ใหม่
chmod 755 /var/www/html/tpmap_act
chmod 644 /var/www/html/tpmap_act/household-dashboard.html

# สำหรับ SELinux (CentOS/RHEL)
sudo chcon -R -t httpd_sys_content_t /var/www/html/tpmap_act/
```

### ปัญหา: ไม่รู้ว่า document root อยู่ที่ไหน

**วิธีหา:**

**สำหรับ Apache:**
```bash
# Ubuntu/Debian
cat /etc/apache2/sites-enabled/000-default.conf | grep DocumentRoot

# CentOS/RHEL
cat /etc/httpd/conf/httpd.conf | grep DocumentRoot
```

**สำหรับ Nginx:**
```bash
cat /etc/nginx/sites-enabled/default | grep root
# หรือ
cat /etc/nginx/nginx.conf | grep root
```

**วิธีอื่น:**
```bash
# ดูจาก phpinfo()
echo "<?php phpinfo(); ?>" > /tmp/info.php
# แล้วเปิด browser ไปที่ http://your-server/info.php
# ดูที่ DOCUMENT_ROOT
```

---

## 📱 เลือกวิธีที่เหมาะกับคุณ

| วิธี | ความยาก | ความเหมาะสม |
|------|---------|--------------|
| **วิธีที่ 1: wget/curl** | ⭐ ง่าย | เหมาะสำหรับไฟล์เดียว, update บ่อย |
| **วิธีที่ 2: Clone & Copy** | ⭐⭐ ปานกลาง | เหมาะสำหรับหลายไฟล์, ต้องการ git |
| **วิธีที่ 3: Webmin Upload** | ⭐ ง่ายมาก | เหมาะสำหรับคนไม่ชำนาญ command line |
| **วิธีที่ 4: FTP Upload** | ⭐ ง่าย | เหมาะสำหรับคนคุ้นเคยกับ FTP |

---

## ✅ Checklist

- [ ] เข้า Webmin Shell/File Manager สำเร็จ
- [ ] สร้างโฟลเดอร์ `tpmap_act` สำเร็จ
- [ ] Download/Upload ไฟล์สำเร็จ
- [ ] ตั้งค่า Permission ถูกต้อง (755 สำหรับโฟลเดอร์, 644 สำหรับไฟล์)
- [ ] ทดสอบเข้าถึงผ่าน browser สำเร็จ

---

## 💡 แนะนำ

**วิธีที่ง่ายที่สุด** คือใช้ **วิธีที่ 1 (wget)** เพราะ:
- ไม่ต้องพึ่งพา git repository
- คำสั่งสั้น copy ง่าย
- Update ไฟล์ง่ายเพียงลบแล้ว download ใหม่
- ไม่เปลือง disk space
