#!/bin/bash

# ===================================================
# สคริปต์ติดตั้งระบบจัดซื้อจัดจ้าง - เทศบาลตำบลหัวทะเล
# ===================================================

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  ติดตั้งระบบจัดซื้อจัดจ้าง"
echo "  เทศบาลตำบลหัวทะเล"
echo "=========================================="
echo ""

# Check if running on Ubuntu
if [ ! -f /etc/lsb-release ]; then
    echo "❌ Error: This script is designed for Ubuntu"
    exit 1
fi

# Check Node.js
echo "🔍 ตรวจสอบ Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ไม่ได้ติดตั้ง"
    echo "📥 กำลังติดตั้ง Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check npm
NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Install PM2
echo ""
echo "📦 ติดตั้ง PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "✅ PM2 ติดตั้งเรียบร้อย"
else
    echo "✅ PM2 ติดตั้งแล้ว"
fi

# Get current directory
INSTALL_DIR=$(pwd)
echo ""
echo "📂 ติดตั้งที่: $INSTALL_DIR"

# Install Backend Dependencies
echo ""
echo "🔧 ติดตั้ง Backend Dependencies..."
cd server
npm install
echo "✅ Backend dependencies ติดตั้งเรียบร้อย"

# Setup .env file
if [ ! -f .env ]; then
    echo ""
    echo "📝 สร้างไฟล์ .env..."
    cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
JWT_SECRET=change-this-secret-key-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
DB_PATH=./data/database/procurement.db
LOG_LEVEL=info
EOF
    echo "✅ ไฟล์ .env สร้างเรียบร้อย"
    echo "⚠️  อย่าลืมแก้ไข JWT_SECRET ใน server/.env"
else
    echo "ℹ️  ไฟล์ .env มีอยู่แล้ว"
fi

# Initialize Database
echo ""
echo "🗄️  สร้างฐานข้อมูล..."
mkdir -p data/database
npm run db:init
echo "✅ ฐานข้อมูลสร้างเรียบร้อย"

# Install Frontend Dependencies
echo ""
echo "🎨 ติดตั้ง Frontend Dependencies..."
cd ../client
npm install
echo "✅ Frontend dependencies ติดตั้งเรียบร้อย"

# Build Frontend
echo ""
echo "🏗️  Build Frontend..."
npm run build
echo "✅ Frontend build เรียบร้อย"

# Create logs directories
echo ""
echo "📁 สร้าง directories สำหรับ logs..."
mkdir -p ../server/logs
mkdir -p logs
echo "✅ Logs directories สร้างเรียบร้อย"

# Go back to root
cd ..

# Create ecosystem file if not exists
if [ ! -f ecosystem.config.js ]; then
    echo ""
    echo "📝 สร้างไฟล์ ecosystem.config.js สำหรับ PM2..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'procurement-api',
      cwd: './server',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    }
  ]
};
EOF
    echo "✅ ecosystem.config.js สร้างเรียบร้อย"
fi

echo ""
echo "=========================================="
echo "  ✅ ติดตั้งเสร็จสมบูรณ์!"
echo "=========================================="
echo ""
echo "🚀 เริ่มใช้งาน:"
echo ""
echo "  # รันด้วย PM2 (Production)"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
echo "  # หรือรันแบบ Development"
echo "  cd server && npm start"
echo ""
echo "📝 URLs:"
echo "  Backend API: http://localhost:3000/api"
echo "  Frontend:    http://localhost:3001"
echo ""
echo "👤 Default Login:"
echo "  Username: admin"
echo "  Password: password123"
echo "  Role: admin"
echo ""
echo "📚 อ่านเพิ่มเติม: DEPLOYMENT.md"
echo ""
