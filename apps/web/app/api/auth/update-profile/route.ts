import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

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
    const { name, email, username } = await req.json();

    // Validate input
    if (!name || !email || !username) {
      return NextResponse.json(
        { error: 'Name, email, and username are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingEmail = await sql`
      SELECT id FROM users 
      WHERE email = ${email} AND id != ${userId}
    `;

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUsername = await sql`
      SELECT id FROM users 
      WHERE username = ${username} AND id != ${userId}
    `;

    if (existingUsername.length > 0) {
      return NextResponse.json({ error: 'Username already in use' }, { status: 400 });
    }

    // Update user profile
    await sql`
      UPDATE users 
      SET 
        name = ${name},
        email = ${email},
        username = ${username},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Get updated user data
    const users = await sql`
      SELECT id, username, email, name, created_at 
      FROM users 
      WHERE id = ${userId}
    `;

    // Send email notification if email was changed
    const originalUser = await sql`
      SELECT email FROM users WHERE id = ${userId}
    `;

    if (originalUser[0].email !== email) {
      try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const Resend = (await import('resend')).Resend;
          const resend = new Resend(resendApiKey);

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
            to: email,
            subject: 'Email Address Updated',
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
                          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Email Updated</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                              Hi ${name},
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                              Your email address has been successfully updated to <strong>${email}</strong>.
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                              If you didn't make this change, please contact support immediately.
                            </p>
                            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #667eea; border-radius: 4px;">
                              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                                <strong>Security Tip:</strong> Keep your email address up to date to ensure you receive important security notifications.
                              </p>
                            </div>
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
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
