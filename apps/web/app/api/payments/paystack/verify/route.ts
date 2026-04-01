import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Get Paystack settings from database
    const settings = await sql`
      SELECT config FROM payment_settings WHERE provider = 'paystack' AND enabled = true
    `;

    if (settings.length === 0) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
    }

    const config = settings[0].config;
    const secretKey = config.secretKey;

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      const userId = data.data.metadata.userId;
      const plan = data.data.metadata.plan;

      if (userId && plan) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await sql`
          UPDATE users 
          SET subscription_plan = ${plan}, 
              subscription_expires_at = ${expiresAt.toISOString()}
          WHERE id = ${parseInt(userId)}
        `;
      }

      return NextResponse.json({ success: true, status: 'success' });
    }

    return NextResponse.json({ success: false, status: data.data.status });
  } catch (error: any) {
    console.error('Paystack verify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
