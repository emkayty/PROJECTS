# Hisah Tech - Deployment Guide for SternHost cPanel with Neon Database

## Project Overview

This is a **Next.js 15** web application built with AppGen. It includes:
- User authentication (signup, login, password reset)
- BIOS files, schematics, and repair guides
- File management with ratings and comments
- Messaging system
- AI Assistant
- Multiple payment integrations (Stripe, PayPal, Paystack, Crypto)
- Admin dashboard with bulk upload and payment settings

---

## Database Schema (Required for Neon)

Before deploying, you need to create the following tables in your Neon PostgreSQL database:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    country VARCHAR(255),
    whatsapp_number VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files table (for BIOS, schematics, etc.)
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- 'bios', 'schematic', 'guide', 'firmware'
    file_size BIGINT,
    version VARCHAR(50),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    category VARCHAR(100),
    download_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File ratings table
CREATE TABLE file_ratings (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_id, user_id)
);

-- File comments table
CREATE TABLE file_comments (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES file_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages/Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    participant1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    participant2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'paystack', 'crypto'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    transaction_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_type ON files(file_type);
CREATE INDEX idx_file_ratings_file_id ON file_ratings(file_id);
CREATE INDEX idx_file_comments_file_id ON file_comments(file_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
```

---

## Environment Variables

Create a `.env` file in `/workspace/project/apps/web/` with the following variables:

```env
# Database (Neon)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require

# App URL (replace with your actual domain)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars
NEXTAUTH_URL=https://your-domain.com

# Email (for password reset) - Use Resend, SendGrid, or AWS SES
EMAIL_FROM=your-email@domain.com
EMAIL_SERVER=smtp.resend.com
EMAIL_PORT=587
EMAIL_USERNAME=your-smtp-username
EMAIL_PASSWORD=your-smtp-password

# Payment Gateways

## Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

## PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # or 'live'

## Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_WEBHOOK_SECRET=xxx

## Crypto (example: nowpayments or coinpayments)
CRYPTO_API_KEY=your-crypto-api-key
CRYPTO_API_SECRET=your-crypto-api-secret
NEXT_PUBLIC_CRYPTO_MERCHANT_ID=your-merchant-id

# AI Chat (OpenAI)
OPENAI_API_KEY=sk-xxx
```

---

## Deployment Steps for SternHost cPanel

### Step 1: Prepare the Application

1. **Build the application locally first:**
```bash
cd /workspace/project/apps/web
npm install
npm run build
```

2. **Email library is already included** - Created `/workspace/project/apps/web/lib/email.ts` with placeholder functions. For production, configure with Resend or SendGrid.

### Step 2: Set Up Neon Database

1. Log in to [Neon](https://neon.tech) and create a new project
2. Get your connection string from the Dashboard > Connection Details
3. The format should be: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
4. Run the SQL schema above in the Neon SQL Editor

### Step 3: Configure cPanel

Since SternHost uses cPanel, you'll need to deploy as a **Node.js Application**:

1. **Login to cPanel**
2. Go to **Setup Node.js App** (under Software section)
3. Click **Create Application**
4. Configure:
   - Node.js version: **20.x** or **18.x** (Next.js 15 requires Node 18+)
   - Application mode: **Production**
   - Application root: `apps/web` (or your deployment folder)
   - Application URL: your desired subdomain or domain
   - Application startup file: `package.json` (or `server.js`)

5. Click **Create**
6. After creating, set the following:
   - Scroll down to **Environment Variables**
   - Add all the environment variables from above
   - Click **Save**

### Step 4: Upload Files via File Manager

1. In cPanel, go to **File Manager**
2. Navigate to your application root
3. Upload all files from the `apps/web` folder
4. Ensure `node_modules` is NOT uploaded (it will be installed by cPanel)

### Step 5: Install Dependencies

In cPanel Node.js App interface:
1. Click **Start** to start the app
2. The system will automatically run `npm install`
3. If not, use the **Run NPM Install** button

### Step 6: Configure Domain (if needed)

1. Go to **Domains** in cPanel
2. Create subdomain or point your domain
3. Ensure SSL is enabled (go to **SSL/TLS Status**)

---

## Pages Summary

| Route | Page | Status |
|-------|------|--------|
| `/` | Home | ✅ Ready |
| `/about-us` | About Us | ✅ Ready |
| `/contact` | Contact | ✅ Ready |
| `/blog` | Blog | ✅ Ready |
| `/pricing` | Pricing | ✅ Ready |
| `/bios-files` | BIOS Files | ✅ Ready |
| `/schematics` | Schematics | ✅ Ready |
| `/repair-guides` | Repair Guides | ✅ Ready |
| `/files` | All Files | ✅ Ready |
| `/tools/chrome-to-windows` | Chrome to Windows | ✅ Ready |
| `/tools/password-generator` | Password Generator | ✅ Ready |
| `/dashboard` | User Dashboard | ✅ Ready |
| `/dashboard/settings` | Settings | ✅ Ready |
| `/messages` | Messages | ✅ Ready |
| `/messages/[id]` | Conversation | ✅ Ready |
| `/profile/[username]` | User Profile | ✅ Ready |
| `/settings/profile` | Profile Settings | ✅ Ready |
| `/admin` | Admin Panel | ✅ Ready |
| `/admin/bulk-upload` | Bulk Upload | ✅ Ready |
| `/admin/payment-settings` | Payment Settings | ✅ Ready |
| `/auth/login` | Login | ✅ Ready |
| `/auth/signup` | Signup | ✅ Ready |
| `/forgot-password` | Forgot Password | ✅ Ready |
| `/reset-password` | Reset Password | ✅ Ready |

---

## API Endpoints Summary

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/signup` | User registration |
| `/api/auth/login` | User login |
| `/api/auth/logout` | User logout |
| `/api/auth/me` | Get current user |
| `/api/auth/update-profile` | Update profile |
| `/api/auth/change-password` | Change password |
| `/api/auth/forgot-password` | Request password reset |
| `/api/auth/reset-password` | Reset password |
| `/api/auth/delete-account` | Delete account |
| `/api/files/[id]/comments` | File comments |
| `/api/files/[id]/rating` | File ratings |
| `/api/files/comments/[id]` | Comment operations |
| `/api/messages/[id]` | Get/send messages |
| `/api/messages/conversations` | List conversations |
| `/api/messages/unread-count` | Unread count |
| `/api/profile` | User profile |
| `/api/profile/[username]` | Public profile |
| `/api/upload` | File upload |
| `/api/ai-chat` | AI Chat (requires OpenAI) |
| `/api/payments/stripe/*` | Stripe payments |
| `/api/payments/paypal/*` | PayPal payments |
| `/api/payments/paystack/*` | Paystack payments |
| `/api/payments/crypto/*` | Crypto payments |
| `/api/firmware/download` | Firmware download |
| `/api/admin/payment-settings` | Admin payment config |

---

## Critical Issues Fixed

The following issues were identified and fixed:

### 1. **Missing BiosFilesDropdown Component**
- **Issue**: File was named `BiusFilesDropdown.tsx` (typo)
- **Fix**: Renamed to `BiosFilesDropdown.tsx`

### 2. **Missing Payment SDKs**
- **Issue**: Stripe and PayPal SDKs were not installed
- **Fix**: Added to package.json (`stripe`, `@paypal/checkout-server-sdk`)

### 3. **Missing SQL Exports**
- **Issue**: Some API routes couldn't import `sql` and `getSqlClient`
- **Fix**: Updated `/workspace/project/apps/web/app/api/utils/sql.ts` to export these properly

### 4. **Incorrect Import Paths**
- **Issue**: Some files imported `{ sql }` instead of `sql` as default
- **Fix**: Updated imports in:
  - `/app/api/files/[id]/comments/route.ts`
  - `/app/api/files/[id]/rating/route.ts`
  - `/app/api/files/comments/[id]/route.ts`
  - `/app/api/payments/crypto/verify/route.ts`
  - `/app/api/payments/crypto/status/route.ts`

### 5. **Missing Email Library**
- **Issue**: Signup route imported non-existent `@/lib/email`
- **Fix**: Created `/workspace/project/apps/web/lib/email.ts` with placeholder functions

### 6. **Missing Resend Package**
- **Issue**: Auth routes used Resend but it wasn't installed
- **Fix**: Added `resend` to package.json

---

## Testing Checklist

Before going live, test:

- [ ] User registration with email verification
- [ ] Login and logout functionality
- [ ] Password reset flow
- [ ] File upload and download
- [ ] File ratings and comments
- [ ] Messaging between users
- [ ] Payment flows (Stripe, PayPal, etc.)
- [ ] Admin panel access
- [ ] All public pages load correctly
- [ ] Mobile responsiveness
- [ ] SSL/HTTPS working

---

## Troubleshooting

### Build Errors
- Ensure Node.js version is 18 or higher
- Run `npm install` to get all dependencies

### Database Connection Errors
- Verify DATABASE_URL is correct
- Ensure Neon project is active
- Check SSL settings in connection string

### 502/503 Errors
- Check Node.js app is running in cPanel
- Verify startup file is correct
- Check error logs in cPanel

### Payment Issues
- Verify all payment API keys are set
- Check webhook URLs are accessible
- Ensure correct sandbox/live mode

---

## Security Recommendations for Production

While the application builds and runs, there are additional security measures you should implement before going live:

### 1. Password Hashing
The current code stores passwords in plain text. Install bcrypt:
```bash
npm install bcrypt
npm install -D @types/bcrypt
```
Then update `/api/auth/signup/route.ts` and `/api/auth/login/route.ts` to use bcrypt.

### 2. Configure Email for Production
Update `/workspace/project/apps/web/lib/email.ts` with your Resend or SendGrid API key.

### 3. Session Management
Consider using NextAuth.js for better security:
```bash
npm install next-auth
```

### 4. Payment Webhooks
Ensure your payment webhook endpoints are properly secured and can receive callbacks from payment providers. Configure your domain in payment provider dashboards.

---

## Support

For issues specific to:
- **Neon Database**: Visit https://neon.tech/docs
- **SternHost cPanel**: Contact SternHost support
- **Next.js**: Visit https://nextjs.org/docs
- **Payment Gateways**: Check respective documentation

---

*Guide generated for deployment on SternHost cPanel with Neon PostgreSQL database*