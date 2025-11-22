#!/bin/bash

##############################################################################
# สคริปต์ติดตั้ง TPMAP Dashboard บน nginx
# สำหรับใช้ร่วมกับ Procurement System
##############################################################################

set -e  # หยุดทำงานถ้าเจอ error

# สี
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   TPMAP Dashboard Installation${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ตรวจสอบว่ารันด้วย root หรือไม่
if [ "$EUID" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

##############################################################################
# ขั้นตอนที่ 1: ตรวจสอบไฟล์
##############################################################################

echo -e "${BLUE}[1/5] ตรวจสอบไฟล์ TPMAP...${NC}"

if [ ! -d "tpmap_act" ]; then
    echo -e "${YELLOW}ไม่พบ tpmap_act/ กำลังดึงจาก upstream...${NC}"

    # เพิ่ม upstream remote (ถ้ายังไม่มี)
    if ! git remote | grep -q upstream; then
        git remote add upstream https://github.com/chingchai/OpenGISData-Thailand.git
    fi

    # Fetch และ checkout
    git fetch upstream
    git checkout upstream/master -- tpmap_act/

    echo -e "${GREEN}✓ ดึงไฟล์สำเร็จ${NC}"
else
    echo -e "${GREEN}✓ พบไฟล์ tpmap_act/${NC}"
fi

# ตรวจสอบไฟล์สำคัญ
REQUIRED_FILES=(
    "tpmap_act/household-dashboard.html"
    "tpmap_act/indicators-selector.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ ไม่พบไฟล์: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ ตรวจสอบไฟล์ครบถ้วน${NC}"
echo ""

##############################################################################
# ขั้นตอนที่ 2: ตั้งค่าสิทธิ์
##############################################################################

echo -e "${BLUE}[2/5] ตั้งค่าสิทธิ์ไฟล์...${NC}"

CURRENT_DIR=$(pwd)

$SUDO chown -R www-data:www-data "$CURRENT_DIR/tpmap_act"
$SUDO chmod -R 755 "$CURRENT_DIR/tpmap_act"

echo -e "${GREEN}✓ ตั้งค่าสิทธิ์สำเร็จ${NC}"
echo ""

##############################################################################
# ขั้นตอนที่ 3: สำรองและคัดลอก nginx config
##############################################################################

echo -e "${BLUE}[3/5] ตั้งค่า nginx configuration...${NC}"

NGINX_SITE="procurement-system"
NGINX_AVAILABLE="/etc/nginx/sites-available/$NGINX_SITE"
NGINX_ENABLED="/etc/nginx/sites-enabled/$NGINX_SITE"

# ตรวจสอบว่ามีไฟล์ config อยู่หรือไม่
if [ -f "$NGINX_AVAILABLE" ]; then
    echo -e "${YELLOW}พบไฟล์ config เดิม กำลังสำรอง...${NC}"
    BACKUP_FILE="${NGINX_AVAILABLE}.backup.$(date +%Y%m%d_%H%M%S)"
    $SUDO cp "$NGINX_AVAILABLE" "$BACKUP_FILE"
    echo -e "${GREEN}✓ สำรองไว้ที่: $BACKUP_FILE${NC}"

    # ตรวจสอบว่ามี location /tpmap/ อยู่แล้วหรือไม่
    if $SUDO grep -q "location /tpmap/" "$NGINX_AVAILABLE"; then
        echo -e "${YELLOW}! พบ location /tpmap/ อยู่แล้ว${NC}"
        echo -e "${YELLOW}! จะไม่แก้ไขไฟล์ config${NC}"
        SKIP_CONFIG=true
    else
        SKIP_CONFIG=false
    fi
else
    echo -e "${YELLOW}ไม่พบไฟล์ config เดิม${NC}"
    SKIP_CONFIG=false
fi

if [ "$SKIP_CONFIG" = false ]; then
    echo -e "${YELLOW}กรุณาเพิ่ม location block นี้เข้าไปใน nginx config ด้วยมือ:${NC}"
    echo ""
    echo -e "${BLUE}    location /tpmap/ {${NC}"
    echo -e "${BLUE}        alias $CURRENT_DIR/tpmap_act/;${NC}"
    echo -e "${BLUE}        index household-dashboard.html indicators-selector.html;${NC}"
    echo -e "${BLUE}        try_files \$uri \$uri/ =404;${NC}"
    echo -e "${BLUE}    }${NC}"
    echo ""
    echo -e "${YELLOW}หรือคัดลอกจากไฟล์: nginx-procurement-tpmap.conf.example${NC}"
    echo ""

    read -p "กด Enter เมื่อแก้ไขเสร็จแล้ว..."
fi

echo ""

##############################################################################
# ขั้นตอนที่ 4: ทดสอบ nginx config
##############################################################################

echo -e "${BLUE}[4/5] ทดสอบ nginx configuration...${NC}"

if $SUDO nginx -t; then
    echo -e "${GREEN}✓ nginx config ถูกต้อง${NC}"
else
    echo -e "${RED}✗ nginx config มีข้อผิดพลาด${NC}"
    echo -e "${YELLOW}กรุณาตรวจสอบและแก้ไข${NC}"
    exit 1
fi

echo ""

##############################################################################
# ขั้นตอนที่ 5: Reload nginx
##############################################################################

echo -e "${BLUE}[5/5] Reload nginx...${NC}"

if $SUDO systemctl reload nginx; then
    echo -e "${GREEN}✓ Reload nginx สำเร็จ${NC}"
else
    echo -e "${RED}✗ ไม่สามารถ reload nginx ได้${NC}"
    exit 1
fi

echo ""

##############################################################################
# แสดงผลสรุป
##############################################################################

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ติดตั้งเสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ดึง IP/Domain จาก nginx config
if [ -f "$NGINX_AVAILABLE" ]; then
    SERVER_NAME=$(grep -m 1 "server_name" "$NGINX_AVAILABLE" | awk '{print $2}' | tr -d ';')
    echo -e "${YELLOW}เข้าถึง TPMAP Dashboard ได้ที่:${NC}"
    echo -e "  ${BLUE}http://$SERVER_NAME/tpmap/household-dashboard.html${NC}"
    echo -e "  ${BLUE}http://$SERVER_NAME/tpmap/indicators-selector.html${NC}"
    echo -e "  ${BLUE}http://$SERVER_NAME/tpmap/indicators-38-snippet.html${NC}"
else
    echo -e "${YELLOW}เข้าถึง TPMAP Dashboard ได้ที่:${NC}"
    echo -e "  ${BLUE}http://your-server/tpmap/household-dashboard.html${NC}"
fi

echo ""
echo -e "${YELLOW}ทดสอบด้วย curl:${NC}"
echo -e "  ${BLUE}curl -I http://localhost/tpmap/household-dashboard.html${NC}"
echo ""

##############################################################################
# ตรวจสอบและแสดงไฟล์
##############################################################################

echo -e "${YELLOW}ไฟล์ที่พร้อมใช้งาน:${NC}"
ls -lh tpmap_act/*.html 2>/dev/null || echo "ไม่พบไฟล์ .html"
echo ""

echo -e "${GREEN}Timestamp: $(date)${NC}"
