# 🚀 CRITICAL DEPLOYMENT GUIDE - SternHost cPanel + Neon DB

## ✅ VERIFIED WORKING SETUP

**Local Test:** Confirmed working on MacBook Air 2015
**Build Status:** Successfully builds locally
**Database:** Neon project ready with tables

---

## ROOT CAUSE ANALYSIS

### Problem 1: Server Memory Limits
- SternHost has 4GB RAM limit
- Next.js 15 build requires more memory
- **Solution:** Build locally, upload built files

### Problem 2: package.json Start Script
- Default uses hardcoded port 3000
- cPanel uses $PORT environment variable
- **Solution:** Change to `next start -p $PORT`

### Problem 3: Application Startup File
- cPanel auto-creates `app.js` which breaks Next.js
- **Solution:** Leave startup file BLANK

### Problem 4: Missing node_modules
- Uploaded files missing dependencies
- **Solution:** Run npm install OR upload node_modules

---

## COMPLETE STEP-BY-STEP SOLUTION

### PHASE 1: PREPARE ON YOUR MAC

#### Step 1.1: Fix package.json
Edit `apps/web/package.json` - change start script:
```json
"start": "next start -p $PORT"
```

#### Step 1.2: Build the App
```bash
cd "/Users/ace/Downloads/PROJECT-main 2/apps/web"
echo 'DATABASE_URL="postgresql://user:pass@host.local/db?sslmode=disable"' > .env.local
npm run build
```

✅ Expected output: "✓ Compiled successfully"

#### Step 1.3: Create Deployment Package
```bash
cd "/Users/ace/Downloads/PROJECT-main 2/apps/web"
zip -r sternhost-deploy.zip . -x "node_modules/*" ".git/*" ".env.local" ".DS_Store"
```

---

### PHASE 2: UPLOAD TO CPANEL

#### Step 2.1: Clean the Directory
1. Go to cPanel → File Manager → `public_html/apps/web/`
2. DELETE ALL existing files and folders

#### Step 2.2: Upload and Extract
1. Upload `sternhost-deploy.zip` to `public_html/apps/web/`
2. Right-click → Extract

#### Step 2.3: Install Dependencies
1. Go to cPanel → Setup Node.js App
2. If no app exists, CREATE NEW:
   - Node.js version: **20.x**
   - Application root: `public_html/apps/web`
   - Application mode: **Production**
   - Application startup file: **(leave BLANK)**
3. Click **Run NPM Install**
4. Wait 2-3 minutes for completion

---

### PHASE 3: CONFIGURE

#### Step 3.1: Set Environment Variables
In Node.js App settings, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_VCsDcF68kmRx@ep-blue-shape-alvnfjvg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `PORT` | `3000` |

#### Step 3.2: Fix Startup File Issue
1. Go to Node.js App settings
2. Find "Application startup file" field
3. Delete any value (make it BLANK)
4. Save/Update the app
5. If it auto-fills `app.js` again, repeat until it stays blank

---

### PHASE 4: START AND TEST

#### Step 4.1: Restart
1. Click **Restart** in Node.js App
2. Wait 30 seconds

#### Step 4.2: Test URLs
Try these in order:
1. `http://hisahtech.com:3000/` (with port)
2. `http://hisahtech.com:3000` (without trailing slash)

#### Step 4.3: If Main Domain Still Shows Apache Default
The main domain needs to be routed to Node.js:

Option A: In Node.js App, set Application URL to your domain
Option B: Create `.htaccess` in `public_html/`:
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

---

## ENVIRONMENT VARIABLES REFERENCE

### Required
```
DATABASE_URL=postgresql://neondb_owner:npg_VCsDcF68kmRx@ep-blue-shape-alvnfjvg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
```

### Optional (if you have accounts)
```
NEXT_PUBLIC_APP_URL=https://hisahtech.com
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=https://hisahtech.com

# Payment APIs (optional)
STRIPE_SECRET_KEY=sk_test_xxx
PAYPAL_CLIENT_ID=xxx
PAYSTACK_SECRET_KEY=xxx

# Email (optional)
EMAIL_FROM=your-email@domain.com

# AI Chat (optional)
OPENAI_API_KEY=sk-xxx
```

---

## TROUBLESHOOTING

### "Connection refused" on port 3000
→ App not starting. Check Node.js App logs in cPanel

### "Module not found" errors
→ Run "Run NPM Install" again in cPanel

### Main domain shows "It works!"
→ Domain not routed to Node.js. Create .htaccess or set Application URL

### App runs but database errors
→ DATABASE_URL incorrect. Verify in Neon dashboard

---

## ALTERNATIVE: TRY STATIC EXPORT

If Node.js continues failing, convert to static:

1. In `next.config.ts`, add:
```ts
output: 'export',
```

2. Rebuild locally
3. Upload to public_html/
4. No Node.js needed - just static files!

---

## VERIFIED WORKING CONFIGURATION

```
Local Mac: ✅ Works (npm start)
Build: ✅ Works (npm run build)  
GitHub: ✅ Updated (emkayty/PROJECTS)
Neon DB: ✅ Tables created
cPanel: ⚠️ Memory issue (build fails on server)
Solution: Build locally, upload built files
```

---

## QUICK COMMAND REFERENCE

### Mac Terminal Commands
```bash
# Build
cd "/Users/ace/Downloads/PROJECT-main 2/apps/web"
npm run build

# Create zip
zip -r sternhost-deploy.zip . -x "node_modules/*" ".git/*"

# Test locally
PORT=3000 npm start
```

### cPanel Commands
```bash
# Enter virtual environment
source /home/mguyizme/nodevenv/public_html/apps/web/20/bin/activate && cd /home/mguyizme/public_html/apps/web

# Start manually
npm start

# Check logs
tail -f /home/mguyizme/logs/your-domain.error.log
```

---

**Last Updated:** April 3, 2026
**Status:** Local build verified, awaiting server deployment
