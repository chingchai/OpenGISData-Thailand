#!/bin/bash

#################################################
# สคริปต์สำหรับ Pull Code และ Deploy
# OpenGISData-Thailand
#################################################

set -e  # หยุดทำงานถ้าเจอ error

# สี
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   OpenGISData-Thailand Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ตรวจสอบว่าอยู่ใน git repository หรือไม่
if [ ! -d .git ]; then
    echo -e "${RED}Error: ไม่พบ .git directory${NC}"
    echo "กรุณารันสคริปต์นี้จากภายใน git repository"
    exit 1
fi

# แสดงสถานะปัจจุบัน
echo -e "${YELLOW}สถานะปัจจุบัน:${NC}"
git status
echo ""

# ดึง branch ปัจจุบัน
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}Branch ปัจจุบัน: ${GREEN}${CURRENT_BRANCH}${NC}"
echo ""

# ดึง commit ล่าสุดก่อน pull
BEFORE_COMMIT=$(git rev-parse HEAD)
echo -e "${YELLOW}Commit ก่อน pull:${NC} ${BEFORE_COMMIT:0:7}"
echo ""

# Pull code จาก remote
echo -e "${YELLOW}กำลัง pull code จาก origin/${CURRENT_BRANCH}...${NC}"
git pull origin ${CURRENT_BRANCH}
echo ""

# ดึง commit ล่าสุดหลัง pull
AFTER_COMMIT=$(git rev-parse HEAD)
echo -e "${YELLOW}Commit หลัง pull:${NC} ${AFTER_COMMIT:0:7}"
echo ""

# ตรวจสอบว่ามีการอัพเดทหรือไม่
if [ "$BEFORE_COMMIT" == "$AFTER_COMMIT" ]; then
    echo -e "${GREEN}✓ ไม่มีการอัพเดทใหม่${NC}"
else
    echo -e "${GREEN}✓ อัพเดทสำเร็จ!${NC}"
    echo ""
    echo -e "${YELLOW}การเปลี่ยนแปลง:${NC}"
    git log --oneline ${BEFORE_COMMIT}..${AFTER_COMMIT}
    echo ""

    # แสดงไฟล์ที่เปลี่ยนแปลง
    echo -e "${YELLOW}ไฟล์ที่เปลี่ยนแปลง:${NC}"
    git diff --name-status ${BEFORE_COMMIT}..${AFTER_COMMIT}
fi

echo ""

# ตรวจสอบสิทธิ์ไฟล์ (ถ้ารันด้วย web server user)
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}ตรวจสอบ nginx...${NC}"

    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓ Nginx กำลังทำงาน${NC}"

        # ถามว่าต้องการ reload nginx หรือไม่
        read -p "ต้องการ reload nginx? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo systemctl reload nginx
            echo -e "${GREEN}✓ Reload nginx สำเร็จ${NC}"
        fi
    else
        echo -e "${RED}✗ Nginx ไม่ทำงาน${NC}"
        read -p "ต้องการ start nginx? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo systemctl start nginx
            echo -e "${GREEN}✓ Start nginx สำเร็จ${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deployment เสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# แสดงข้อมูลไฟล์
echo -e "${YELLOW}ไฟล์ GeoJSON ที่พร้อมใช้งาน:${NC}"
ls -lh *.geojson 2>/dev/null || echo "ไม่พบไฟล์ .geojson"
echo ""

echo -e "${YELLOW}Timestamp:${NC} $(date)"
