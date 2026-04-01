import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ user: null });
    }

    const sql = neon(process.env.DATABASE_URL);

    const users = await sql`
      SELECT id, email, name, username
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null });
  }
}
