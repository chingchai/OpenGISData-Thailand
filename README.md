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

|Field |Type |Key|
|----------------|-------------------------------|-----------------------------|
|gid|Integer|PK|
|tam_code|String(6)||
|tam_th|String(254)||
|tam_en|String(254)||
|amp_code|String(4)||
|amp_th|String(254)||
|amp_en|String(254)||
|pro_code|String(2)||
|pro_th|String(254)||
|pro_en|String(254)||
|reg_nesdb|String(254)||
|reg_royin|String(254)||
|perimeter|Real(18,11)||
|area_sqkm|Real(18,11)||


----------


**districts**

|Field |Type |Key|
|----------------|-------------------------------|-----------------------------|
|id|Integer|PK|
|code|Varchar(4)||
|name_th|Varchar(150)||
|name_en|Varchar(150)||
|province_id|Integer||

----------

**subdistricts**

|Field |Type |Key|
|----------------|-------------------------------|-----------------------------|
|id|Integer|PK|
|zip_code|Integer||
|name_th|Varchar(150)||
|name_en|Varchar(150)||
|amphure_id|Integer||



## อ้างอิงจาก
