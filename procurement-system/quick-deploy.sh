#!/bin/bash
# Quick Deploy - One-line deployment

cd "$(dirname "$0")"
cd client && npm run build && cd ../server && (pkill -f "node server.js"; nohup node server.js > /tmp/server.log 2>&1 &) && echo "✅ Deployed! Server: http://localhost:3000 | Logs: tail -f /tmp/server.log"
