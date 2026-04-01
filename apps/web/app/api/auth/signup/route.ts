import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendWelcomeEmail } from '@/lib/email';

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
    const { email, password, name, country, whatsapp_number } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!country) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      );
    }

    if (!whatsapp_number) {
      return NextResponse.json(
        { error: 'WhatsApp number is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user (in production, hash the password with bcrypt)
    const passwordHash = password; // TODO: Use bcrypt in production
    
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, name, country, whatsapp_number, created_at)
      VALUES (${email}, ${passwordHash}, ${name || null}, ${country}, ${whatsapp_number}, ${new Date().toISOString()})
      RETURNING id, email, name, country, whatsapp_number, created_at
    `;

    const user = newUsers[0];

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Create session token
    const sessionToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `;

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        whatsapp_number: user.whatsapp_number,
      },
    });

    // Set cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
