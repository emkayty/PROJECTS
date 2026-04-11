# Hisah Tech - Vercel Deployment (READY)

## ✅ YOUR DATABASE URL:
```
postgresql://neondb_owner:npg_VCsDcF68kmRx@ep-blue-shape-alvnfjvg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 🚀 DEPLOY STEPS:

### 1. Go to Vercel
https://vercel.com

### 2. Import Project
- Click **"Add New..."** → **"Project"**
- Search: `emkayty/PROJECTS`
- Click **Import**

### 3. Configure These Settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Build Command** | `DATABASE_URL=placeholder npm run build` |
| **Output Directory** | `.next` |

### 4. Add Environment Variable:

Click **"Add"** → Add these:

```
DATABASE_URL = postgresql://neondb_owner:npg_VCsDcF68kmRx@ep-blue-shape-alvnfjvg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 5. Deploy

Click **Deploy** 🎉

---

## 🔧 IF BUILD FAILS:

Add another variable:
```
NODE_OPTIONS = --max-old-space-size=4096
```

---

## 🌐 AFTER DEPLOY:

- Visit: `https://your-project.vercel.app`
- Test: `https://your-project.vercel.app/`
- Test: `https://your-project.vercel.app/about-us`

---

## ⚠️ IMPORTANT:

Replace `npg_VCsDcF68kmRx` with your actual password if different!

- Get correct password from: https://console.neon.tech → Dashboard → Connection Details

---

Go deploy! 🚀