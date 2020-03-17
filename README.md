# OpenGISData-Thailand
Open GIS Data Sources in Thailand

## เป็นไฟล์รูปแบบ geojson มีทั้งหมด 3 ไฟล์คือ
- ชั้นข้อมูลขอบเขตจังหวัด 77 จังหวัด (provinces.geojson)
- ชั้นข้อมูลขอบเขตอำเภอ 928 อำเภอ (districts.geojson)
- ชั้นข้อมูลขอบเขตตำบล 7367 ตำบล (subdistricts.geojson)
- ชั้นข้อมูลขอบเขตภูมิภาค 7 ภูมิภาค (region_royin.geojson)
- ชั้นข้อมูลขอบเขตภูมิภาค 6 ภูมิภาค (region_nesdb.geojson)

## Data dictionary
**provinces**

|Field |Type |Key|Description |
|----------------|-------------------------------|-----------------------------|-----------------------------|
|gid|Integer(10)|PK|gid|
|tam_code|String(6)||รหัสตำบล|
|tam_th|String(254)||ชื่อตำบลภาษาไทย|
|tam_en|String(254)||ชื่อตำบลภาษาอังกฤษ|
|amp_code|String(4)||รหัสอำเภอ|
|amp_th|String(254)||ชื่ออำเภอภาษาไทย|
|amp_en|String(254)||ชื่ออำเภอภาษาอังกฤษ|
|pro_code|String(2)||รหัสจังหวัด|
|pro_th|String(254)||ชื่อจังหวัดภาษาไทย|
|pro_en|String(254)||ชื่อจังหวัดภาษาอังกฤษ|
|reg_nesdb|String(254)||เขตภูมิภาค|
|reg_royin|String(254)||เขตภูมิภาค|
|perimeter|Real(18,11)||เส้นรอบรูป กิโลเมตร|
|area_sqkm|Real(18,11)||เนื้อที่ ตารางกิโลเมตร|


----------


**districts**

|Field |Type |Key|Description |
|----------------|-------------------------------|-----------------------------|-----------------------------|
|amp_code|String(4)|PK|รหัสอำเภอ|
|amp_th|String(254)||ชื่ออำเภอภาษาไทย|
|amp_en|String(254)||ชื่ออำเภอภาษาอังกฤษ|
|pro_code|String(2)||รหัสจังหวัด|
|pro_th|String(254)||ชื่อจังหวัดภาษาไทย|
|pro_en|String(254)||ชื่อจังหวัดภาษาอังกฤษ|
|reg_nesdb|String(254)||เขตภูมิภาค|
|reg_royin|String(254)||เขตภูมิภาค|
|perimeter|Real(18,11)||เส้นรอบรูป กิโลเมตร|
|area_sqkm|Real(18,11)||เนื้อที่ ตารางกิโลเมตร|

----------

**subdistricts**

|Field |Type |Key|Description |
|----------------|-------------------------------|-----------------------------|-----------------------------|
|pro_code|String(2)|PK|รหัสจังหวัด|
|pro_th|String(254)||ชื่อจังหวัดภาษาไทย|
|pro_en|String(254)||ชื่อจังหวัดภาษาอังกฤษ|
|reg_nesdb|String(254)||เขตภูมิภาค|
|reg_royin|String(254)||เขตภูมิภาค|
|perimeter|Real(18,11)||เส้นรอบรูป กิโลเมตร|
|area_sqkm|Real(18,11)||เนื้อที่ ตารางกิโลเมตร|


**region_royin**

|Field |Type |Key|Description |
|----------------|-------------------------------|-----------------------------|-----------------------------|
|reg_royin|String(254)||เขตภูมิภาค|
|perimeter|Real(18,11)||เส้นรอบรูป กิโลเมตร|
|area_sqkm|Real(18,11)||เนื้อที่ ตารางกิโลเมตร|


**region_nesdb**

|Field |Type |Key|Description |
|----------------|-------------------------------|-----------------------------|-----------------------------|
|reg_nesdb|String(254)||เขตภูมิภาค|
|perimeter|Real(18,11)||เส้นรอบรูป กิโลเมตร|
|area_sqkm|Real(18,11)||เนื้อที่ ตารางกิโลเมตร|

## อ้างอิงจาก
