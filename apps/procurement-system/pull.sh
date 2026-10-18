#!/bin/bash

#############################################
# 📥 Procurement System Pull Script
# สำหรับ Pull โค้ดล่าสุดจาก Git
#############################################

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BRANCH_NAME="master"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📥 Pulling Latest Code${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"
echo ""

# Fetch updates
echo -e "${YELLOW}🔍 Fetching updates from remote...${NC}"
git fetch origin
echo -e "${GREEN}✅ Fetch completed${NC}"
echo ""

# Checkout target branch
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo -e "${YELLOW}🔀 Switching to branch: ${BRANCH_NAME}${NC}"
    git checkout $BRANCH_NAME
    echo -e "${GREEN}✅ Switched to ${BRANCH_NAME}${NC}"
    echo ""
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin $BRANCH_NAME
echo -e "${GREEN}✅ Pull completed successfully${NC}"
echo ""

# Show recent commits
echo -e "${YELLOW}📝 Recent commits:${NC}"
git log --oneline -5
echo ""

# Show status
echo -e "${YELLOW}📊 Git status:${NC}"
git status
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Pull completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "   • To deploy: ./deploy.sh"
echo -e "   • To install dependencies: cd server && npm install"
echo -e "   • To build frontend: cd client && npm run build"
echo ""
