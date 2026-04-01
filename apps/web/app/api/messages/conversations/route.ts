import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/messages/conversations - Get all conversations for current user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await sql`
      SELECT 
        c.id,
        c.created_at,
        u.id as other_user_id,
        u.username as other_username,
        u.full_name as other_user_full_name,
        u.profile_image as other_user_profile_image,
        m.content as last_message,
        m.created_at as last_message_at,
        m.sender_id as last_message_sender_id,
        (SELECT COUNT(*) 
         FROM messages 
         WHERE conversation_id = c.id 
         AND sender_id != ${parseInt(userId)}
         AND created_at > cp.last_read_at
        ) as unread_count
      FROM conversations c
      INNER JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = ${parseInt(userId)}
      INNER JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id != ${parseInt(userId)}
      INNER JOIN users u ON u.id = cp2.user_id
      LEFT JOIN LATERAL (
        SELECT content, created_at, sender_id
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      ORDER BY COALESCE(m.created_at, c.created_at) DESC
    `;

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/messages/conversations - Create or get existing conversation
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otherUserId } = await request.json();
    if (!otherUserId) {
      return NextResponse.json({ error: 'otherUserId is required' }, { status: 400 });
    }

    // Check if conversation already exists
    const existing = await sql`
      SELECT c.id
      FROM conversations c
      WHERE EXISTS (
        SELECT 1 FROM conversation_participants WHERE conversation_id = c.id AND user_id = ${parseInt(userId)}
      )
      AND EXISTS (
        SELECT 1 FROM conversation_participants WHERE conversation_id = c.id AND user_id = ${otherUserId}
      )
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ conversationId: existing[0].id });
    }

    // Create new conversation
    const [conversation] = await sql`
      INSERT INTO conversations DEFAULT VALUES
      RETURNING id
    `;

    // Add participants
    await sql`
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES 
        (${conversation.id}, ${parseInt(userId)}),
        (${conversation.id}, ${otherUserId})
    `;

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
