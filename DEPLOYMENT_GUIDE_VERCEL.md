# Hisah Tech - Vercel Deployment Guide

## ✅ Your GitHub IS Ready for Vercel!

This file contains everything needed to deploy to Vercel.

---

## 🚀 QUICK DEPLOY STEPS

### Step 1: Go to Vercel

Visit: https://vercel.com

### Step 2: Sign Up / Login

- Click **"Sign up"**
- Choose **"Continue with GitHub"**
- Authorize Vercel to access your GitHub

### Step 3: Import This Project

1. Click **"Add New..."** button
2. Select **"Project"**
3. Search for: `emkayty/PROJECTS`
4. Click **"Import"**

### Step 4: Configure

Set these values:

| Setting | Value |
|---------|-------|
| **FRAMEWORK PRESET** | Leave as "Other" or "Next.js" |
| **ROOT DIRECTORY** | `apps/web` |
| **BUILD COMMAND** | `npm run build` |
| **OUTPUT DIRECTORY** | `.next` |

### Step 5: Add Environment Variables

Click **"Add"** and add:

| Variable | Value |
|---------|-------|
| `DATABASE_URL` | Your Neon connection string |

**To get DATABASE_URL:**
1. Go to https://console.neon.tech
2. Select your project
3. Go to **Dashboard → Connection Details**
4. Copy the connection string
5. Replace `<password>` with your actual password

### Step 6: Deploy

Click **"Deploy"** button

Wait 2-3 minutes for first deployment!

---

## 🌐 After Deployment

- Your site: `https://your-project.vercel.app`
- Dashboard: https://vercel.com/dashboard

### Add Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add `hisahtech.com`
3. Update DNS at your domain registrar

---

## 🔧 Files Included

| File | Purpose |
|------|--------|
| `vercel.json` | Vercel configuration |
| `package.json` | Dependencies & scripts |
| `next.config.ts` | Next.js settings |
| `server.js` | Express server (optional) |
| `.next/` | Build output |

---

## ⚠️ Troubleshooting

### Build Fails
**Solution:** Add environment variable `NODE_OPTIONS=--max-old-space-size=4096`

### API Not Working
**Solution:** Make sure DATABASE_URL is set in Vercel env variables

### 404 on Pages
**Solution:** The `.next` folder contains static pages. Routes should work automatically.

### Database Connection Error
**Solution:** 
1. Verify DATABASE_URL is correct
2. Ensure Neon project is active
3. Check SSL: add `?sslmode=require` to connection string

---

## 📊 What Works on Vercel

| Feature | Status |
|---------|--------|
| Homepage | ✅ |
| All Pages | ✅ |
| Navigation | ✅ |
| Neon Database | ✅ |
| User Login | ✅ |
| API Routes | ✅ |
| Payments | ✅ |
| Profile | ✅ |
| Messages | ✅ |
| File Uploads | ✅ |

---

Deploy and enjoy your Hisah Tech forum! 🎉

*Last updated: April 2026*