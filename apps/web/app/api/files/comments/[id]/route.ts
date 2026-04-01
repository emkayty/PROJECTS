import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import sql from '../../../utils/sql';

const db = neon(process.env.DATABASE_URL!);

// DELETE /api/files/comments/[id] - Delete own comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Check if comment exists and belongs to user
    const comments = await db(sql`
      SELECT user_id FROM file_comments WHERE id = ${parseInt(id)}
    `);

    if (comments.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comments[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Delete comment
    await db(sql`
      DELETE FROM file_comments WHERE id = ${parseInt(id)}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
