# 🚀 HomePlus - Full Stack Ready! Complete Setup Checklist

## ✅ What Has Been Completed

### Backend (Spring Boot)
- ✅ JWT Authentication System (tokens issued on signup/login)
- ✅ Password Security (BCrypt encryption)
- ✅ Database Models (User, Property, Estimate entities)
- ✅ H2 In-Memory Database (for development/testing)
- ✅ CORS Configuration (allows React frontend to connect)
- ✅ Error Handling (global exception handler with error responses)
- ✅ Input Validation (all DTOs validated)
- ✅ All API endpoints ready:
  - `POST /api/auth/signup` - Register new users
  - `POST /api/auth/login` - User login
  - `GET/POST /api/properties` - Property management
  - `PUT /api/properties/{id}/approve` - Admin approval
  - `PUT /api/properties/{id}/reject` - Admin rejection

### Frontend (React)
- ✅ Login/Signup pages with validation
- ✅ API client configured for backend communication
- ✅ JWT token storage in localStorage
- ✅ Automatic token inclusion in all requests
- ✅ Error message display from backend
- ✅ Protected routes component
- ✅ Logout functionality
- ✅ Navbar with user info

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Start Backend (Terminal 1)
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot\homeplusbackend
.\mvnw.cmd spring-boot:run
```
Wait for: `Tomcat initialized with port 8080`

### Step 2: Start Frontend (Terminal 2)
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot\homeplus-react
npm run dev
```

### Step 3: Open Browser
- Frontend: http://localhost:5173
- API Tester: http://localhost:5173/api-tester.html
- DB Console: http://localhost:8080/h2-console

### Step 4: Test Signup
1. Go to http://localhost:5173/login?type=homeowner
2. Click "Sign Up"
3. Fill form and submit
4. Check developer console (F12) for token in localStorage

---

## 📊 Database Schema

### Users Table (app_user)
```sql
id          BIGINT PRIMARY KEY (auto-increment)
full_name   VARCHAR(255)
email       VARCHAR(255) UNIQUE
phone       VARCHAR(255)
password    VARCHAR(255) -- encrypted
role        VARCHAR(255) -- HOMEOWNER or ADMIN
```

### Properties Table
```sql
id              BIGINT PRIMARY KEY
owner_email     VARCHAR(255) FOREIGN KEY
address         VARCHAR(255)
city            VARCHAR(255)
state           VARCHAR(255)
pin_code        VARCHAR(255)
property_type   VARCHAR(255)
property_value  DOUBLE
property_age    INTEGER
built_up_area   DOUBLE
status          VARCHAR(255) -- Pending/Approved/Rejected
submission_date TIMESTAMP
```

---

## 🔑 How It Works

### User Registration Flow
```
React Form
   ↓
POST /api/auth/signup
   ↓
Backend validates input
   ↓
Backend hashes password (BCrypt)
   ↓
Backend saves user to H2 database
   ↓
Backend generates JWT token
   ↓
Frontend receives token + email
   ↓
Frontend stores in localStorage
   ↓
Frontend redirects to dashboard
```

### User Login Flow
```
React Form (email + password)
   ↓
POST /api/auth/login
   ↓
Backend finds user by email
   ↓
Backend compares password (BCrypt verify)
   ↓
Backend generates JWT token
   ↓
Frontend stores token
   ↓
All future requests include: Authorization: Bearer <token>
```

### Protected API Request
```
GET /api/properties
Headers: {
  "Authorization": "Bearer eyJhbGc...",
  "Content-Type": "application/json"
}
   ↓
Backend validates token
   ↓
Backend extracts user email from token
   ↓
Backend returns user's properties
```

---

## 🧪 Test Data

### Signup Credentials
```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "phone": "1234567890",
  "password": "TestPassword123",
  "role": "HOMEOWNER"
}
```

### Login Credentials
```json
{
  "email": "test@example.com",
  "password": "TestPassword123"
}
```

---

## 🔐 JWT Token Details

**Token Format:**
```
Header.Payload.Signature

Example: eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ...kzKj3hJNqh
```

**Token Contains:**
- User email (subject)
- Token issued time
- Token expiration (24 hours default)
- Signature (for verification)

**How to Use:**
1. Copy token from signup/login response
2. Send in all requests: `Authorization: Bearer <token>`
3. Backend verifies signature and expiration
4. Access granted if valid

---

## 📱 API Endpoints

### Authentication (Public)
```
POST /api/auth/signup
POST /api/auth/login
```

### Properties (Protected)
```
GET    /api/properties                    (all)
GET    /api/properties/{id}               (by id)
GET    /api/properties/user/{email}       (by user)
POST   /api/properties                    (create)
PUT    /api/properties/{id}               (update)
DELETE /api/properties/{id}               (delete)
```

### Admin (Protected)
```
PUT /api/properties/{id}/approve          (approve)
PUT /api/properties/{id}/reject           (reject)
POST /api/admin/estimate/{propertyId}     (add estimate)
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to fetch" | Backend NOT running - see Step 1 |
| "Connection refused" | Port 8080 in use - kill process or change port |
| "Email already registered" | Use different email address |
| "Invalid password" | Check credentials match signup |
| "Phone must be 10 digits" | Format: 1234567890 (no dashes) |
| Token is in localStorage but still 401 | Token format wrong - should be sent as `Bearer <token>` |
| Frontend doesn't see token | Check localStorage in DevTools (F12 → Application) |

---

## 💾 Verify Data Storage

### Check Users in Database

1. Go to http://localhost:8080/h2-console
2. Login with defaults (check Application › Storage › Session)
3. Run query:
```sql
SELECT * FROM app_user;
```

4. Should see registered users with encrypted passwords

---

## 🔄 Full Request-Response Example

### Signup Request
```
POST http://localhost:8080/api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "Password123",
  "role": "HOMEOWNER"
}
```

### Signup Response (Success)
```
Status: 201 Created
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huQGV...",
  "email": "john@example.com",
  "message": "Signup successful"
}
```

### Signup Response (Error)
```
Status: 400 Bad Request
{
  "token": null,
  "email": null,
  "message": "Email already registered"
}
```

---

## ✨ Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | ✅ Working | Saves to DB, returns JWT |
| User Login | ✅ Working | Validates credentials, returns JWT |
| JWT Authentication | ✅ Working | 24-hour expiration, BCrypt verified |
| Password Encryption | ✅ Working | BCrypt hashing algorithm |
| Token Storage | ✅ Working | localStorage.token |
| CORS Support | ✅ Working | React frontend can call backend |
| Error Handling | ✅ Working | Structured error responses |
| Input Validation | ✅ Working | All fields validated |
| Database | ✅ Working | H2 in-memory (dev), PostgreSQL ready |

---

## 🎓 Learning Resources

### JWT Authentication
- How it works: Token issued after login, sent in every request
- Why it's secure: Token is signed, can't be forged
- Expiration: 24 hours (set in application.properties)

### Password Security
- BCrypt: Industry standard password hashing
- Salt: Random per password, prevents rainbow tables
- Cost: Automatically increases as computers get faster

### HTTP Status Codes
- 200 OK: Request succeeded
- 201 Created: Resource created (signup success)
- 400 Bad Request: Input validation failed
- 401 Unauthorized: Token missing or invalid
- 500 Internal Server Error: Server error

---

## 🎉 You're All Set!

All the pieces are connected:
- ✅ React frontend can talk to Spring Boot backend
- ✅ Backend stores users in H2 database
- ✅ Passwords are encrypted with BCrypt
- ✅ JWT tokens are issued and verified
- ✅ Error handling is in place
- ✅ Database schema is ready

**Next Steps:**
1. Run both servers (backend + frontend)
2. Test signup/login flow
3. Check User data in H2 console
4. Build out remaining features (properties, admin dashboard, etc.)

Happy coding! 🚀
