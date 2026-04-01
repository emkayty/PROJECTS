import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify session
    const sessions = await sql`
      SELECT user_id FROM sessions 
      WHERE token = ${sessionToken} 
      AND expires_at > NOW()
    `;

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessions[0].user_id;
    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify current password
    const currentPasswordHash = await hashPassword(currentPassword);
    const users = await sql`
      SELECT id, email, name FROM users 
      WHERE id = ${userId} 
      AND password_hash = ${currentPasswordHash}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword);
    await sql`
      UPDATE users 
      SET 
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Send email notification
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const Resend = (await import('resend')).Resend;
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
          to: users[0].email,
          subject: 'Password Changed Successfully',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Password Changed</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                            Hi ${users[0].name},
                          </p>
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                            Your password has been successfully changed. You can now use your new password to log in to your account.
                          </p>
                          <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #92400e;">
                              <strong>⚠️ Security Alert:</strong> If you didn't make this change, please contact support immediately. Your account may be compromised.
                            </p>
                          </div>
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                            For security reasons, all active sessions on other devices have been maintained. If you want to log out of all devices, please do so from your account settings.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                            Best regards,<br>
                            The Team
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return NextResponse.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
