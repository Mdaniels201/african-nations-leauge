# 🚀 Deployment Guide - African Nations League

## Your Deployment Checklist

### ✅ Files Ready:
- [x] .gitignore created (protects your secrets)
- [x] Frontend .env configured
- [x] Backend CORS updated for production
- [x] Vercel.json configuration added
- [x] Build tested successfully

### 📋 What You Need to Do:

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment - all files configured"
git push origin main
```

## Step 2: Deploy Backend (Render.com)

1. **Go to**: https://render.com
2. **Sign up/Login** with GitHub
3. **New Web Service** → Connect Repository
4. **Settings**:
   - Name: `african-nations-league-api`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Root Directory: `backend`

5. **Environment Variables** (⚠️ CRITICAL - Add ALL these in Render dashboard):
   ```
   # Email Configuration (Optional - for match notifications)
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-password
   
   # AI Commentary (Optional - for Gemini AI)
   GEMINI_API_KEY=your-gemini-api-key
   
   # Firebase Database (REQUIRED - get from Firebase Console)
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   
   # Python Version
   PYTHON_VERSION=3.11.0
   ```
   
   **How to get Firebase credentials:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Open the JSON file and copy each value to the environment variables above

6. **Deploy** → Wait 5-10 minutes
7. **Copy your backend URL** (e.g., https://african-nations-league-api.onrender.com)

## Step 3: Deploy Frontend (Vercel.com)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **New Project** → Import Repository
4. **Settings**:
   - Framework: `Create React App` (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)

5. **Environment Variables** (Add in Vercel dashboard):
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
   (Replace with your actual Render URL from Step 2)

6. **Deploy** → Wait 2-5 minutes
7. **Get your live URL** (e.g., https://african-nations-league.vercel.app)

## Step 4: Test Your Live Site

Visit your Vercel URL and test:
- [x] Home page loads
- [x] Team registration works
- [x] Tournament bracket displays
- [x] Admin panel (admin/admin123)
- [x] Live match simulation
- [x] Email notifications

## 🎯 Your Live URLs:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.onrender.com
- **Admin Panel**: https://your-app.vercel.app/admin

## 💰 Cost: $0/month (Completely Free!)

## 🔧 If Something Goes Wrong:

### Backend Issues:
- Check Render logs for errors
- Verify environment variables are set correctly
- Make sure firebase-credentials.json is in backend folder

### Frontend Issues:
- Check Vercel build logs
- Verify REACT_APP_API_URL points to your Render backend
- Test API endpoints directly

### CORS Issues:
- Make sure your Vercel domain is allowed in backend CORS
- Check browser console for CORS errors

## 🎉 Success!
Once deployed, your African Nations League tournament system will be live and accessible worldwide!

Share your tournament with friends and colleagues! 🏆⚽🌍