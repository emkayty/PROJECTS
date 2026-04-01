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
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const users = await sql`
      SELECT id, email, reset_token_expires
      FROM users
      WHERE reset_token = ${token}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check if token has expired
    if (new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Update password and clear reset token
    const passwordHash = password; // TODO: Use bcrypt in production

    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, reset_token = NULL, reset_token_expires = NULL
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
