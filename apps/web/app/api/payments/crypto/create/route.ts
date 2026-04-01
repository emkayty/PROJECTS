import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, amount, currency } = await req.json();

    if (!plan || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get crypto settings from database
    const settings = await sql`
      SELECT enabled, config FROM payment_settings WHERE provider = 'crypto'
    `;

    if (settings.length === 0 || !settings[0].enabled) {
      return NextResponse.json({ error: 'Crypto payment is not enabled' }, { status: 400 });
    }

    const config = settings[0].config;
    
    // Map currency to address
    const addressMap: { [key: string]: string } = {
      BTC: config.btcAddress,
      ETH: config.ethAddress,
      USDT: config.usdtAddress,
      LTC: config.ltcAddress,
      DOGE: config.dogeAddress,
    };

    const address = addressMap[currency];

    if (!address) {
      return NextResponse.json({ error: 'Currency not supported or not configured' }, { status: 400 });
    }

    // Create payment record
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const result = await sql`
      INSERT INTO crypto_payments (user_id, plan, amount, currency, payment_address, expires_at, status)
      VALUES (${parseInt(token)}, ${plan}, ${amount}, ${currency}, ${address}, ${expiresAt.toISOString()}, 'pending')
      RETURNING id, payment_address, expires_at
    `;

    return NextResponse.json({
      paymentId: result[0].id,
      address: result[0].payment_address,
      amount,
      currency,
      expiresAt: result[0].expires_at,
    });
  } catch (error: any) {
    console.error('Crypto payment creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
