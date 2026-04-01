import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Middleware to check if user is admin
async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const users = await sql`
    SELECT id, is_admin FROM users WHERE id = ${parseInt(token)}
  `;

  if (users.length === 0 || !users[0].is_admin) {
    return { error: 'Forbidden - Admin access required', status: 403 };
  }

  return { userId: users[0].id };
}

// GET - Fetch all payment settings
export async function GET(req: NextRequest) {
  const authCheck = await checkAdmin(req);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const settings = await sql`
      SELECT provider, enabled, config, updated_at 
      FROM payment_settings 
      ORDER BY provider
    `;

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update payment settings
export async function PUT(req: NextRequest) {
  const authCheck = await checkAdmin(req);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { provider, enabled, config } = await req.json();

    if (!provider || typeof enabled !== 'boolean' || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate provider
    const validProviders = ['stripe', 'paypal', 'paystack', 'crypto'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    await sql`
      UPDATE payment_settings 
      SET enabled = ${enabled}, 
          config = ${JSON.stringify(config)}::jsonb,
          updated_at = NOW(),
          updated_by = ${authCheck.userId}
      WHERE provider = ${provider}
    `;

    return NextResponse.json({ 
      success: true, 
      message: `${provider} settings updated successfully` 
    });
  } catch (error: any) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
