/**
 * Email Library
 * 
 * This file provides email functionality for the application.
 * For production, integrate with an email service like:
 * - Resend (https://resend.com) - Recommended
 * - SendGrid (https://sendgrid.com)
 * - nodemailer with SMTP
 * 
 * Example using Resend:
 * 
 * import { Resend } from 'resend';
 * const resend = new Resend('re_123456789');
 * 
 * export async function sendWelcomeEmail(email: string, name?: string) {
 *   await resend.emails.send({
 *     from: 'Your App <noreply@yourdomain.com>',
 *     to: email,
 *     subject: 'Welcome to Hisah Tech',
 *     html: `<h1>Welcome ${name || 'there'}!</h1><p>Thank you for joining Hisah Tech...</p>`
 *   });
 * }
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Log the email for development
  console.log('=== WELCOME EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Name: ${name || 'User'}`);
  console.log(`Subject: Welcome to Hisah Tech!`);
  console.log(`Body: Thank you for joining Hisah Tech...`);
  console.log('=====================');
  
  // In production, uncomment and configure:
  /*
  if (isProduction && process.env.EMAIL_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.EMAIL_API_KEY);
    await resend.emails.send({
      from: 'Hisah Tech <noreply@yourdomain.com>',
      to: email,
      subject: 'Welcome to Hisah Tech!',
      html: `
        <h1>Welcome ${name || 'there'}!</h1>
        <p>Thank you for joining Hisah Tech - your go-to resource for BIOS files, schematics, and repair guides.</p>
        <p>Get started by exploring our collection of files and connecting with our community.</p>
        <a href="${appUrl}/bios-files" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Browse Files
        </a>
      `
    });
  }
  */
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
  
  // Log the email for development
  console.log('=== PASSWORD RESET EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Password Reset Request`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('=============================');
  
  // In production, uncomment and configure:
  /*
  if (isProduction && process.env.EMAIL_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.EMAIL_API_KEY);
    await resend.emails.send({
      from: 'Hisah Tech <noreply@yourdomain.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
  }
  */
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string, 
  amount: number, 
  currency: string,
  paymentMethod: string
): Promise<void> {
  // Log the email for development
  console.log('=== PAYMENT CONFIRMATION EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Amount: ${amount} ${currency}`);
  console.log(`Method: ${paymentMethod}`);
  console.log('===================================');
  
  // In production, implement with your email provider
}