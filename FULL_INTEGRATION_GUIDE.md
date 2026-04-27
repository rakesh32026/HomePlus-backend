# HomePlus - Full Integration Guide (Complete Setup)

## 🎯 What's Ready

✅ **Backend (Spring Boot)** - Port 8080
- JWT Authentication working
- Password encryption (BCrypt) enabled
- H2 Database configured (in-memory testing)
- CORS enabled for React frontend
- User storage in database working
- Error handling implemented

✅ **Frontend (React)** - Port 5173
- Login/Signup pages working
- API client configured
- Token storage in localStorage
- JWT token sent in all requests
- Error messages display from backend

---

## 🚀 Step 1: Start Backend Server

Open **PowerShell** and run:
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot\homeplusbackend
.\mvnw.cmd spring-boot:run
```

**Wait for startup messages:**
```
Spring Boot :: (v4.0.5)
...
Tomcat initialized with port 8080 (http)
...
o.s.b.a.AbstractWebServerApplicationContext : Root WebApplicationContext: initialization completed
```

Backend is ready when you see: ✅ **"Application started successfully"**

---

## 🎨 Step 2: Start Frontend Server

Open **another PowerShell** and run:
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot\homeplus-react
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## 📝 Step 3: Test The Full Flow

### **3.1 Sign Up as Homeowner**

1. Go to `http://localhost:5173/login?type=homeowner`
2. Click "Sign Up" tab
3. Fill in:
   - **Full Name:** John Doe
   - **Email:** john@example.com
   - **Phone:** 1234567890 (10 digits)
   - **Password:** Password123
4. Click "Sign Up"

**What happens:**
```
Frontend → POST /api/auth/signup
Backend → Validates data
       → Hashes password with BCrypt
       → Saves user to H2 database
       → Generates JWT token
Frontend ← Returns token
Frontend → Stores token in localStorage
Frontend → Redirects to Homeowner Dashboard
```

### **3.2 Login with Your Account**

1. Go to `http://localhost:5173/login?type=homeowner`
2. Click "Login" tab
3. Enter:
   - **Email:** john@example.com
   - **Password:** Password123
4. Click "Login"

**What happens:**
```
Frontend → POST /api/auth/login
Backend → Finds user by email
       → Verifies password with BCrypt
       → Returns JWT token
Frontend ← Token received
Frontend → Stores in localStorage.token
Frontend → All future requests include token
Frontend → Redirects to dashboard
```

---

## 🔐 Database - What Gets Stored

### **Users Table (app_user)**
```
CREATE TABLE app_user (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name   VARCHAR(255),
  email       VARCHAR(255) UNIQUE,
  phone       VARCHAR(255),
  password    VARCHAR(255) -- encrypted with BCrypt
  role        VARCHAR(255) -- HOMEOWNER or ADMIN
)
```

**Example stored data:**
```
ID | Full Name | Email           | Phone      | Password (hashed)              | Role
1  | John Doe  | john@examp.com  | 1234567890 | $2a$10$kzKj3hJNqh...        | HOMEOWNER
```

---

## 🌐 API Endpoints - Complete Reference

### **Authentication**
```
POST /api/auth/signup
Request:  { fullName, email, phone, password, role }
Response: { token, email, message }

POST /api/auth/login
Request:  { email, password }
Response: { token, email, message }
```

### **Properties (Protected - requires token)**
```
POST /api/properties
Headers: Authorization: Bearer <token>
Body:    { address, city, state, zipCode, ... }
Response: Property object saved to database

GET /api/properties
Headers: Authorization: Bearer <token>
Response: Array of all properties

GET /api/properties/user/{email}
Headers: Authorization: Bearer <token>
Response: Properties for that user
```

### **Admin Endpoints**
```
PUT /api/properties/{id}/approve
Headers: Authorization: Bearer <admin-token>
Response: Updated property with status "Approved"

PUT /api/properties/{id}/reject
Headers: Authorization: Bearer <admin-token>
Response: Updated property with status "Rejected"
```

---

## 🔑 Token & SecurityFlow

### **How JWT Authentication Works:**

1. **User Signup/Login:**
   ```
   Email + Password → Backend → Generates JWT token
   ```

2. **Token Format:**
   ```
   Header: eyJhbGciOiJIUzUxMiJ9...
   Payload: eyJzdWIiOiJqb2huQGV4...
   Signature: kzKj3hJNqh...
   
   Token expires in 24 hours
   ```

3. **Each Request:**
   ```
   Frontend sends headers:
   Authorization: Bearer <jwt-token>
   Content-Type: application/json
   ```

4. **Backend Validates:**
   ```
   Checks token signature ✓
   Checks expiration ✓
   Extracts user email ✓
   Processes request ✓
   ```

---

## 💾 Data Storage Verification

### **Check H2 Console**

1. Go to: `http://localhost:8080/h2-console`
2. Click "Connect" (use default settings)
3. Run SQL query:
   ```sql
   SELECT * FROM app_user;
   ```

You'll see all registered users!

---

## 🚨 Troubleshooting

### **Error: "Failed to fetch"**
- ❌ Backend NOT running on port 8080
- ✅ Start backend first (see Step 1)

### **Error: "Email already registered"**
- ❌ User with that email exists
- ✅ Use a different email address

### **Error: "Invalid email or password"**
- ❌ Credentials are wrong
- ✅ Check email/password match signup

### **Error: "Password must be at least 6 characters"**
- ❌ Password too short
- ✅ Use 6+ characters

### **Error: "Phone must be 10 digits"**
- ❌ Phone number is wrong
- ✅ Format: 1234567890 (no dashes/spaces)

### **Token expires after 24 hours**
- ❌ JWT token is too old
- ✅ Login again to get new token

---

## 📊 Testing Checklist

- [ ] Backend starts on http://localhost:8080
- [ ] Frontend starts on http://localhost:5173
- [ ] Can signup with new user
- [ ] Token appears in browser localStorage
- [ ] Can login with same credentials
- [ ] Logged-in user can see dashboard
- [ ] H2 console shows registered users
- [ ] Can create/view properties (when implemented)
- [ ] Logout clears token from localStorage
- [ ] Cannot access protected pages without token

---

## 🔄 Request-Response Flow Diagram

```
┌─────────────────┐
│   React App     │
│  (Port 5173)    │
└────────┬────────┘
         │
         │ fetch('/api/auth/signup')
         |  + JWT headers
         ↓
┌─────────────────────────────────┐
│  Spring Boot Backend             │
│  (Port 8080)                    │
│  - Validates input              │
│  - Hashes password (BCrypt)     │
│  - Saves to H2 Database         │
│  - Generates JWT token          │
│  - Returns response             │
└────────┬────────────────────────┘
         │
         │ { token, email, message }
         ↓
┌─────────────────┐
│  Browser Local  │
│  Storage        │
│  token saved ✓  │
└────────┬────────┘
         │
         │ All future requests
         │ include: Authorization: Bearer token
         ↓
    ✅ Authenticated
```

---

## 🎓 How Data Flows

### **Signup Example:**

```json
Frontend sends:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "Password123",
  "role": "HOMEOWNER"
}
        ↓↓↓
Backend processes:
- Validates all fields ✓
- Checks email not duplicate ✓
- Hashes password: $2a$10$kzKj3hJNqh... ✓
- Creates User object ✓
- Saves to database ✓
- Generates token ✓
        ↓↓↓
Frontend receives:
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "john@example.com",
  "message": "Signup successful"
}
        ↓↓↓
Frontend stores:
localStorage.token = "eyJhbGciOiJIUzUxMiJ9..."
localStorage.userEmail = "john@example.com"
```

---

## 🌟 Next Steps

1. ✅ Complete the signup/login flow (done!)
2. ⏳ Build property management features
3. ⏳ Build admin dashboard
4. ⏳ Add property listing/search
5. ⏳ Connect to production database (PostgreSQL)

---

**You're all set! Begin with Step 1: Start Backend → Then Step 2: Start Frontend → Then test in browser! 🚀**
