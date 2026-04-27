# 🚀 Deploy Backend to Railway with MySQL

## 📋 Prerequisites
- Railway account (free at https://railway.app)
- GitHub account
- Git installed on your machine

---

## ✅ Step 1: Initialize Git & Push to GitHub

### 1.1 Initialize Git in your project
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot
git init
git add .
git commit -m "Initial commit: HomePlus full stack application"
```

### 1.2 Create a GitHub repository
1. Go to https://github.com/new
2. Name it: `homeplus-app`
3. Choose **Private** (recommended)
4. Click "Create repository"

### 1.3 Push your code to GitHub
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot
git remote add origin https://github.com/YOUR_USERNAME/homeplus-app.git
git branch -M main
git push -u origin main
```

---

## 🎯 Step 2: Deploy Backend to Railway

### 2.1 Sign in to Railway
1. Go to https://railway.app
2. Click "Login" → Choose "Continue with GitHub"
3. Grant permissions

### 2.2 Create a New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `homeplus-app` repository
4. Click "Deploy"

### 2.3 Configure Service
- **Name:** homeplusbackend
- **Service:** Java (auto-detected)
- Click "Deploy"

**Wait 2-3 minutes for deployment to complete.**

---

## 🗄️ Step 3: Add MySQL Database

### 3.1 Add MySQL to Your Railway Project
1. In Railway dashboard, click "New Service"
2. Select "Add from marketplace"
3. Search for "MySQL"
4. Click "MySQL"
5. Click "Add"

**Railway will automatically create MySQL instance and generate credentials.**

### 3.2 Get Database Connection Details
1. Click on the MySQL service in Railway
2. Go to "Variables" tab
3. You'll see:
   - `MYSQL_URL` (full connection string)
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DB_NAME`

**Copy these - you'll need them next.**

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Set Backend Environment Variables in Railway
1. Click on your **homeplusbackend** service in Railway
2. Go to "Variables" tab
3. Add these variables:

| Variable | Value |
|----------|-------|
| `MYSQL_URL` | Copy from MySQL service |
| `MYSQL_USER` | Copy from MySQL service |
| `MYSQL_PASSWORD` | Copy from MySQL service |
| `MYSQL_DB_NAME` | Copy from MySQL service |
| `JWT_SECRET` | `your_super_secret_key_at_least_32_characters_long_change_this` |
| `PORT` | `8080` |

---

## 📝 Step 5: Update application.properties for Production

Update your backend `application.properties` file with environment variables:

**File:** `homeplusbackend/src/main/resources/application.properties`

```properties
spring.application.name=homeplusbackend

# MySQL Database Configuration (Uses Railway Environment Variables)
spring.datasource.url=${MYSQL_URL}
spring.datasource.username=${MYSQL_USER}
spring.datasource.password=${MYSQL_PASSWORD}
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

server.port=${PORT:8080}

# JWT Configuration (Uses Environment Variable)
jwt.secret=${JWT_SECRET:your_secret_key_change_this_in_production_at_least_32_chars}
jwt.expiration=86400000

# CORS Configuration
server.servlet.context-path=/api
```

---

## 🔄 Step 6: Redeploy Backend

### 6.1 Commit and Push Changes
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot
git add .
git commit -m "Configure environment variables for production deployment"
git push origin main
```

### 6.2 Railway Auto-Redeploy
Railway automatically redeploys when you push to GitHub. Check the deployment status:
1. Go to Railway dashboard
2. Click your **homeplusbackend** service
3. Watch the deployment logs
4. Wait for ✅ "Deployment successful"

---

## 🔗 Step 7: Update Frontend API URL

### 7.1 Get Your Backend URL from Railway
1. Click **homeplusbackend** service in Railway
2. Go to "Settings" tab
3. Under "Domains", copy your public URL (looks like: `https://homeplusbackend-production.up.railway.app`)

### 7.2 Update React API Configuration
**File:** `homeplus-react/src/api.js`

Replace the API base URL:
```javascript
// OLD - Local backend
// const API_BASE_URL = 'http://localhost:8080/api';

// NEW - Railway backend
const API_BASE_URL = 'https://your-railway-url.up.railway.app/api';
```

### 7.3 Redeploy Frontend on Vercel
```powershell
cd c:\Users\nunna\OneDrive\Desktop\dot\homeplus-react
git add .
git commit -m "Update backend API URL to Railway deployment"
git push origin main
```

**Vercel automatically redeploys on push. Check your Vercel dashboard for deployment status.**

---

## ✅ Step 8: Test the Connection

### 8.1 Test Backend Health
Open in browser:
```
https://your-railway-url.up.railway.app/api/auth/login
```
You should see a CORS error (expected - it means backend is running):
```json
{"error":"Access denied from origin"}
```

### 8.2 Test Full Flow
1. Go to your Vercel frontend URL
2. Try to **Sign Up**
3. Check if user is created
4. Try to **Login**
5. Check if token is received

### 8.3 Check Railway Logs
If something fails:
1. Click **homeplusbackend** service in Railway
2. Go to "Logs" tab
3. Look for errors

---

## 🐛 Troubleshooting

### Backend won't deploy
- Check logs in Railway "Logs" tab
- Ensure `pom.xml` has all dependencies
- Check Java version matches (17)

### MySQL connection fails
- Verify `MYSQL_URL` format in Railway Variables
- Check database credentials are correct
- Ensure MySQL service is running in Railway

### CORS errors
- Update `JWT_SECRET` to match in Railway
- Check frontend has correct backend URL
- Verify `CorsConfig.java` allows your Vercel domain

### Database tables not created
- Ensure `spring.jpa.hibernate.ddl-auto=update` is set
- Check MySQL connection in logs
- Tables should auto-create on first request

---

## 📊 Summary

✅ Git repo initialized & pushed to GitHub
✅ Backend deployed to Railway
✅ MySQL database connected
✅ Environment variables configured
✅ Frontend updated with new backend URL
✅ Frontend redeployed on Vercel
✅ Full stack application live!

**Your application is now live and production-ready!**
