import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

export async function DELETE(req: NextRequest) {
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

    // Get user info for email notification
    const users = await sql`
      SELECT email, name FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete sessions
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`;

    // 2. Delete password reset tokens
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`;

    // 3. Delete uploads (if table exists)
    try {
      await sql`DELETE FROM uploads WHERE user_id = ${userId}`;
    } catch (e) {
      // Table might not exist yet
    }

    // 4. Delete user
    await sql`DELETE FROM users WHERE id = ${userId}`;

    // Send farewell email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const Resend = (await import('resend')).Resend;
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
          to: users[0].email,
          subject: 'Account Deleted',
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
                        <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Account Deleted</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                            Hi ${users[0].name},
                          </p>
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                            Your account has been permanently deleted as requested. All your data has been removed from our systems.
                          </p>
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                            We're sorry to see you go! If you change your mind, you're always welcome to create a new account.
                          </p>
                          <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #6b7280; border-radius: 4px;">
                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                              Thank you for being part of our community. We hope to see you again in the future!
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                            Best wishes,<br>
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
      console.error('Failed to send farewell email:', emailError);
    }

    // Clear session cookie
    const response = NextResponse.json({
      message: 'Account deleted successfully'
    });

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
