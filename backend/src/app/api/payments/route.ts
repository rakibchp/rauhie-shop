import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const paymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentMethod: z.enum(['BKASH', 'NAGAD', 'CARD', 'STRIPE', 'COD']),
  transactionId: z.string().optional(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = paymentSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError('Invalid payment details', 400, parseResult.error.format());
    }

    const { orderId, paymentMethod, transactionId, amount } = parseResult.data;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    // Process payment status according to gateway
    let newPaymentStatus: 'PAID' | 'UNPAID' = 'UNPAID';
    let newOrderStatus = order.status;

    if (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD' || paymentMethod === 'CARD' || paymentMethod === 'STRIPE') {
      newPaymentStatus = 'PAID';
      newOrderStatus = 'PROCESSING';
    } else {
      newPaymentStatus = 'UNPAID';
      newOrderStatus = 'PENDING';
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newPaymentStatus,
        status: newOrderStatus,
        notes: transactionId ? `Transaction ID: ${transactionId} | Gateway: ${paymentMethod}` : order.notes,
      },
      include: { items: true },
    });

    return apiSuccess({
      orderId: updatedOrder.orderNumber,
      paymentMethod,
      paymentStatus: newPaymentStatus,
      transactionId: transactionId || `TXN-${Date.now()}`,
      amount,
      message: newPaymentStatus === 'PAID' ? 'Payment verified successfully' : 'Payment pending on delivery',
    }, 'Payment processed successfully');
  } catch (error) {
    return apiError('Failed to process payment', 500, error);
  }
}

