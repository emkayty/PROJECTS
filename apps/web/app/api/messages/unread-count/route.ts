import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/messages/unread-count - Get total unread message count
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT COUNT(*) as count
      FROM messages m
      INNER JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE cp.user_id = ${parseInt(userId)}
      AND m.sender_id != ${parseInt(userId)}
      AND m.created_at > cp.last_read_at
    `;

    return NextResponse.json({ count: parseInt(result[0].count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
  }
}
