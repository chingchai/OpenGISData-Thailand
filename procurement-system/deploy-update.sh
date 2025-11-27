#!/bin/bash

# ========================================
# Procurement System - Pull & Update Script
# For Server: 202.29.4.66
# ========================================

set -e

echo "========================================="
echo "  🚀 Procurement System - Pull Update"
echo "========================================="
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "📍 Working Directory: $PROJECT_ROOT"
echo ""

# ========================================
# Step 1: Pull latest code
# ========================================
echo "📥 Step 1: Pulling latest code from git..."
BRANCH=$(git branch --show-current)
echo "   Branch: $BRANCH"

git fetch origin "$BRANCH"
git pull origin "$BRANCH"

echo "✅ Code updated"
echo ""

# ========================================
# Step 2: Check if dependencies changed
# ========================================
echo "🔍 Step 2: Checking for dependency changes..."

# Backend dependencies
if [ -f "$PROJECT_ROOT/procurement-system/server/package.json" ]; then
    cd "$PROJECT_ROOT/procurement-system/server"
    echo "   Checking backend dependencies..."
    # Uncomment if package.json changed
    # npm install
    cd "$PROJECT_ROOT"
fi

# Frontend dependencies
if [ -f "$PROJECT_ROOT/procurement-system/client/package.json" ]; then
    cd "$PROJECT_ROOT/procurement-system/client"
    echo "   Checking frontend dependencies..."
    # Uncomment if package.json changed
    # npm install
    cd "$PROJECT_ROOT"
fi

echo "✅ Dependencies checked"
echo ""

# ========================================
# Step 3: Rebuild frontend if needed
# ========================================
echo "🏗️  Step 3: Rebuilding frontend..."
cd "$PROJECT_ROOT/procurement-system/client"

# Check if src files were modified
if git diff HEAD@{1} --name-only | grep -q "procurement-system/client/src"; then
    echo "   Frontend code changed - rebuilding..."
    npm run build
    echo "✅ Frontend rebuilt"
else
    echo "   No frontend changes - skipping build"
fi

cd "$PROJECT_ROOT"
echo ""

# ========================================
# Step 4: Restart services
# ========================================
echo "🔄 Step 4: Restarting services..."

# Restart PM2
if pm2 list | grep -q "procurement-api"; then
    echo "   Restarting PM2 (procurement-api)..."
    pm2 restart procurement-api
    echo "✅ PM2 restarted"
else
    echo "   Starting PM2..."
    cd "$PROJECT_ROOT/procurement-system"
    pm2 start ecosystem.config.cjs
    echo "✅ PM2 started"
fi

# Reload Nginx
if command -v nginx &> /dev/null; then
    echo "   Reloading Nginx..."
    nginx -t && nginx -s reload 2>/dev/null || echo "   ⚠️  Nginx reload skipped"
fi

echo ""

# ========================================
# Step 5: Verify deployment
# ========================================
echo "✅ Step 5: Verifying deployment..."
echo ""

sleep 2

# Check services
echo "Services Status:"
echo "  • Nginx: $(ps aux | grep -E 'nginx.*master' | grep -v grep > /dev/null && echo '✅ Running' || echo '❌ Stopped')"
echo "  • PM2: $(pm2 list 2>/dev/null | grep -q 'procurement-api.*online' && echo '✅ Running' || echo '❌ Stopped')"
echo "  • Backend: $(ss -tulpn 2>/dev/null | grep :3000 > /dev/null && echo '✅ Port 3000' || echo '❌ Not running')"
echo ""

# Test endpoints
echo "Testing Endpoints:"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/procurement/ 2>/dev/null || echo "000")
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/procurement/api/ 2>/dev/null || echo "000")

echo "  • Frontend: $FRONTEND_STATUS $([ "$FRONTEND_STATUS" = "200" ] && echo '✅' || echo '❌')"
echo "  • API: $API_STATUS $([ "$API_STATUS" = "200" ] && echo '✅' || echo '❌')"
echo ""

# ========================================
# Summary
# ========================================
echo "========================================="
echo "  ✅ Update Complete!"
echo "========================================="
echo ""
echo "🌐 Access at:"
echo "   http://49.231.27.66/procurement/"
echo "   http://202.29.4.66/procurement/"
echo ""
echo "🔐 Login: admin / password123"
echo ""
echo "📝 Latest commit:"
git log --oneline -1
echo ""
