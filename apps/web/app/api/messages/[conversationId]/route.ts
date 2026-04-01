import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/messages/[conversationId] - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verify user is participant
    const participant = await sql`
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = ${parseInt(conversationId)}
      AND user_id = ${parseInt(userId)}
    `;

    if (participant.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messages = await sql`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.sender_id,
        u.username as sender_username,
        u.full_name as sender_full_name,
        u.profile_image as sender_profile_image
      FROM messages m
      INNER JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ${parseInt(conversationId)}
      ORDER BY m.created_at ASC
    `;

    // Update last_read_at
    await sql`
      UPDATE conversation_participants
      SET last_read_at = NOW()
      WHERE conversation_id = ${parseInt(conversationId)}
      AND user_id = ${parseInt(userId)}
    `;

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages/[conversationId] - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Verify user is participant
    const participant = await sql`
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = ${parseInt(conversationId)}
      AND user_id = ${parseInt(userId)}
    `;

    if (participant.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create message
    const [message] = await sql`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (${parseInt(conversationId)}, ${parseInt(userId)}, ${content})
      RETURNING id, content, created_at, sender_id
    `;

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
