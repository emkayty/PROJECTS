import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Get Stripe settings from database
    const settings = await sql`
      SELECT config FROM payment_settings WHERE provider = 'stripe' AND enabled = true
    `;

    if (settings.length === 0) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const config = settings[0].config;
    const secretKey = config.secretKey;
    const webhookSecret = config.webhookSecret;

    if (!secretKey || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' });

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

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
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
