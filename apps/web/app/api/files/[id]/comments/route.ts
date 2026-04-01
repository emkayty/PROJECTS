import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import sql from '../../../utils/sql';

// GET /api/files/[id]/comments - Get all comments for a file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = neon(process.env.DATABASE_URL!);
    const { id } = await params;
    
    const comments = await db(sql`
      SELECT 
        fc.id,
        fc.comment,
        fc.created_at,
        u.username,
        u.full_name
      FROM file_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.file_id = ${parseInt(id)}
      ORDER BY fc.created_at DESC
    `);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/files/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = neon(process.env.DATABASE_URL!);
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
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
    const { comment } = await request.json();

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
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

    // Insert comment
    const newComment = await db(sql`
      INSERT INTO file_comments (file_id, user_id, comment)
      VALUES (${parseInt(id)}, ${userId}, ${comment.trim()})
      RETURNING id, comment, created_at
    `);

    // Get user info
    const users = await db(sql`
      SELECT username, full_name FROM users WHERE id = ${userId}
    `);

    return NextResponse.json({
      success: true,
      comment: {
        ...newComment[0],
        username: users[0].username,
        full_name: users[0].full_name
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
