import { NextRequest, NextResponse } from 'next/server';
import sql from '../../utils/sql';

export async function POST(request: NextRequest) {
  try {
    // Check if DATABASE_URL is configured properly
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Database not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    const { email, password, name, country, whatsapp_number, username } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!country) {
      return NextResponse.json(
        { error: 'Please select your country' },
        { status: 400 }
      );
    }

    if (!whatsapp_number) {
      return NextResponse.json(
        { error: 'WhatsApp number is required for communication' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`SELECT id, email FROM users WHERE email = ${email}`;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check username if provided
    if (username) {
      const existingUsername = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existingUsername.length > 0) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Create user
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, name, username, country, whatsapp_number, created_at)
      VALUES (${email}, ${password}, ${name || null}, ${username || null}, ${country}, ${whatsapp_number}, NOW())
      RETURNING id, email, name, username, country, whatsapp_number, created_at
    `;

    if (!newUsers || newUsers.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    const user = newUsers[0];

    // Create session token
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${user.id}, ${sessionToken}, ${expiresAt.toISOString()})`;

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        country: user.country,
        whatsapp_number: user.whatsapp_number,
      },
    });

    // Set session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.message?.includes('relation "users" does not exist')) {
      return NextResponse.json(
        { error: 'Database tables not set up. Please contact administrator.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
