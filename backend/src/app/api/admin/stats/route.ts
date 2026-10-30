import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      orders,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        select: { id: true, name: true, stock: true, price: true },
        take: 10,
      }),
      prisma.order.findMany({
        select: { totalAmount: true, status: true, paymentStatus: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED' && o.paymentStatus !== 'REFUNDED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
    const processingOrdersCount = orders.filter((o) => o.status === 'PROCESSING').length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED').length;

    return apiSuccess({
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders: pendingOrdersCount,
        processingOrders: processingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
      },
      lowStockProducts,
      recentOrders,
    }, 'Admin statistics retrieved');
  } catch (error) {
    return apiError('Failed to fetch admin stats', 500, error);
  }
}

