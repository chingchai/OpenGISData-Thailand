# OpenGISData-Thailand
Open GIS Data Sources in Thailand

## เป็นไฟล์รูปแบบ geojson มีทั้งหมด 3 ไฟล์คือ
- ชั้นข้อมูลขอบเขตจังหวัด (province.geojson)
- ชั้นข้อมูลขอบเขตอำเภอ (districts.geojson)
- ชั้นข้อมูลขอบเขตตำบล (subdistricts.geojson)

## Data dictionary
**province**

|Field |Type |Key|
|----------------|-------------------------------|-----------------------------|
|id|Integer|PK|
|code|Varchar(150)||
|name_th|Varchar(150)||
|name_en|Varchar(150)||
|geography_id|Integer||


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
