import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { updateOrderStatusSchema } from '@/lib/validations/order';
import { apiError, apiSuccess } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true },
            },
          },
        },
      },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    // If order has an associated user, only that user or an ADMIN can view it
    if (order.userId && (!auth || (auth.userId !== order.userId && auth.role !== 'ADMIN'))) {
      return apiError('Forbidden', 403);
    }

    return apiSuccess(order, 'Order retrieved');
  } catch (error) {
    return apiError('Failed to retrieve order', 500, error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const { id } = await params;
    const body = await req.json();

    const parseResult = updateOrderStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return apiError('Validation error', 400, parseResult.error.format());
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Order not found', 404);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: parseResult.data,
      include: { items: true },
    });

    return apiSuccess(updated, 'Order updated successfully');
  } catch (error) {
    return apiError('Failed to update order', 500, error);
  }
}

