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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const users = await sql`
      SELECT id, email, password_hash, name, username
      FROM users
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password (in production, use bcrypt.compare)
    if (user.password_hash !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });

    response.cookies.set('userId', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
