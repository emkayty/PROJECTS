import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Dynamic import to prevent build-time execution
let paypal: any;

async function getPayPalSDK() {
  if (!paypal) {
    paypal = await import('@paypal/checkout-server-sdk');
  }
  return paypal;
}

async function getPayPalClient() {
  const sql = neon(process.env.DATABASE_URL!);
  const settings = await sql`
    SELECT config FROM payment_settings WHERE provider = 'paypal' AND enabled = true
  `;

  if (settings.length === 0) {
    throw new Error('PayPal not configured');
  }

  const config = settings[0].config;
  const sdk = await getPayPalSDK();
  const environment = config.mode === 'live' 
    ? new sdk.core.LiveEnvironment(config.clientId, config.clientSecret)
    : new sdk.core.SandboxEnvironment(config.clientId, config.clientSecret);

  return new sdk.core.PayPalHttpClient(environment);
}

export async function POST(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, amount } = await req.json();

    if (!plan || !amount) {
      return NextResponse.json({ error: 'Missing plan or amount' }, { status: 400 });
    }

    const client = await getPayPalClient();
    const sdk = await getPayPalSDK();

    const request = new sdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
          description: `${plan} Plan - 30 days subscription`,
        },
      ],
      application_context: {
        brand_name: 'Your App Name',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      },
    });

    const order = await client.execute(request);

    // Store order in database with user info
    await sql`
      INSERT INTO crypto_payments (user_id, plan, amount, currency, status, transaction_hash)
      VALUES (${parseInt(token)}, ${plan}, ${amount}, 'USD', 'pending', ${order.result.id})
    `;

    return NextResponse.json({ 
      orderId: order.result.id,
      links: order.result.links 
    });
  } catch (error: any) {
    console.error('PayPal create order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
