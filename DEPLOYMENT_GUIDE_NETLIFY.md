# Hisah Tech - Complete Deployment Guide for Netlify

## 🚀 Why Netlify?

| Feature | Status |
|---------|--------|
| Free hosting | ✅ |
| Next.js 15 support | ✅ |
| Neon database | ✅ |
| API functions | ✅ |
| Automatic deploys | ✅ |
| Custom domain | ✅ |
| SSL certificate | ✅ |
| Global CDN | ✅ |

---

## 📋 PREREQUISITES

1. **GitHub account** - You already have this
2. **Netlify account** - Sign up at https://app.netlify.com
3. **Neon database** - Get connection string from https://console.neon.tech

---

## 🎯 QUICK DEPLOY (5 MINUTES)

### Step 1: Get Neon Connection String

1. Go to **Neon.tech** → Your project
2. Click **Dashboard** → **Connection Details**
3. Copy the connection string (format: `postgresql://user:pass@host.db.neon.tech/db?sslmode=require`)
4. Replace `<password>` with your actual password

### Step 2: Connect GitHub to Netlify

1. Go to **app.netlify.com**
2. Click **Add new site** → **Import an existing project**
3. Click **GitHub** → Authorize Netlify
4. Select repository: `emkayty/PROJECTS`
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/web/.next/server/app`
   - **Node version**: `18`

### Step 3: Add Environment Variables

In Netlify dashboard → **Site settings** → **Environment variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `NODE_VERSION` | `18` |

### Step 4: Deploy

1. Click **Deploy site**
2. Wait 2-3 minutes for first deploy
3. Your site will be live at `https://{random-id}.netlify.app`

### Step 5: Add Custom Domain

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Enter `hisahtech.com`
4. Update DNS at your registrar (SternHost)

---

## 🔧 MANUAL DEPLOY (Alternative)

### Step 1: Download Code

```bash
git clone https://github.com/emkayty/PROJECTS.git
cd PROJECTS/apps/web
```

### Step 2: Install & Build

```bash
npm install
DATABASE_URL="your_neon_connection_string" npm run build
```

### Step 3: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=.next/server/app
```

---

## 🔍 VERIFICATION

Test these URLs after deployment:
- `https://your-site.netlify.app/` - Homepage
- `https://your-site.netlify.app/about-us` - About page
- `https://your-site.netlify.app/bios-files` - BIOS Files

---

## ⚠️ TROUBLESHOOTING

### Build fails with out of memory
**Solution**: In Netlify, add environment variable `NODE_OPTIONS=--max-old-space-size=4096`

### API routes not working
**Solution**: Make sure `DATABASE_URL` is set in Netlify environment variables

### 404 errors on pages
**Solution**: The netlify.toml handles redirects automatically. Check that it's in the repo.

### Database connection errors
**Solution**: 
1. Verify DATABASE_URL is correct
2. Check Neon project is active
3. Ensure SSL is enabled: `?sslmode=require`

---

## 📁 PROJECT STRUCTURE

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (will work on Netlify)
│   ├── page.tsx           # Homepage
│   ├── about-us/
│   ├── bios-files/
│   └── ... (other pages)
├── components/            # React components
├── lib/                  # Utilities (DB, auth)
├── public/                # Static assets
├── _next/                # Build output (after npm run build)
│   ├── static/           # JS/CSS assets
│   └── server/
│       └── app/          # Static HTML pages
├── server.js             # Express server
├── netlify.toml          # Netlify config
├── package.json
└── next.config.ts
```

---

## 🎓 NETLIFY FEATURES USED

| Feature | How it works |
|---------|-------------|
| **Next.js 15** | Native support via netlify.toml |
| **API Routes** | Netlify Functions (serverless) |
| **Environment Variables** | Netlify dashboard |
| **Redirects** | netlify.toml [[redirects]] |
| **Edge Functions** | Optional - for performance |
| **Forms** | Optional - for contact forms |

---

## ✅ FINAL CHECKLIST

- [ ] Neon project created
- [ ] DATABASE_URL copied
- [ ] GitHub repo connected to Netlify
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Custom domain (optional)
- [ ] Site verified working

---

## 📞 SUPPORT

- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
- **Netlify Community**: https://community.netlify.com

---

*Last updated: April 2026*