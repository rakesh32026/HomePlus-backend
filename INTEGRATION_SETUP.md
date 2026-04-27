# HomePlus - Full Stack Integration Guide

## ✅ What's Been Set Up

### Backend (Spring Boot)
- ✅ JWT Authentication (Token-based)
- ✅ Password Hashing with BCrypt
- ✅ Global Error Handling (@ControllerAdvice)
- ✅ Input Validation (DTOs with @Valid)
- ✅ CORS Enabled for React frontend
- ✅ MySQL Database configured
- ✅ Property management endpoints
- ✅ Admin endpoints

### Frontend (React)
- ✅ API client with JWT support (`src/api.js`)
- ✅ Login/Signup pages connected to backend
- ✅ Automatic token storage in localStorage
- ✅ Logout functionality
- ✅ Protected routes component
- ✅ Bearer token in Authorization header for all requests
- ✅ Error handling and user feedback

---

## 🚀 Getting Started

### 1. Start the Backend
```bash
cd homeplusbackend
mvn clean install
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

### 2. Start the Frontend
```bash
cd homeplus-react
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
```

**Request (Login):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "user@example.com",
  "message": "Login successful"
}
```

### Properties
```
GET    /api/properties              (Get all properties)
GET    /api/properties/{id}         (Get by ID)
GET    /api/properties/user/{email} (Get user's properties)
POST   /api/properties              (Create property - requires auth)
PUT    /api/properties/{id}         (Update property - requires auth)
DELETE /api/properties/{id}         (Delete property - requires auth)
```

### Admin
```
PUT    /api/properties/{id}/approve  (Approve property)
PUT    /api/properties/{id}/reject   (Reject property)
POST   /api/admin/estimate           (Add estimate)
```

---

## 🔐 Authentication Flow

1. **User signs up/logs in** on React frontend
2. **Backend validates credentials** and returns JWT token
3. **React stores token** in `localStorage.token`
4. **All future requests** include token in header:
   ```
   Authorization: Bearer <token>
   ```
5. **Backend validates token** and processes request
6. **User logs out** → token removed from localStorage

---

## 📱 Frontend Integration

### Using the API
```javascript
import { api } from './api';

// Login
const response = await api.login({
  email: 'user@example.com',
  password: 'password123'
});
localStorage.setItem('token', response.token);

// Create Property (requires auth)
const property = await api.createProperty({
  address: '123 Main St',
  city: 'New York',
  // ... other fields
});

// Logout
api.logout(); // Clears token and user data
```

### Protecting Routes
```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/admin-dashboard" 
  element={<ProtectedRoute element={<AdminDashboard />} />} 
/>
```

---

## 🛡️ Error Handling

### Backend Error Responses
```json
{
  "status": 400,
  "message": "Email already registered",
  "timestamp": 1712610432123,
  "path": "/api/auth/signup"
}
```

### Frontend Error Handling
```javascript
try {
  const response = await api.login(data);
  // Success
} catch (error) {
  console.error(error.message); // Server error message
  setError(error.message);
}
```

---

## 🔑 Token Storage & Security

### Stored in localStorage:
```
token        → JWT token
userEmail    → User's email
user         → User object (optional)
```

### Token Expiration:
- Configured in backend: `jwt.expiration=86400000` (24 hours)
- After expiration, user must log in again

---

## ✨ Features Implemented

### Backend
- ✅ BCrypt password hashing
- ✅ JWT token generation & validation
- ✅ Input validation with error messages
- ✅ Global exception handling
- ✅ Role-based access (ADMIN, HOMEOWNER)
- ✅ Property submission workflows
- ✅ Admin estimation module

### Frontend
- ✅ Login/Signup form validation
- ✅ Password strength checking
- ✅ Automatic error messages
- ✅ Loader/spinner during API calls
- ✅ Redirect based on user role
- ✅ Remember me functionality
- ✅ Logout option in navbar

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Change port in application.properties
server.port=8081
```

### CORS errors
- Make sure backend has CORS enabled in `CorsConfig.java`
- Frontend URL should be in allowed origins

### JWT token not working
- Check token is in localStorage: `localStorage.getItem('token')`
- Verify token hasn't expired (24 hours)
- Check Authorization header format: `Bearer <token>`

### Database connection fails
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/homeplus
spring.datasource.username=root
spring.datasource.password=123456
```
Make sure MySQL is running!

---

## 📝 Next Steps (Optional)

1. **Refresh Token** - Implement refresh token rotation
2. **Role-Based Access Control** - Add @PreAuthorize on endpoints
3. **Email Verification** - Send confirmation email on signup
4. **Two-Factor Authentication** - Add OTP security
5. **Rate Limiting** - Prevent brute force attacks
6. **Logging** - Add SLF4J logging throughout
7. **Testing** - Write unit & integration tests
8. **Production Deployment** - Use environment variables for secrets

---

## 📞 API Testing

### Using Postman

**1. Signup:**
```
POST http://localhost:8080/api/auth/signup
Headers: Content-Type: application/json
Body:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "HOMEOWNER"
}
```

**2. Login:**
```
POST http://localhost:8080/api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "john@example.com",
  "password": "password123"
}
```

**3. Get Properties (with token):**
```
GET http://localhost:8080/api/properties
Headers: 
  Authorization: Bearer <paste_token_here>
  Content-Type: application/json
```

---

**You're all set! 🎉 Both frontend and backend are connected and ready to go!**
