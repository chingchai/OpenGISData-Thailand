#!/bin/bash

echo "🚀 Starting Procurement System Deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Build frontend
echo ""
echo "📦 Building frontend..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend build completed"

# Start/Restart backend
cd ../server
echo ""
echo "🔄 Restarting backend server..."

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    # Using PM2
    if pm2 list | grep -q "procurement-server"; then
        pm2 restart procurement-server
        echo "✅ Backend restarted with PM2"
    else
        pm2 start server.js --name procurement-server
        echo "✅ Backend started with PM2"
    fi

    echo ""
    echo "📊 Server Status:"
    pm2 status procurement-server

    echo ""
    echo "📝 Recent Logs:"
    pm2 logs procurement-server --lines 10 --nostream
else
    # Using node directly (background)
    pkill -f "node server.js"
    nohup node server.js > /tmp/server.log 2>&1 &
    echo "✅ Backend started (no PM2, running in background)"
    echo "📝 Logs: tail -f /tmp/server.log"
fi

echo ""
echo "✅ Deployment completed!"
echo "🌐 Server: http://localhost:3000"
echo "📱 Client: http://localhost:5173 (dev) or served by backend"
