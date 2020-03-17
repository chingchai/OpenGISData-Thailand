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
|gid|Integer(10)|PK|ttt|
|tam_code|String(6)||ttt|
|tam_th|String(254)||ttt|
|tam_en|String(254)||ttt|
|amp_code|String(4)||ttt|
|amp_th|String(254)||ttt|
|amp_en|String(254)||ttt|
|pro_code|String(2)||ttt|
|pro_th|String(254)||ttt|
|pro_en|String(254)||ttt|
|reg_nesdb|String(254)||ttt|
|reg_royin|String(254)||ttt|
|perimeter|Real(18,11)||ttt|
|area_sqkm|Real(18,11)||ttt|


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
