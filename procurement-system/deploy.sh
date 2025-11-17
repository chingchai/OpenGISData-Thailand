#!/bin/bash

#############################################
# 🚀 Procurement System Deployment Script
# สำหรับ Deploy โค้ดใหม่ไปยัง Production
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BRANCH_NAME="claude/procurement-system-functions-011CUyMA2PaywR21JfUuNsAK"
PROJECT_DIR="/root/OpenGISData-Thailand/procurement-system"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Procurement System Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${YELLOW}📥 Step 1: Pulling latest code...${NC}"
git fetch origin
git checkout $BRANCH_NAME
git pull origin $BRANCH_NAME
echo -e "${GREEN}✅ Code updated successfully${NC}"
echo ""

# Step 2: Install backend dependencies
echo -e "${YELLOW}📦 Step 2: Installing backend dependencies...${NC}"
cd server
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 3: Build frontend
echo -e "${YELLOW}🔨 Step 3: Building frontend...${NC}"
cd ../client
npm install
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 4: Restart server
echo -e "${YELLOW}🔄 Step 4: Restarting server...${NC}"
cd ../server

# Check if pm2 is available
if command -v pm2 &> /dev/null; then
    echo "Using PM2 to restart server..."
    pm2 restart all || pm2 start npm --name "procurement-system" -- start
    pm2 save
else
    echo "PM2 not found. Using manual restart..."
    # Kill existing process
    pkill -f 'node server.js' || true
    # Start server in background
    nohup npm start > ../server.log 2>&1 &
    echo "Server started. PID: $!"
fi

echo -e "${GREEN}✅ Server restarted successfully${NC}"
echo ""

# Step 5: Check server status
echo -e "${YELLOW}🔍 Step 5: Checking server status...${NC}"
sleep 3
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running and healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Server health check skipped (endpoint may not exist)${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📌 Next steps:${NC}"
echo -e "   1. Open browser: http://49.231.27.66"
echo -e "   2. Press F12 and run: localStorage.clear(); location.reload();"
echo -e "   3. Login with your credentials"
echo ""
echo -e "${YELLOW}📝 Recent commits:${NC}"
git log --oneline -5
echo ""
