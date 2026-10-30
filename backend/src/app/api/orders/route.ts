import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validations/order';
import { apiError, apiSuccess } from '@/lib/response';

export const dynamic = 'force-dynamic';

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `RH-${dateStr}-${randomStr}`;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return apiError('Unauthorized: Please login to view orders', 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (auth.role !== 'ADMIN') {
      where.userId = auth.userId;
    } else {
      const filterUser = searchParams.get('userId');
      if (filterUser) where.userId = filterUser;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return apiSuccess(orders, 'Orders retrieved', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return apiError('Failed to retrieve orders', 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();

    const parseResult = createOrderSchema.safeParse(body);
    if (!parseResult.success) {
      return apiError('Validation error', 400, parseResult.error.format());
    }

    const { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, items, shippingFee, notes } = parseResult.data;

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      return apiError('One or more products in your cart are unavailable', 400);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      };
    });

    const totalAmount = subtotal + shippingFee;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: auth?.userId || null,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: shippingAddress as any,
          paymentMethod,
          subtotal,
          shippingFee,
          totalAmount,
          notes,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Deduct stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // If user was logged in, clear their cart items for these products
      if (auth?.userId) {
        await tx.cartItem.deleteMany({
          where: {
            userId: auth.userId,
            productId: { in: productIds },
          },
        });
      }

      return newOrder;
    });

    return apiSuccess(order, 'Order placed successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to place order', 400, error);
  }
}

