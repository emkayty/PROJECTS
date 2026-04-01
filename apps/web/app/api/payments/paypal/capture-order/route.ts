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

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const client = await getPayPalClient();
    const sdk = await getPayPalSDK();
    const request = new sdk.orders.OrdersCaptureRequest(orderId);
    const capture = await client.execute(request);

    if (capture.result.status === 'COMPLETED') {
      // Get payment details
      const payment = await sql`
        SELECT plan FROM crypto_payments 
        WHERE transaction_hash = ${orderId} AND user_id = ${parseInt(token)}
      `;

      if (payment.length > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Activate subscription
        await sql`
          UPDATE users 
          SET subscription_plan = ${payment[0].plan}, 
              subscription_expires_at = ${expiresAt.toISOString()}
          WHERE id = ${parseInt(token)}
        `;

        // Update payment status
        await sql`
          UPDATE crypto_payments 
          SET status = 'confirmed' 
          WHERE transaction_hash = ${orderId}
        `;
      }
    }

    return NextResponse.json({ 
      success: true, 
      status: capture.result.status 
    });
  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
