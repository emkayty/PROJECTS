import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

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

    // Get Stripe settings from database
    const settings = await sql`
      SELECT enabled, config FROM payment_settings WHERE provider = 'stripe'
    `;

    if (settings.length === 0 || !settings[0].enabled) {
      return NextResponse.json({ error: 'Stripe payment is not enabled' }, { status: 400 });
    }

    const config = settings[0].config;
    const secretKey = config.secretKey;

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' });

    const users = await sql`SELECT id, email FROM users WHERE id = ${parseInt(token)}`;
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan} Plan`,
              description: `30-day subscription to ${plan} plan`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      client_reference_id: token,
      metadata: {
        userId: token,
        plan,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
