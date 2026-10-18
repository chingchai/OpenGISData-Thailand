#!/bin/bash
# API Testing Script

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Procurement System API"
echo "=================================="
echo ""

# Test 1: API Root
echo "1️⃣  Testing API Root (GET /api/)"
curl -s $BASE_URL/ | python3 -m json.tool
echo ""
echo ""

# Test 2: Login
echo "2️⃣  Testing Login (POST /api/auth/login)"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123","role":"admin"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed! Cannot get token"
  exit 1
fi

echo "✅ Login successful! Token length: ${#TOKEN}"
echo ""
echo ""

# Test 3: Get Projects
echo "3️⃣  Testing Get Projects (GET /api/projects)"
curl -s $BASE_URL/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""
echo ""

# Test 4: Get Project by ID
echo "4️⃣  Testing Get Project #1 (GET /api/projects/1)"
curl -s $BASE_URL/projects/1 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""
echo ""

# Test 5: Get Steps for Project #1
echo "5️⃣  Testing Get Steps (GET /api/projects/1/steps)"
curl -s $BASE_URL/projects/1/steps \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""
echo ""

# Test 6: Get Project Progress
echo "6️⃣  Testing Get Progress (GET /api/projects/1/steps/progress)"
curl -s $BASE_URL/projects/1/steps/progress \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""
echo ""

# Test 7: Get Overdue Steps
echo "7️⃣  Testing Get Overdue Steps (GET /api/steps/overdue)"
curl -s $BASE_URL/steps/overdue \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""
echo ""

echo "✅ All tests completed!"
