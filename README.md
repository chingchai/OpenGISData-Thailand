# OpenGISData-Thailand 🗺️

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)

Open GIS Data Sources in Thailand — รวบรวมข้อมูลภูมิสารสนเทศเปิด (Open GIS Data) ขอบเขตการปกครองของประเทศไทยในรูปแบบ GeoJSON พร้อมระบบแสดงผลข้อมูล

---

## 📦 ส่วนประกอบของ Repository

### 1. ไฟล์ข้อมูล GeoJSON
- **`provinces.geojson`** — ชั้นข้อมูลขอบเขตจังหวัด (77 จังหวัด)
- **`districts.geojson`** — ชั้นข้อมูลขอบเขตอำเภอ/เขต (928 อำเภอ)
- **`subdistricts.geojson`** — ชั้นข้อมูลขอบเขตตำบล/แขวง (7,367 ตำบล)
- **`reg_royin.geojson`** — ชั้นข้อมูลขอบเขตภูมิภาค 7 ภูมิภาค (ตามเกณฑ์ราชบัณฑิตยสภา)
- **`reg_nesdb.geojson`** — ชั้นข้อมูลขอบเขตภูมิภาค 6 ภูมิภาค (ตามเกณฑ์สภาพัฒน์ - NESDC)

### 2. TPMAP Dashboard (`tpmap_act/`)
ระบบ Dashboard แสดงข้อมูลครัวเรือนและตัวชี้วัดความยากจน/ตัวชี้วัดทางสังคม
- **`household-dashboard.html`** — Dashboard หลักแสดงข้อมูลครัวเรือน
- **`indicators-selector.html`** — เครื่องมือเลือกตัวชี้วัด
- **`indicators-38-snippet.html`** — ตัวอย่างตัวชี้วัด 38 ตัว

📖 ดูรายละเอียดการติดตั้งและการใช้งานได้ที่ [tpmap_act/QUICK-START-SUBDIRECTORY.md](tpmap_act/QUICK-START-SUBDIRECTORY.md)

---

## 📊 Data Dictionary

### 1. Subdistricts (`subdistricts.geojson`)

| Field | Type | Key | Description |
|---|---|---|---|
| `tam_code` | String(6) | PK | รหัสตำบล |
| `tam_th` | String(254) | | ชื่อตำบลภาษาไทย |
| `tam_en` | String(254) | | ชื่อตำบลภาษาอังกฤษ |
| `amp_code` | String(4) | | รหัสอำเภอ |
| `amp_th` | String(254) | | ชื่ออำเภอภาษาไทย |
| `amp_en` | String(254) | | ชื่ออำเภอภาษาอังกฤษ |
| `pro_code` | String(2) | | รหัสจังหวัด |
| `pro_th` | String(254) | | ชื่อจังหวัดภาษาไทย |
| `pro_en` | String(254) | | ชื่อจังหวัดภาษาอังกฤษ |
| `reg_nesdb` | String(254) | | เขตภูมิภาค (สภาพัฒน์) |
| `reg_royin` | String(254) | | เขตภูมิภาค (ราชบัณฑิตยสภา) |
| `perimeter` | Real(18,11) | | เส้นรอบรูป (กิโลเมตร) |
| `area_sqkm` | Real(18,11) | | เนื้อที่ (ตารางกิโลเมตร) |

---

### 2. Districts (`districts.geojson`)

| Field | Type | Key | Description |
|---|---|---|---|
| `amp_code` | String(4) | PK | รหัสอำเภอ |
| `amp_th` | String(254) | | ชื่ออำเภอภาษาไทย |
| `amp_en` | String(254) | | ชื่ออำเภอภาษาอังกฤษ |
| `pro_code` | String(2) | | รหัสจังหวัด |
| `pro_th` | String(254) | | ชื่อจังหวัดภาษาไทย |
| `pro_en` | String(254) | | ชื่อจังหวัดภาษาอังกฤษ |
| `reg_nesdb` | String(254) | | เขตภูมิภาค (สภาพัฒน์) |
| `reg_royin` | String(254) | | เขตภูมิภาค (ราชบัณฑิตยสภา) |
| `perimeter` | Real(18,11) | | เส้นรอบรูป (กิโลเมตร) |
| `area_sqkm` | Real(18,11) | | เนื้อที่ (ตารางกิโลเมตร) |

---

### 3. Provinces (`provinces.geojson`)

| Field | Type | Key | Description |
|---|---|---|---|
| `pro_code` | String(2) | PK | รหัสจังหวัด |
| `pro_th` | String(254) | | ชื่อจังหวัดภาษาไทย |
| `pro_en` | String(254) | | ชื่อจังหวัดภาษาอังกฤษ |
| `reg_nesdb` | String(254) | | เขตภูมิภาค (สภาพัฒน์) |
| `reg_royin` | String(254) | | เขตภูมิภาค (ราชบัณฑิตยสภา) |
| `perimeter` | Real(18,11) | | เส้นรอบรูป (กิโลเมตร) |
| `area_sqkm` | Real(18,11) | | เนื้อที่ (ตารางกิโลเมตร) |

---

### 4. Region Royin (`reg_royin.geojson`)

| Field | Type | Key | Description |
|---|---|---|---|
| `reg_royin` | String(254) | PK | เขตภูมิภาค (ราชบัณฑิตยสภา) |
| `perimeter` | Real(18,11) | | เส้นรอบรูป (กิโลเมตร) |
| `area_sqkm` | Real(18,11) | | เนื้อที่ (ตารางกิโลเมตร) |

---

### 5. Region NESDB (`reg_nesdb.geojson`)

| Field | Type | Key | Description |
|---|---|---|---|
| `reg_nesdb` | String(254) | PK | เขตภูมิภาค (สภาพัฒน์) |
| `perimeter` | Real(18,11) | | เส้นรอบรูป (กิโลเมตร) |
| `area_sqkm` | Real(18,11) | | เนื้อที่ (ตารางกิโลเมตร) |

---

## 🚀 การติดตั้งและการใช้งาน

### สำหรับ GeoJSON Data
ดูคู่มือการตั้งค่าและการปรับใช้งานบน Nginx Web Server ได้ที่: [DEPLOY.md](DEPLOY.md)

### สำหรับ TPMAP Dashboard
ดูคู่มือ Quick Start สำหรับ TPMAP ได้ที่: [tpmap_act/QUICK-START-SUBDIRECTORY.md](tpmap_act/QUICK-START-SUBDIRECTORY.md)

---

## 🌟 Showcase / Projects using this dataset

รวบรวมโครงการ เครื่องมือ และงานวิจัยที่นำชุดข้อมูลจาก Repository นี้ไปใช้งานจริง:

* **[ThaiFloodRisk.com - 2011 Bangkok Flood by District](https://thaifloodrisk.com/en/tools/bangkok-2011-flood-by-district)**
  * **รายละเอียด:** นำข้อมูลขอบเขตระดับตำบล (`subdistricts.geojson`) ไปคำนวณและประมวลผลสัดส่วนพื้นที่น้ำท่วมรายตำบลของกรุงเทพมหานครจากเหตุการณ์มหาอุทกภัยปี 2554 (2011 Flood)
  * **อ้างอิงข้อมูลเปิด:** [DOI: 10.5281/zenodo.23260465](https://doi.org/10.5281/zenodo.23260465) (CC BY 4.0)

> 💡 **นำชุดข้อมูลนี้ไปใช้งานในโครงการของคุณ?**  
> หากคุณนำข้อมูลใน Repository นี้ไปใช้ สามารถแจ้งให้เราทราบเพื่อเพิ่มลงใน Showcase ได้โดยการเปิด [Pull Request](../../pulls) หรือสร้าง [Issue](../../issues) ใหม่ครับ

---

## 📚 แหล่งอ้างอิงข้อมูล
- ข้อมูลขอบเขตการปกครอง: กรมการปกครอง กระทรวงมหาดไทย (DOPA)
- ข้อมูลการแบ่งภูมิภาค: สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ (สศช. / NESDC) และ ราชบัณฑิตยสภา (ORST)
- ข้อมูลตัวชี้วัดทางสังคม: ระบบบริหารจัดการข้อมูลพัฒนาคนแบบชี้เป้า (TPMAP)

---

## 📄 ใบอนุญาตใช้งาน (License)
ชุดข้อมูลนี้เผยแพร่ภายใต้ใบอนุญาต **[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)** สามารถนำไปใช้ ดัดแปลง และเผยแพร่ต่อได้โดยอ้างอิงแหล่งที่มาอย่างถูกต้อง
