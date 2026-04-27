#!/bin/bash
# Full System Test - Frontend & Backend Integration

echo "=== HomePlus Full Stack Test ==="
echo ""

# Test 1: Backend Health
echo "1. Testing Backend (http://localhost:8080)..."
curl -s -X GET http://localhost:8080/h2-console > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Backend is running on port 8080"
else
    echo "   ❌ Backend is NOT responding on port 8080"
fi

# Test 2: User Registration (SIGNUP)
echo ""
echo "2. Testing User Registration..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "phone": "1234567890",
    "password": "Password123",
    "role": "HOMEOWNER"
  }')

TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo "   ✅ Signup successful"
    echo "   Token: $TOKEN"
    echo "   Saving token to memory..."
else
    echo "   ❌ Signup failed"
    echo "   Response: $SIGNUP_RESPONSE"
fi

# Test 3: User Login
echo ""
echo "3. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123"
  }')

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$LOGIN_TOKEN" ]; then
    echo "   ✅ Login successful"
    echo "   Token: $LOGIN_TOKEN"
else
    echo "   ❌ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
fi

# Test 4: Protected Endpoint (Get Properties)
echo ""
echo "4. Testing Protected Endpoint (Get Properties)..."
if [ -n "$LOGIN_TOKEN" ]; then
    PROPS_RESPONSE=$(curl -s -X GET http://localhost:8080/api/properties \
      -H "Authorization: Bearer $LOGIN_TOKEN" \
      -H "Content-Type: application/json")
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Protected endpoint accessible"
        echo "   Response: $PROPS_RESPONSE"
    else
        echo "   ❌ Protected endpoint failed"
    fi
fi

echo ""
echo "=== Test Complete ==="
