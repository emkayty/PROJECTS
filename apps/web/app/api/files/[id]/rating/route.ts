import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import sql from '../../../utils/sql';

const db = neon(process.env.DATABASE_URL!);

// GET /api/files/[id]/rating - Get average rating
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await db(sql`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_ratings
      FROM file_ratings
      WHERE file_id = ${parseInt(id)}
    `);

    // Check if user has rated (if logged in)
    let userRating = null;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      const sessions = await db(sql`
        SELECT user_id FROM sessions WHERE token = ${sessionToken}
      `);

      if (sessions.length > 0) {
        const userId = sessions[0].user_id;
        const userRatings = await db(sql`
          SELECT rating FROM file_ratings 
          WHERE file_id = ${parseInt(id)} AND user_id = ${userId}
        `);
        
        if (userRatings.length > 0) {
          userRating = userRatings[0].rating;
        }
      }
    }

    return NextResponse.json({
      averageRating: parseFloat(result[0].average_rating) || 0,
      totalRatings: parseInt(result[0].total_ratings) || 0,
      userRating
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}

// POST /api/files/[id]/rating - Rate a file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to rate' },
        { status: 401 }
      );
    }

    // Verify session
    const sessions = await db(sql`
      SELECT user_id FROM sessions WHERE token = ${sessionToken}
    `);

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = sessions[0].user_id;
    const { id } = await params;
    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if file exists
    const files = await db(sql`
      SELECT id FROM files WHERE id = ${parseInt(id)}
    `);

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Insert or update rating (using ON CONFLICT)
    await db(sql`
      INSERT INTO file_ratings (file_id, user_id, rating)
      VALUES (${parseInt(id)}, ${userId}, ${rating})
      ON CONFLICT (file_id, user_id)
      DO UPDATE SET rating = ${rating}, created_at = NOW()
    `);

    // Get updated average
    const result = await db(sql`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_ratings
      FROM file_ratings
      WHERE file_id = ${parseInt(id)}
    `);

    return NextResponse.json({
      success: true,
      averageRating: parseFloat(result[0].average_rating),
      totalRatings: parseInt(result[0].total_ratings),
      userRating: rating
    });
  } catch (error) {
    console.error('Error rating file:', error);
    return NextResponse.json(
      { error: 'Failed to rate file' },
      { status: 500 }
    );
  }
}
