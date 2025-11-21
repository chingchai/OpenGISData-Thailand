#!/bin/bash

###############################################################################
# TPMAP Household Dashboard - Deployment Script
# สำหรับติดตั้งและ deploy บน Ubuntu Server + Nginx
###############################################################################

set -e  # Exit on error

# สี
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ฟังก์ชันแสดงข้อความ
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

# ตรวจสอบว่ารันด้วย sudo หรือไม่
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "กรุณารันสคริปต์นี้ด้วย sudo"
        echo "Usage: sudo ./deploy.sh"
        exit 1
    fi
}

# ตรวจสอบว่าเป็น Ubuntu หรือไม่
check_ubuntu() {
    if [ ! -f /etc/os-release ]; then
        print_error "ไม่สามารถตรวจสอบ OS ได้"
        exit 1
    fi

    . /etc/os-release
    if [ "$ID" != "ubuntu" ]; then
        print_error "สคริปต์นี้รองรับเฉพาะ Ubuntu เท่านั้น"
        exit 1
    fi

    print_success "OS: Ubuntu $VERSION"
}

# ติดตั้ง Nginx
install_nginx() {
    print_header "ติดตั้ง Nginx"

    if command -v nginx &> /dev/null; then
        print_info "Nginx ติดตั้งแล้ว ($(nginx -v 2>&1))"
        read -p "ต้องการติดตั้งใหม่หรือไม่? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi

    apt update
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx

    print_success "ติดตั้ง Nginx สำเร็จ"
}

# สร้างไดเรกทอรีและคัดลอกไฟล์
setup_application() {
    print_header "ตั้งค่าแอปพลิเคชัน"

    APP_DIR="/var/www/tpmap-household-dashboard"

    # สร้างไดเรกทอรีถ้ายังไม่มี
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
        print_success "สร้างไดเรกทอรี $APP_DIR"
    else
        print_info "ไดเรกทอรี $APP_DIR มีอยู่แล้ว"
        read -p "ต้องการลบและสร้างใหม่หรือไม่? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$APP_DIR"
            mkdir -p "$APP_DIR"
            print_success "สร้างไดเรกทอรีใหม่"
        fi
    fi

    # คัดลอกไฟล์
    print_info "คัดลอกไฟล์แอปพลิเคชัน..."

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cp -r "$SCRIPT_DIR"/* "$APP_DIR/tpmap_act/"

    # ตั้งค่าสิทธิ์
    chown -R www-data:www-data "$APP_DIR"
    chmod -R 755 "$APP_DIR"

    print_success "คัดลอกและตั้งค่าสิทธิ์ไฟล์สำเร็จ"
}

# ตั้งค่า Nginx
configure_nginx() {
    print_header "ตั้งค่า Nginx"

    # ถามโดเมน
    read -p "กรุณาใส่โดเมน (หรือกด Enter เพื่อใช้ localhost): " DOMAIN
    DOMAIN=${DOMAIN:-localhost}

    # คัดลอกและแก้ไขคอนฟิก
    NGINX_CONF="/etc/nginx/sites-available/tpmap-household-dashboard"
    cp /var/www/tpmap-household-dashboard/tpmap_act/nginx.conf "$NGINX_CONF"

    # แทนที่โดเมนในคอนฟิก
    sed -i "s/your-domain.com/$DOMAIN/g" "$NGINX_CONF"

    # สร้าง symbolic link
    if [ -f /etc/nginx/sites-enabled/tpmap-household-dashboard ]; then
        rm /etc/nginx/sites-enabled/tpmap-household-dashboard
    fi
    ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/

    # ลบ default site
    if [ -f /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
        print_info "ลบไฟล์คอนฟิก default"
    fi

    # ทดสอบคอนฟิก
    print_info "ทดสอบคอนฟิก Nginx..."
    if nginx -t; then
        print_success "คอนฟิก Nginx ถูกต้อง"
        systemctl reload nginx
        print_success "Reload Nginx สำเร็จ"
    else
        print_error "คอนฟิก Nginx ไม่ถูกต้อง กรุณาตรวจสอบ"
        exit 1
    fi
}

# ตั้งค่า Firewall
setup_firewall() {
    print_header "ตั้งค่า Firewall (UFW)"

    if ! command -v ufw &> /dev/null; then
        print_info "ติดตั้ง UFW..."
        apt install -y ufw
    fi

    # ถามก่อนเปิดใช้งาน
    read -p "ต้องการตั้งค่า UFW หรือไม่? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "ข้ามการตั้งค่า Firewall"
        return
    fi

    # อนุญาต SSH ก่อน (สำคัญมาก!)
    ufw allow OpenSSH
    print_success "อนุญาต OpenSSH"

    # อนุญาต HTTP และ HTTPS
    ufw allow 'Nginx Full'
    print_success "อนุญาต Nginx Full (HTTP + HTTPS)"

    # เปิดใช้งาน UFW
    ufw --force enable
    print_success "เปิดใช้งาน UFW"

    # แสดงสถานะ
    ufw status
}

# ติดตั้ง SSL (Let's Encrypt)
setup_ssl() {
    print_header "ติดตั้ง SSL Certificate (Let's Encrypt)"

    read -p "ต้องการติดตั้ง SSL certificate หรือไม่? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "ข้ามการติดตั้ง SSL"
        return
    fi

    # ติดตั้ง Certbot
    if ! command -v certbot &> /dev/null; then
        print_info "ติดตั้ง Certbot..."
        apt install -y certbot python3-certbot-nginx
    fi

    # ถามโดเมน
    read -p "กรุณาใส่โดเมนสำหรับ SSL: " SSL_DOMAIN

    if [ -z "$SSL_DOMAIN" ] || [ "$SSL_DOMAIN" = "localhost" ]; then
        print_error "ไม่สามารถใช้ localhost สำหรับ SSL ได้"
        return
    fi

    # ขอ certificate
    print_info "กำลังขอ SSL certificate สำหรับ $SSL_DOMAIN..."
    certbot --nginx -d "$SSL_DOMAIN" -d "www.$SSL_DOMAIN"

    if [ $? -eq 0 ]; then
        print_success "ติดตั้ง SSL certificate สำเร็จ"
    else
        print_error "ติดตั้ง SSL certificate ไม่สำเร็จ"
    fi
}

# สรุปการติดตั้ง
show_summary() {
    print_header "สรุปการติดตั้ง"

    echo "✓ ระบบติดตั้งและตั้งค่าเรียบร้อยแล้ว"
    echo ""
    echo "ข้อมูลการเข้าถึง:"
    echo "  - Application Directory: /var/www/tpmap-household-dashboard/tpmap_act"
    echo "  - Nginx Config: /etc/nginx/sites-available/tpmap-household-dashboard"
    echo "  - Access Log: /var/log/nginx/tpmap-household-dashboard-access.log"
    echo "  - Error Log: /var/log/nginx/tpmap-household-dashboard-error.log"
    echo ""
    echo "URL สำหรับเข้าใช้งาน:"
    echo "  - http://$DOMAIN/household-dashboard.html"
    echo "  - http://$DOMAIN/indicators-selector.html"
    echo ""
    echo "คำสั่งที่มีประโยชน์:"
    echo "  - ดู logs: sudo tail -f /var/log/nginx/tpmap-household-dashboard-*.log"
    echo "  - Reload Nginx: sudo systemctl reload nginx"
    echo "  - Restart Nginx: sudo systemctl restart nginx"
    echo "  - ทดสอบคอนฟิก: sudo nginx -t"
    echo ""
    print_success "การติดตั้งเสร็จสมบูรณ์!"
}

###############################################################################
# Main
###############################################################################

main() {
    clear
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║    TPMAP Household Dashboard - Deployment Script          ║"
    echo "║    สำหรับ Ubuntu Server + Nginx                           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    check_root
    check_ubuntu

    # ถามยืนยันก่อนเริ่ม
    read -p "ต้องการเริ่มการติดตั้งหรือไม่? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "ยกเลิกการติดตั้ง"
        exit 0
    fi

    install_nginx
    setup_application
    configure_nginx
    setup_firewall
    setup_ssl
    show_summary
}

# รันฟังก์ชันหลัก
main "$@"
