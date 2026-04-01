import { NextRequest, NextResponse } from 'next/server';
import { getSqlClient } from '../../../utils/sql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, transactionHash } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const db = getSqlClient();

    // Fetch the payment order
    const orders = await db`
      SELECT * FROM crypto_payments
      WHERE order_id = ${orderId}
    `;

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Check if order has expired
    if (new Date(order.expires_at) < new Date()) {
      await db`
        UPDATE crypto_payments
        SET status = 'expired'
        WHERE order_id = ${orderId}
      `;
      return NextResponse.json(
        { error: 'Payment order has expired' },
        { status: 400 }
      );
    }

    // In production, verify transaction on blockchain
    // For now, simulate verification
    const isVerified = transactionHash && transactionHash.length > 10;

    if (isVerified) {
      // Update payment status
      await db`
        UPDATE crypto_payments
        SET 
          status = 'completed',
          transaction_hash = ${transactionHash || null},
          completed_at = NOW()
        WHERE order_id = ${orderId}
      `;

      // Update user subscription
      const expiryDate = order.plan === 'yearly' 
        ? 'NOW() + INTERVAL \'1 year\''
        : 'NOW() + INTERVAL \'1 month\'';

      await db`
        UPDATE users
        SET 
          subscription_plan = ${order.plan},
          subscription_expires_at = ${sql.unsafe(expiryDate)}
        WHERE id = ${order.user_id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Payment verified and subscription activated'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Payment not yet confirmed on blockchain'
    });

  } catch (error) {
    console.error('Verify crypto payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
