# TPMAP Household Dashboard

ระบบจัดการและวิเคราะห์ข้อมูลครัวเรือนตามมิติ TPMAP (Thailand Poverty Mapping)

## ภาพรวม

ระบบนี้เป็น Web Application แบบ standalone (ไม่ต้องใช้ Backend) สำหรับจัดการและวิเคราะห์ข้อมูลครัวเรือนตามตัวชี้วัด TPMAP 38 รายการ

### คุณสมบัติหลัก

- ✅ **ไม่มี External Dependencies** - ไม่ต้องพึ่งพา CDN ใดๆ
- ✅ **Privacy-First** - ไม่มี tracking หรือ third-party scripts
- ✅ **Responsive Design** - ใช้งานได้ทั้งบนมือถือและคอมพิวเตอร์
- ✅ **iOS-Style UI** - ออกแบบตาม Apple Human Interface Guidelines
- ✅ **38 ตัวชี้วัด TPMAP** - ครอบคลุมทุกมิติตาม TPMAP Framework

## ไฟล์หลัก

- **`household-dashboard.html`** - ระบบกรอกข้อมูลครัวเรือนและสร้างรายงาน
- **`indicators-selector.html`** - ระบบเลือกและจัดการตัวชี้วัด 38 รายการ
- **`nginx.conf`** - ไฟล์คอนฟิกสำหรับ Nginx
- **`deploy.sh`** - สคริปต์สำหรับ deploy อัตโนมัติ
- **`DEPLOYMENT.md`** - คู่มือการติดตั้งแบบละเอียด

## วิธีการใช้งาน

### 1. ใช้งานแบบ Local (สำหรับทดสอบ)

เปิดไฟล์ HTML ด้วย Web Browser:

```bash
# เปิด household dashboard
open household-dashboard.html  # macOS
xdg-open household-dashboard.html  # Linux
start household-dashboard.html  # Windows

# เปิด indicators selector
open indicators-selector.html
```

### 2. Deploy บน Production Server เป็น Subdirectory (แนะนำ)

**ระบบนี้ออกแบบให้ทำงานเป็น subdirectory ของเว็บไซต์หลัก** ไม่ใช่ standalone site

**URL ที่ได้:**
- `https://your-domain.com/tpmap/household-dashboard.html`
- `https://your-domain.com/tpmap/indicators-selector.html`

#### Quick Start (5 ขั้นตอน)

```bash
# 1. คัดลอกไฟล์
scp -r apps/tpmap-dashboard user@your-server:/tmp/tpmap_act

# 2. ย้ายไฟล์
sudo mkdir -p /var/www/tpmap-household-dashboard
sudo mv /tmp/tpmap_act /var/www/tpmap-household-dashboard/

# 3. ตั้งค่าสิทธิ์
sudo chown -R www-data:www-data /var/www/tpmap-household-dashboard
sudo chmod -R 755 /var/www/tpmap-household-dashboard

# 4. แก้ไข nginx config ของระบบหลัก
sudo nano /etc/nginx/sites-available/your-main-site
```

**เพิ่มโค้ดนี้ใน server block:**

```nginx
location /tpmap/ {
    alias /var/www/tpmap-household-dashboard/tpmap_act/;
    index household-dashboard.html indicators-selector.html;
    try_files $uri $uri/ =404;
}
```

```bash
# 5. Reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

**เอกสารเพิ่มเติม:**
- [`QUICK-START-SUBDIRECTORY.md`](QUICK-START-SUBDIRECTORY.md) - Quick start แบบละเอียด
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - คู่มือติดตั้งแบบสมบูรณ์
- [`nginx-subdirectory-example.conf`](nginx-subdirectory-example.conf) - ตัวอย่าง config

### 3. Deploy ด้วย Docker (ทางเลือก - Standalone)

สร้างไฟล์ `Dockerfile`:

```dockerfile
FROM nginx:alpine
COPY apps/tpmap-dashboard /usr/share/nginx/html/tpmap_act
COPY apps/tpmap-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

รัน Docker:

```bash
docker build -t tpmap-household-dashboard .
docker run -d -p 80:80 tpmap-household-dashboard
```

## โครงสร้างตัวชี้วัด TPMAP (38 รายการ)

### 1. ด้านสุขภาพ (12 ตัวชี้วัด)
- H01-H12: การฝากครรภ์, พัฒนาการเด็ก, ประกันสุขภาพ, ฯลฯ

### 2. ด้านที่อยู่อาศัยและสิ่งแวดล้อม (9 ตัวชี้วัด)
- HE01-HE09: ที่อยู่อาศัย, สาธารณูปโภค, ความปลอดภัย, ฯลฯ

### 3. ด้านการศึกษาและการเรียนรู้ (5 ตัวชี้วัด)
- ED01-ED05: การศึกษาภาคบังคับ, ทักษะศตวรรษที่ 21, ฯลฯ

### 4. ด้านเศรษฐกิจและอาชีพ (4 ตัวชี้วัด)
- EC01-EC04: อาชีพ, รายได้, การออม, ฯลฯ

### 5. ด้านสวัสดิการสังคม (5 ตัวชี้วัด)
- W01-W05: เงินอุดหนุน, บัตรสวัสดิการ, การดูแลผู้สูงอายุ, ฯลฯ

### 6. ด้านครอบครัวและชุมชน (2 ตัวชี้วัด)
- FC01-FC02: ความอบอุ่น, การมีส่วนร่วม, ฯลฯ

ดูรายละเอียดเพิ่มเติมใน `indicators-reference-full.md`

## คุณสมบัติเด่น

### 🎨 UI/UX Design

- **iOS-Style Design**: ใช้ design system ของ iOS
- **Dark Mode Ready**: รองรับโหมดมืด (ตามการตั้งค่าระบบ)
- **Responsive**: ปรับตัวตามขนาดหน้าจอ
- **Selection Balloon**: แสดงรายการที่เลือกแบบ floating

### 🔒 Privacy & Security

- **No External CDN**: ไม่มี Google Fonts, Font Awesome หรือ CDN ใดๆ
- **No Tracking**: ไม่มี analytics หรือ tracking scripts
- **Inline SVG Icons**: ใช้ไอคอน SVG แบบ inline
- **System Fonts**: ใช้ฟอนต์ระบบ (Thonburi, Sukhumvit Set)

### ⚡ Performance

- **Fast Loading**: ไม่ต้องโหลดจาก CDN
- **Works Offline**: ทำงานได้แม้ไม่มีอินเทอร์เน็ต
- **Lightweight**: ไฟล์มีขนาดเล็ก
- **No Dependencies**: ไม่ต้องติดตั้ง framework ใดๆ

## Browser Support

- ✅ Safari 14+
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome for Android

## การอัปเดต

### ด้วย Git

```bash
cd /var/www/tpmap-household-dashboard
sudo git pull origin master
sudo cp -r apps/tpmap-dashboard/. tpmap_act/
sudo systemctl reload nginx
```

### ด้วย SCP

```bash
scp -r apps/tpmap-dashboard/* user@your-server:/var/www/tpmap-household-dashboard/tpmap_act/
```

## Troubleshooting

### ไอคอนไม่แสดง

ตรวจสอบว่าเบราว์เซอร์ไม่ได้บล็อก inline SVG

### ฟอนต์ไทยแสดงไม่ถูกต้อง

ติดตั้งฟอนต์ไทยในระบบ:
```bash
sudo apt install fonts-thai-tlwg -y
```

### Tracking Prevention Errors

ระบบใหม่ไม่มีปัญหานี้แล้ว (ไม่มี CDN)

## เอกสารเพิ่มเติม

- [`DEPLOYMENT.md`](DEPLOYMENT.md) - คู่มือการติดตั้งแบบละเอียด
- [`indicators-reference-full.md`](indicators-reference-full.md) - รายละเอียดตัวชี้วัด 38 รายการ
- [`nginx.conf`](nginx.conf) - ตัวอย่างการตั้งค่า Nginx

## License

[ระบุ License ตามต้องการ]

## Contributors

- [ชื่อผู้พัฒนา]

## Support

หากมีปัญหาหรือคำถาม:
- GitHub Issues: [https://github.com/bogarb12/OpenGISData-Thailand/issues](https://github.com/bogarb12/OpenGISData-Thailand/issues)
- Email: [อีเมลสำหรับติดต่อ]

---

**หมายเหตุ:** ระบบนี้พัฒนาขึ้นเพื่อใช้ในการจัดการข้อมูลครัวเรือนตามมาตรฐาน TPMAP ของประเทศไทย
