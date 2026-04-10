# Hisah Tech - Complete Deployment Guide for SternHost cPanel

## ⚠️ IMPORTANT: This is a STATIC deployment

This package deploys your forum as **static HTML pages**. This means:
- ✅ All pages will display correctly
- ✅ Navigation will work
- ✅ Design/layout renders perfectly
- ❌ No database functionality (login, signup, comments)
- ❌ No dynamic features (payments, uploads, messages)
- ❌ No API endpoints

---

## Step 1: Download from GitHub

1. Go to: https://github.com/emkayty/PROJECTS
2. Click **Code** → **Download ZIP**
3. Unzip the file

---

## Step 2: Upload to cPanel

### Option A: Upload Entire Package (Recommended)

1. Go to **cPanel → File Manager**
2. Navigate to `public_html/`
3. **Delete** everything inside (or create a backup first)
4. Click **Upload**
5. Upload the ZIP file you downloaded
6. Right-click the ZIP → **Extract**

### Option B: Upload via FTP

1. Use FileZilla or any FTP client
2. Connect to your SternHost server
3. Navigate to `public_html/`
4. Upload all files and folders

---

## Expected File Structure

After uploading, your `public_html/` should have:

```
public_html/
├── index.html              ← Homepage
├── about-us.html
├── admin/
│   ├── bulk-upload.html
│   └── payment-settings.html
├── admin.html
├── bios-files.html
├── blog.html
├── chrome-to-windows/
│   └── chrome-to-windows.html
├── contact.html
├── dashboard/
│   └── settings.html
├── dashboard.html
├── files.html
├── forgot-password.html
├── messages.html
├── password-generator/
│   └── password-generator.html
├── pricing.html
├── profile.html
├── repair-guides.html
├── reset-password.html
├── schematics.html
├── settings/
│   └── profile.html
├── _next/
│   ├── 9sci7j6rscRHg7z7ePwiF/
│   ├── chunks/
│   │   ├── 1255-9494d7e861e97d68.js
│   │   ├── 4bd1b696-f785427dddbba9fb.js
│   │   └── ... (many JS files)
│   └── css/
│       └── faad649900862fde.css
```

---

## Step 3: Verify

Visit these URLs:

- `http://hisahtech.com/` - Should show homepage
- `http://hisahtech.com/about-us.html` - About page
- `http://hisahtech.com/bios-files.html` - BIOS Files page
- `http://hisahtech.com/contact.html` - Contact page

---

## Troubleshooting

### Problem: Page is blank or shows error

**Solution**: The _next folder wasn't uploaded correctly. Make sure the `_next/static/` folder is uploaded with all JavaScript files.

### Problem: Images don't load

**Solution**: Some images reference external URLs (CDN). This requires internet access to load.

### Problem: 404 errors on pages

**Solution**: Make sure ALL HTML files are uploaded, including subfolder files (admin/, dashboard/, etc.)

---

## For FULL Functionality (Database + API)

Options:

1. **Deploy to Vercel** (Free) - https://vercel.com
   - Supports Next.js + Neon natively
   - Easy deployment
   - Free tier available

2. **Upgrade SternHost** - Contact them to increase Node.js memory

3. **Use a different host** - Render, Railway, Fly.io

---

## File List

### Root HTML Files (17):
- _not-found.html
- about-us.html
- admin.html
- bios-files.html
- blog.html
- chrome-to-windows.html
- contact.html
- dashboard.html
- files.html
- forgot-password.html
- index.html
- messages.html
- password-generator.html
- pricing.html
- repair-guides.html
- reset-password.html
- schematics.html

### Admin Folder:
- bulk-upload.html
- payment-settings.html

### Dashboard Folder:
- settings.html

### Settings Folder:
- profile.html

### Tools Folder:
- chrome-to-windows.html
- password-generator.html

---

## Support

For issues with this static deployment, please review the troubleshooting section above.

For the full app with database support, consider deploying to Vercel or another platform that supports Node.js.

---

*Last updated: April 2026*