# สารบัญ Deployment

เลือกคู่มือให้ตรงกับรูปแบบติดตั้ง คู่มือเดิมยังเก็บครบโดยแยกตามระบบ เอกสารใน repository เป็นคำแนะนำสำหรับผู้ดูแล การจัดโครงสร้างครั้งนี้ไม่ได้ deploy หรือเปลี่ยนค่าบนเซิร์ฟเวอร์จริง

## เครื่องที่ติดตั้งอยู่แล้ว

อ่าน [คู่มือย้าย path](MIGRATION.md) ก่อน `git pull` โดยเฉพาะระบบจัดซื้อจัดจ้างที่มี `.env`, SQLite และไฟล์อัปโหลดอยู่ในโฟลเดอร์เดิม

## ข้อมูล GIS และการติดตั้งร่วม

| กรณี | คู่มือหรือเครื่องมือ |
| --- | --- |
| ให้บริการ GeoJSON ด้วย Ubuntu/Nginx | [DEPLOY](DEPLOY.md) |
| Procurement และ TPMAP บน Nginx ร่วมกัน | [DEPLOYMENT-PROCUREMENT-TPMAP](DEPLOYMENT-PROCUREMENT-TPMAP.md) |
| คู่มือครบระบบ พร้อมวิธีติดตั้งแยกปลายทาง | [DEPLOYMENT_GUIDE_FULL](DEPLOYMENT_GUIDE_FULL.md) |
| Pull ข้อมูล GIS และเลือก reload Nginx | [deploy/deploy.sh](../../deploy/deploy.sh) |
| แม่แบบ Nginx ส่วนกลาง | [ตัวอย่าง GIS](../../deploy/nginx/nginx.conf.example), [Procurement + TPMAP](../../deploy/nginx/nginx-procurement-tpmap.conf.example), [แบบครบ](../../deploy/nginx/nginx.conf.complete) |

## TPMAP Dashboard

| กรณี | คู่มือหรือเครื่องมือ |
| --- | --- |
| เริ่มต้นและเพิ่ม `/tpmap/` ในเว็บเดิม | [Quick Start](../../apps/tpmap-dashboard/QUICK-START-SUBDIRECTORY.md) |
| ขั้นตอนติดตั้งแบบละเอียด | [DEPLOYMENT](../../apps/tpmap-dashboard/DEPLOYMENT.md) |
| คำสั่ง production ผ่าน Webmin | [DEPLOYMENT_INSTRUCTIONS](../../apps/tpmap-dashboard/docs/deployment/DEPLOYMENT_INSTRUCTIONS.md) |
| คัดลอกไฟล์โดยไม่ใช้ Git บนปลายทาง | [DEPLOYMENT_STANDALONE](../../apps/tpmap-dashboard/docs/deployment/DEPLOYMENT_STANDALONE.md) |
| คำสั่งเพิ่ม TPMAP ใน checkout ร่วม | [INSTALL-COMMANDS.txt](../../apps/tpmap-dashboard/docs/deployment/INSTALL-COMMANDS.txt), [install-tpmap.sh](../../apps/tpmap-dashboard/install-tpmap.sh) |
| คัดลอกคำสั่งทีละบล็อก/ติดตั้งเต็มรูปแบบ | [install-commands.sh](../../apps/tpmap-dashboard/install-commands.sh), [deploy.sh](../../apps/tpmap-dashboard/deploy.sh) |
| ตรวจสอบตัวชี้วัด | [INDICATOR-PROBLEMS-VERIFICATION](../../apps/tpmap-dashboard/docs/INDICATOR-PROBLEMS-VERIFICATION.md) |

ใน checkout ใช้ `apps/tpmap-dashboard/` ส่วนการติดตั้งแบบคัดลอกอาจใช้ชื่อปลายทาง `tpmap_act/` ตามคู่มือ ชื่อเหล่านี้มีหน้าที่ต่างกัน

## ระบบจัดซื้อจัดจ้าง

| กรณี | คู่มือ |
| --- | --- |
| ภาพรวมและการพัฒนา | [README](../../apps/procurement-system/README.md) |
| Pull/build/restart | [DEPLOYMENT](../../apps/procurement-system/DEPLOYMENT.md) |
| คู่มือติดตั้งฉบับละเอียด | [DEPLOYMENT_GUIDE](../../apps/procurement-system/DEPLOYMENT_GUIDE.md) |
| คำสั่ง production เดิมที่ราก repo | [DEPLOYMENT_GUIDE](../../apps/procurement-system/docs/deployment/DEPLOYMENT_GUIDE.md), [DEPLOY_TO_PRODUCTION](../../apps/procurement-system/docs/deployment/DEPLOY_TO_PRODUCTION.md) |
| ติดตั้งใหม่ทั้งหมดและลบระบบเดิม | [CLEAN_INSTALL](../../apps/procurement-system/CLEAN_INSTALL.md) ใช้เฉพาะ fresh install ไม่ใช้ย้ายระบบที่มีข้อมูล |
| แก้ปัญหา deployment | [DEPLOYMENT_FIX](../../apps/procurement-system/DEPLOYMENT_FIX.md) |
| บันทึกผลและคำสั่งดูแลระบบ | [DEPLOYMENT_SUCCESS](../../apps/procurement-system/DEPLOYMENT_SUCCESS.md) |
| อัปโหลดเอกสาร | [DOCUMENT_UPLOAD_GUIDE](../../apps/procurement-system/DOCUMENT_UPLOAD_GUIDE.md) |

## ตรวจสอบ repository

รันจากราก checkout หลังแก้ path หรือย้ายเอกสาร

```bash
python3 scripts/check_repo_layout.py
```
