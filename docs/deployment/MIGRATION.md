# ย้ายระบบที่ติดตั้งจากโครงสร้างเดิม

คู่มือนี้เตรียมให้ผู้ดูแลเซิร์ฟเวอร์ดำเนินการเอง การจัดโครงสร้าง repository ไม่ได้รันคำสั่ง deploy, reload Nginx, restart PM2 หรือแก้ฐานข้อมูลบนเซิร์ฟเวอร์

## ตำแหน่งที่เปลี่ยน

ตำแหน่งด้านล่างอ้างอิงจากราก checkout ของ `OpenGISData-Thailand`

| เดิม | ใหม่ |
| --- | --- |
| `tpmap_act/` | `apps/tpmap-dashboard/` |
| `procurement-system/` | `apps/procurement-system/` |
| `deploy.sh` | `deploy/deploy.sh` |
| `install-tpmap.sh` | `apps/tpmap-dashboard/install-tpmap.sh` |
| `nginx.conf.example`, `nginx.conf.complete`, `nginx-procurement-tpmap.conf.example` | `deploy/nginx/` โดยคงชื่อไฟล์ |
| `DEPLOY.md`, `DEPLOYMENT-PROCUREMENT-TPMAP.md`, `DEPLOYMENT_GUIDE_FULL.md` | `docs/deployment/` โดยคงชื่อไฟล์ |
| `DEPLOYMENT_GUIDE.md`, `DEPLOY_TO_PRODUCTION.md` ที่ราก | `apps/procurement-system/docs/deployment/` |
| `DEPLOYMENT_INSTRUCTIONS.md`, `DEPLOYMENT_STANDALONE.md`, `INSTALL-COMMANDS.txt` | `apps/tpmap-dashboard/docs/deployment/` |
| `INDICATOR-PROBLEMS-VERIFICATION.md` | `apps/tpmap-dashboard/docs/INDICATOR-PROBLEMS-VERIFICATION.md` |
| `PR_DESCRIPTION.md` | `docs/history/PR_DESCRIPTION.md` |

GeoJSON ทั้ง 5 ไฟล์ยังอยู่ที่รากเดิม `scripts/`, `tests/`, `docs/data/` และใบอนุญาตข้อมูลยังอยู่ตำแหน่งเดิม

## 1. สำรองก่อน git pull

1. บันทึก checkout path, branch และ commit ปัจจุบันด้วย `pwd`, `git branch --show-current`, `git rev-parse HEAD` และ `git status --short` เก็บการแก้ไฟล์ tracked แยกไว้นอก checkout ก่อนอัปเดต
2. บันทึก PM2 process names, working directories และ environment ด้วย `pm2 describe <ชื่อ process>` เก็บสำเนา PM2 dump และ Nginx configuration ที่เปิดใช้งานจริงไว้นอก checkout ใช้สิทธิ์อ่านเฉพาะผู้ดูแลสำหรับไฟล์ที่มี secret
3. หยุด process ที่เขียนข้อมูลในช่วง maintenance ก่อนสำรอง SQLite หรือใช้ SQLite backup API/`.backup` ให้ได้ snapshot ที่สอดคล้องกัน หากสำรองแบบคัดลอกหลังหยุด process ให้เก็บไฟล์ฐานข้อมูลและไฟล์ประกอบ `-wal`, `-shm` ที่ยังมีอยู่ด้วย
4. สำรอง `procurement-system/.env`, `procurement-system/server/.env`, `procurement-system/server/data/database/` (รวม SQLite), `procurement-system/server/uploads/` และ logs ทั้งหมดตามตำแหน่งที่ใช้งานจริง รวมถึงไฟล์ที่ `DB_PATH`/`UPLOAD_PATH` หรือ environment ชี้ไว้นอก checkout สำหรับ MySQL/MariaDB ให้ใช้วิธีสำรองฐานข้อมูลของระบบนั้น
5. ตรวจว่า backup อ่านได้และมีฐานข้อมูลกับไฟล์อัปโหลดครบ เก็บสำเนาไว้นอก checkout และเก็บไว้จนยืนยันระบบใหม่แล้ว

`git pull` จะนำไฟล์ tracked ออกจากตำแหน่งเก่าเมื่อรับ commit ย้ายโฟลเดอร์ ส่วน `.env`, SQLite, uploads และข้อมูล runtime ที่ untracked/ignored มักยังค้างในโฟลเดอร์เดิม Git ไม่ย้ายข้อมูลเหล่านี้ให้ จึงต้องสำรองก่อน pull และคัดลอกเฉพาะข้อมูล runtime ไปแอปใหม่หลังตรวจสอบ อย่าลบโฟลเดอร์เก่าเพียงเพราะเห็น source ย้ายแล้ว

## 2. อัปเดต source และนำ runtime data กลับมา

1. หลังสำรองแล้ว ให้ pull branch ที่มีโครงสร้าง `apps/` ตรวจ `apps/procurement-system/server/` และ `apps/tpmap-dashboard/` ว่ามีไฟล์ครบ
2. ตรวจไฟล์ runtime ที่ยังอยู่ใน `procurement-system/` เดิมกับ backup แล้วคัดลอก `.env`, ฐานข้อมูล และ uploads ไปตำแหน่งสัมพันธ์เดิมภายใน `apps/procurement-system/` รักษา owner, permissions และชื่อไฟล์เดิม คัดลอกทีละชุดและตรวจปลายทางก่อนเขียนทับ
3. ตรวจ `DB_PATH`, upload paths และ environment ที่เป็น absolute path ให้ชี้ตำแหน่งใหม่ ส่วนข้อมูลที่เก็บนอก checkout อยู่แล้วอาจใช้ path เดิมต่อได้
4. ติดตั้ง dependency และ build client ตามคู่มือแอป โดยรันจาก `apps/procurement-system/` อย่าใช้ `clean-install.cjs`, reset database, seed หรือ init database เพื่อย้ายระบบที่มีข้อมูลอยู่แล้ว

## 3. ปรับ Nginx และ PM2

สำหรับเครื่องที่เสิร์ฟจาก checkout ให้เปลี่ยนเฉพาะ filesystem path ตัวอย่าง

```text
/var/www/OpenGISData-Thailand/procurement-system/client/dist
→ /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist

/var/www/OpenGISData-Thailand/tpmap_act/
→ /var/www/OpenGISData-Thailand/apps/tpmap-dashboard/
```

รักษา public locations `/procurement/`, `/procurement/api/` และ `/tpmap/` รวมถึง proxy ports ตามระบบจริง GeoJSON download URLs คงเดิมโดยคง document root ของข้อมูล GIS ไว้ ถ้าใช้ `/tpmap_act/` เป็น public URL อยู่แล้ว ให้คง location นั้นและเปลี่ยนเฉพาะ alias ไป source ใหม่

symlink เช่น `/var/www/html/procurement` ที่ชี้ไป `procurement-system/client/dist` เดิมอาจ dangling ทันทีหลัง pull ตรวจด้วย `readlink` แล้วเปลี่ยน target เป็น `apps/procurement-system/client/dist` หลัง build สำเร็จ ทดสอบ `nginx -t` ก่อน reload และตรวจ server block จริงก่อนคัดลอกแม่แบบ

PM2 ที่มี process อยู่แล้วจะยังจำ cwd เก่า ให้ใช้ชื่อ process เดิมและกำหนด cwd ใหม่เป็น `apps/procurement-system/server` หรือเริ่มใหม่จาก ecosystem config ที่แอปหลังบันทึกค่าปัจจุบัน อย่าสร้าง process ซ้ำบน port เดิม tracked `ecosystem.config.cjs` อ้างอิง server และ log paths จากตำแหน่งไฟล์ config แล้ว ตรวจ environment เดิมก่อนบันทึก `pm2 save`

หาก TPMAP ติดตั้งแบบคัดลอกไป `/var/www/tpmap-household-dashboard/tpmap_act/` หรือ `/var/www/project-tracking/tpmap_act/` ให้คงปลายทางและ Nginx alias เดิมได้ เปลี่ยนเพียงแหล่งไฟล์ที่คัดลอกเป็น `apps/tpmap-dashboard/` โฟลเดอร์เหล่านี้เป็น standalone deployment targets ไม่ใช่โฟลเดอร์เก่าใน checkout

## 4. ปรับ automation และตรวจบริการ

- แก้ cron, CI/CD, shell aliases และคำสั่งในระบบ monitoring ที่เคยเรียก root `deploy.sh`, root `install-tpmap.sh` หรือ path แอปเดิม
- ตรวจ PM2 cwd, environment และ log path รวมถึง permission ของ SQLite/uploads
- ทดสอบหน้า `/procurement/`, API ที่ใช้งานจริง, `/tpmap/household-dashboard.html` และ GeoJSON URLs เดิมทุกชุด
- ตรวจ login, อ่านรายการโครงการและไฟล์อัปโหลดเดิมก่อนเปิดให้เขียนข้อมูลอีกครั้ง ตรวจ Nginx/PM2 logs ว่าไม่มี path เก่าที่หาไม่พบ
- บน checkout รัน `python3 scripts/check_repo_layout.py` การตรวจนี้ตรวจโครงสร้าง repository และลิงก์ ไม่ได้ยืนยันสถานะ live server

## 5. ย้อนกลับโดยรักษาข้อมูล

ถ้าตรวจไม่ผ่าน ให้หยุด process ที่เขียนข้อมูล สำรอง runtime data ปัจจุบันอีกรอบ และเปิด checkout ของ commit เดิมในโฟลเดอร์แยก หรือใช้ snapshot source ที่สำรองไว้ คืน Nginx alias/symlink และ PM2 cwd ให้ชี้ checkout เดิมตามบันทึก ตรวจ config ก่อนเริ่มบริการ

อย่าใช้ `git reset --hard`, clean-install หรือคัดลอก backup ทับฐานข้อมูลปัจจุบันเพื่อย้อนกลับแบบอัตโนมัติ หากมีข้อมูลใหม่หลัง migration ต้องเลือก snapshot ที่ถูกต้องและพิจารณาการเปลี่ยน schema ก่อน restore เก็บทั้ง backup ก่อนย้ายและข้อมูลล่าสุดจนกว่าผู้ดูแลตรวจความครบถ้วนแล้ว
