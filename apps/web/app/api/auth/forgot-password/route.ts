import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `;

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return NextResponse.json({
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }

    const user = users[0];

    // Generate reset token (simple implementation - use crypto.randomBytes in production)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await sql`
      UPDATE users
      SET reset_token = ${resetToken}, reset_token_expires = ${resetExpires.toISOString()}
      WHERE id = ${user.id}
    `;

    // TODO: Send email with reset link
    // For now, log the reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Password reset link:', resetUrl);

    return NextResponse.json({
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
