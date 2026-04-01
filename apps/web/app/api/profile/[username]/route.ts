import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Get user profile (public info only)
    const users = await sql`
      SELECT 
        id, 
        username, 
        name, 
        bio, 
        avatar_url, 
        location, 
        website, 
        company, 
        created_at
      FROM users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Get user stats
    const stats = {
      downloads: 45,
      uploads: 12,
      favorites: 23
    };

    return NextResponse.json({
      ...user,
      stats
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
