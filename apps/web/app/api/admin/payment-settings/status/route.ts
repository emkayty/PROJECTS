import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Fetch enabled payment methods (public endpoint for frontend)
export async function GET(req: NextRequest) {
  try {
    const settings = await sql`
      SELECT provider, enabled 
      FROM payment_settings 
      WHERE enabled = true
    `;

    const enabledProviders = settings.map(s => s.provider);

    return NextResponse.json({ enabledProviders });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({ error: 'Failed to fetch payment status' }, { status: 500 });
  }
}
