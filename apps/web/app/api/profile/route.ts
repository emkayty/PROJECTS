import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name, bio, avatar_url, location, website, company } = await request.json();

    // Update user profile
    const users = await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        bio = ${bio},
        avatar_url = ${avatar_url},
        location = ${location},
        website = ${website},
        company = ${company}
      WHERE id = ${userId}
      RETURNING 
        id, 
        username, 
        email, 
        name, 
        bio, 
        avatar_url, 
        location, 
        website, 
        company, 
        created_at
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
