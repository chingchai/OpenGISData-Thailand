# OpenGISData-Thailand 🗺️

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)

Open GIS Data Sources in Thailand — รวบรวมข้อมูลภูมิสารสนเทศเปิด (Open GIS Data) ขอบเขตการปกครองของประเทศไทยในรูปแบบ GeoJSON พร้อมระบบแสดงผลข้อมูล

---

## 📦 ส่วนประกอบของ Repository

### 1. ไฟล์ข้อมูล GeoJSON
- **`provinces.geojson`** — ชั้นข้อมูลขอบเขตจังหวัด (77 จังหวัด)
- **`districts.geojson`** — ชั้นข้อมูลขอบเขตอำเภอ/เขต (928 อำเภอ)
- **`subdistricts.geojson`** — ชั้นข้อมูลขอบเขตตำบล/แขวง (7,367 ตำบล)
- **`reg_royin.geojson`** — ชั้นข้อมูลขอบเขตภูมิภาค 6 ภูมิภาค (ตามเกณฑ์ราชบัณฑิตยสภา)
- **`reg_nesdb.geojson`** — ชั้นข้อมูลขอบเขตภูมิภาค 7 ภูมิภาค (ตามเกณฑ์สภาพัฒน์ - NESDC)

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
| `lat` | Real | | ละติจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `lon` | Real | | ลองจิจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `postcode` | Array<String(5)> | | รายการรหัสไปรษณีย์ที่จับคู่ได้; `[]` เมื่อจับคู่ไม่ได้ |
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
| `lat` | Real | | ละติจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `lon` | Real | | ลองจิจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `postcode` | Array<String(5)> | | รหัสไปรษณีย์รวมจากตำบลที่จับคู่ได้ในอำเภอ |
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
| `lat` | Real | | ละติจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `lon` | Real | | ลองจิจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `postcode` | Array<String(5)> | | รหัสไปรษณีย์รวมจากตำบลที่จับคู่ได้ในจังหวัด |
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
| `lat` | Real | | ละติจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `lon` | Real | | ลองจิจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `postcode` | Array<String(5)> | | รหัสไปรษณีย์รวมจากตำบลที่จับคู่ได้ในภูมิภาค |
| `perimeter` | Real(18,11) | | เส้นรอบรูป (กิโลเมตร) |
| `area_sqkm` | Real(18,11) | | เนื้อที่ (ตารางกิโลเมตร) |

---

### 5. Region NESDB (`reg_nesdb.geojson`)

| Field | Type | Key | Description |
|---|---|---|---|
| `reg_nesdb` | String(254) | PK | เขตภูมิภาค (สภาพัฒน์) |
| `lat` | Real | | ละติจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `lon` | Real | | ลองจิจูดของ centroid ใน WGS84 หน่วยองศา ทศนิยมไม่เกิน 6 ตำแหน่ง |
| `postcode` | Array<String(5)> | | รหัสไปรษณีย์รวมจากตำบลที่จับคู่ได้ในภูมิภาค |
| `perimeter` | Real(18,11) | | เส้นรอบรูป (กิโลเมตร) |
| `area_sqkm` | Real(18,11) | | เนื้อที่ (ตารางกิโลเมตร) |

---

### รหัสไปรษณีย์ (`postcode`)

แต่ละ Feature มี `properties.postcode` เป็นรายการข้อความตัวเลข 5 หลัก เช่น `["10200"]` หรือ `["10100", "10200"]` โดยเรียงลำดับและตัดค่าซ้ำ ใช้ `[]` เมื่อยังจับคู่ไม่ได้ ซึ่งไม่ได้หมายความว่าพื้นที่นั้นไม่มีรหัสไปรษณีย์

ข้อมูลมาจาก [Thailand Geography JSON โดย Joe Takara](https://github.com/thailand-geography-data/thailand-geography-json) ไฟล์ [`src/geography.json` เวอร์ชัน `b8b3fb9`](https://github.com/thailand-geography-data/thailand-geography-json/blob/b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b/src/geography.json) ดึงข้อมูลวันที่ 18 ตุลาคม 2569 (2026-10-18) ภายใต้ [MIT License](https://github.com/thailand-geography-data/thailand-geography-json/blob/b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b/LICENSE) สำเนาใบอนุญาตอยู่ที่ [THIRD_PARTY_LICENSES/thailand-geography-json.txt](THIRD_PARTY_LICENSES/thailand-geography-json.txt)

**วิธีจับคู่และข้อจำกัด**

- ตรวจรหัสตำบล อำเภอ จังหวัด พร้อมชื่อภาษาไทยทั้ง 3 ระดับ โดยปรับเฉพาะช่องว่าง หากไม่พบรหัสตำบลในต้นทาง จะใช้ชื่อทั้ง 3 ระดับที่ตรงกันเพียงรายการเดียวและรหัสอำเภอ/จังหวัดที่ตรงกันแทน
- หากพบรหัสแต่ชื่อขัดแย้ง หรือไม่สามารถจับคู่ได้ชัดเจน จะเว้นเป็น `[]` โดยเก็บรายละเอียดใน [รายงานการจับคู่](docs/data/postcode-report.json) และคงชื่อ รหัส และ geometry เดิมไว้
- ระดับอำเภอ จังหวัด และภูมิภาค รวมรหัสจากตำบลที่จับคู่ได้ตามรหัสพื้นที่และชื่อภูมิภาคในข้อมูลเดิม จึงอาจไม่ครบทุกรหัสในพื้นที่ แม้รายการนั้นไม่เป็น `[]`
- ต้นทางให้รหัสไปรษณีย์หนึ่งค่าต่อรายการตำบล จึงไม่รับประกันว่าครอบคลุมทุกรหัสในตำบลที่มีหลายเขตนำจ่าย วันที่ดึงข้อมูลไม่ได้หมายถึงวันที่ตรวจสอบรหัสกับไปรษณีย์ไทย

| ชุดข้อมูล | จำนวน Feature | มีรหัสที่จับคู่ได้ | เป็น `[]` |
|---|---:|---:|---:|
| Subdistricts | 7,367 | 7,220 | 147 |
| Districts | 928 | 917 | 11 |
| Provinces | 77 | 77 | 0 |
| Region Royin | 6 | 6 | 0 |
| Region NESDB | 7 | 7 | 0 |

**สร้างและตรวจสอบข้อมูลซ้ำ** (Python 3 โดยไม่ต้องติดตั้งแพ็กเกจเพิ่ม)

```bash
curl -fsSL https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b/src/geography.json -o /tmp/thailand-geography.json
python3 scripts/add_postcodes.py /tmp/thailand-geography.json
python3 scripts/add_postcodes.py /tmp/thailand-geography.json --check
python3 -m unittest discover -s tests -p 'test_add_postcodes.py' -v
```

สคริปต์ตรวจ SHA-256 ของไฟล์ต้นทางก่อนประมวลผล และตรวจว่าการเปลี่ยน GeoJSON จำกัดอยู่ที่ `postcode` เท่านั้น โหมด `--check` ตรวจข้อมูลและรายงานที่สร้างไว้โดยไม่เขียนไฟล์

### จุดศูนย์กลางพื้นที่ (`lat`, `lon`)

ทุก Feature ใน GeoJSON ทั้ง 5 ไฟล์มี `properties.lat` และ `properties.lon` เป็นตัวเลขหน่วยองศาใน WGS84 โดยปัดเป็นทศนิยม 6 ตำแหน่ง ตัวเลขอาจแสดงทศนิยมน้อยกว่า 6 ตำแหน่งหากลงท้ายด้วยศูนย์ จำนวนทศนิยมเป็นรูปแบบการจัดเก็บ ไม่ใช่การรับรองความแม่นยำของขอบเขตต้นทาง

คำนวณจาก geometry ของแต่ละ Feature โดยตรงตามขั้นตอนนี้

1. แปลงพิกัดเดิมจาก CRS84 ซึ่งเรียงเป็น longitude, latitude ไปเป็น Lambert Azimuthal Equal Area (LAEA) บน WGS84 เพื่อคำนวณในระนาบหน่วยเมตร ใช้จุดศูนย์กลางที่ 13°N, 101°E และพารามิเตอร์ `+proj=laea +lat_0=13 +lon_0=101 +datum=WGS84 +units=m +no_defs`
2. คำนวณ centroid ของ MultiPolygon แบบถ่วงน้ำหนักตามพื้นที่ โดยรวมทุกส่วนและหักพื้นที่ช่องว่างภายใน ไม่ใช้ค่าเฉลี่ยของจุดยอดหรือ centroid ของพื้นที่ย่อยในไฟล์อื่น
3. แปลง centroid กลับเป็น WGS84 แล้วเก็บ latitude ใน `lat` และ longitude ใน `lon` โดยกำหนดลำดับแกนในการแปลงให้เป็น x=longitude, y=latitude ก่อนปัดค่า

centroid อาจอยู่นอกขอบเขตหรืออยู่ในทะเลสำหรับพื้นที่เว้าหรือหมู่เกาะ ค่าที่จัดเก็บเป็น centroid ตามการคำนวณ ไม่ได้ย้ายจุดเข้าไปใน polygon และไม่ใช่ตำแหน่งที่ว่าการหรือศูนย์กลางชุมชน การเพิ่มฟิลด์นี้คง geometry, `postcode` และฟิลด์เดิมไว้

วิธีคำนวณอ้างอิงเอกสาร [Shapely centroid](https://shapely.readthedocs.io/en/2.1.2/reference/shapely.centroid.html), [PROJ Lambert Azimuthal Equal Area](https://proj.org/en/stable/operations/projections/laea.html) และ [pyproj Transformer](https://pyproj4.github.io/pyproj/stable/api/transformer.html) โดยบันทึกพารามิเตอร์ เวอร์ชันเครื่องมือ และสถิติผลลัพธ์ไว้ใน [รายงาน centroid](docs/data/centroid-report.json)

**สร้างและตรวจสอบ centroid ซ้ำ**

```bash
python3 -m venv .venv-centroids
.venv-centroids/bin/python -m pip install -r requirements-centroids.txt
.venv-centroids/bin/python scripts/add_centroids.py
.venv-centroids/bin/python scripts/add_centroids.py --check
PYTHONDONTWRITEBYTECODE=1 .venv-centroids/bin/python -m unittest discover -s tests -v
```

สคริปต์คำนวณใหม่ได้จาก geometry ใน repo โดยไม่ต้องดาวน์โหลดข้อมูลรหัสไปรษณีย์ โหมด `--check` ตรวจฟิลด์และรายงานโดยไม่เขียนไฟล์

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
- ข้อมูลรหัสไปรษณีย์: [Thailand Geography JSON — Joe Takara](https://github.com/thailand-geography-data/thailand-geography-json) (MIT License; ดูเวอร์ชัน วิธีจับคู่ และข้อจำกัดในหัวข้อ `postcode` ด้านบน)
- พิกัด centroid: คำนวณจาก geometry ในชุดข้อมูลนี้ด้วย [Shapely](https://shapely.readthedocs.io/en/2.1.2/reference/shapely.centroid.html) และ [pyproj/PROJ](https://proj.org/en/stable/operations/projections/laea.html) ตามวิธีที่ระบุในหัวข้อ `lat`, `lon` ด้านบน
- ข้อมูลตัวชี้วัดทางสังคม: ระบบบริหารจัดการข้อมูลพัฒนาคนแบบชี้เป้า (TPMAP)

---

## 📄 ใบอนุญาตใช้งาน (License)
ชุดข้อมูลนี้เผยแพร่ภายใต้ใบอนุญาต **[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)** สามารถนำไปใช้ ดัดแปลง และเผยแพร่ต่อได้โดยอ้างอิงแหล่งที่มาอย่างถูกต้อง

ข้อมูลรหัสไปรษณีย์จาก Thailand Geography JSON มีประกาศลิขสิทธิ์และเงื่อนไข MIT เพิ่มเติมตาม [สำเนาใบอนุญาตต้นทาง](THIRD_PARTY_LICENSES/thailand-geography-json.txt) เมื่อเผยแพร่ข้อมูลส่วนนี้ต่อ ให้แนบประกาศและเงื่อนไขดังกล่าวด้วย
