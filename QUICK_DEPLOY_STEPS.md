# ⚡ Quick Deployment Steps

## What I Just Fixed:
✅ Frontend now uses environment variables for API URL  
✅ Auto-switches between `localhost:5000` (dev) and your Render URL (production)  
✅ All components updated to use centralized config

## Your Next Steps (5 Minutes):

### 1️⃣ Deploy Backend to Render (First!)

1. Go to https://render.com and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your `african-nations-leauge` repository
4. Configure:
   - **Name**: `african-nations-league-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   
   **REQUIRED - Firebase (from your Firebase Console):**
   ```
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=africannationsleague
   FIREBASE_PRIVATE_KEY_ID=(from your firebase json)
   FIREBASE_PRIVATE_KEY=(from your firebase json - keep the \n characters!)
   FIREBASE_CLIENT_EMAIL=(from your firebase json)
   FIREBASE_CLIENT_ID=(from your firebase json)
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   ```
   
   **OPTIONAL:**
   ```
   GEMINI_API_KEY=(if you want AI commentary)
   EMAIL_USER=(your gmail for notifications)
   EMAIL_PASSWORD=(your gmail app password)
   ```

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. **📋 COPY YOUR URL!** (e.g., `https://african-nations-league-api.onrender.com`)

---

### 2️⃣ Update Vercel Frontend (Second!)

1. Go to your Vercel dashboard: https://vercel.com
2. Find your deployed project
3. Go to **Settings** → **Environment Variables**
4. Add a NEW variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-render-url.onrender.com/api`
   - **Check all environments** (Production, Preview, Development)
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Redeploy"** on the latest deployment

---

### 3️⃣ Test Everything!

Visit your Vercel URL and check:
- ✅ Home page loads (no "Failed to fetch teams" error)
- ✅ Register a team
- ✅ Start tournament (if you have 8 teams)
- ✅ Admin panel login works
- ✅ Live match simulation

---

## 🔥 Important Notes:

**Why it wasn't working before:**
- Your frontend on Vercel was trying to connect to `http://localhost:5000`
- Localhost doesn't exist in production - it's the user's computer!
- Now it automatically uses your Render backend URL

**The Firebase issue:**
- Your backend needs Firebase credentials to store teams/matches
- Add them as environment variables in Render (not in code!)
- Never commit `firebase-credentials.json` to GitHub

---

## 📞 Need Help?

If you get errors:
1. **"Failed to fetch teams"** → Check REACT_APP_API_URL in Vercel
2. **"Database not available"** → Check Firebase env vars in Render
3. **CORS errors** → Your backend CORS is already configured for Vercel

**Check Logs:**
- Render: Click on your service → "Logs" tab
- Vercel: Project → "Deployments" → Click deployment → "Build Logs" / "Function Logs"
