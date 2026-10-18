#!/bin/bash

#############################################
# 🚀 Git Pull + Deploy Script
# Pull from Git and Deploy in one command
#############################################

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BRANCH_NAME="master"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Git Pull + Deploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Pull from Git
echo -e "${YELLOW}📥 Step 1/3: Pulling from Git...${NC}"
git fetch origin
git checkout $BRANCH_NAME
git pull origin $BRANCH_NAME
echo -e "${GREEN}✅ Pull completed${NC}"
echo ""

# Step 2: Build Frontend
echo -e "${YELLOW}📦 Step 2/3: Building frontend...${NC}"
cd client
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Step 3: Restart Backend
echo -e "${YELLOW}🔄 Step 3/3: Restarting backend...${NC}"
cd server
pkill -f "node server.js" 2>/dev/null || true
nohup node server.js > /tmp/server.log 2>&1 &
echo -e "${GREEN}✅ Backend restarted${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "🌐 Server: http://localhost:3000"
echo -e "📝 Logs: tail -f /tmp/server.log"
echo ""
