import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, amount } = await req.json();

    if (!plan || !amount) {
      return NextResponse.json({ error: 'Missing plan or amount' }, { status: 400 });
    }

    // Get Paystack settings from database
    const settings = await sql`
      SELECT enabled, config FROM payment_settings WHERE provider = 'paystack'
    `;

    if (settings.length === 0 || !settings[0].enabled) {
      return NextResponse.json({ error: 'Paystack payment is not enabled' }, { status: 400 });
    }

    const config = settings[0].config;
    const secretKey = config.secretKey;

    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
    }

    const users = await sql`SELECT id, email FROM users WHERE id = ${parseInt(token)}`;
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: users[0].email,
        amount: amount * 100, // Convert to kobo/cents
        currency: 'USD',
        metadata: {
          userId: token,
          plan,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?success=true`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ 
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url 
    });
  } catch (error: any) {
    console.error('Paystack initialize error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
