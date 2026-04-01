import { NextRequest, NextResponse } from 'next/server';
import { getSqlClient } from '../../../utils/sql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const db = getSqlClient();

    const orders = await db`
      SELECT 
        order_id,
        plan,
        amount,
        currency,
        crypto_address,
        status,
        transaction_hash,
        created_at,
        expires_at,
        completed_at
      FROM crypto_payments
      WHERE order_id = ${orderId}
    `;

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Check if expired
    if (order.status === 'pending' && new Date(order.expires_at) < new Date()) {
      await db`
        UPDATE crypto_payments
        SET status = 'expired'
        WHERE order_id = ${orderId}
      `;
      order.status = 'expired';
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.order_id,
        plan: order.plan,
        amount: order.amount,
        currency: order.currency,
        address: order.crypto_address,
        status: order.status,
        transactionHash: order.transaction_hash,
        createdAt: order.created_at,
        expiresAt: order.expires_at,
        completedAt: order.completed_at
      }
    });

  } catch (error) {
    console.error('Get crypto payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
