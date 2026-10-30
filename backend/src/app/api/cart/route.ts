import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return apiError('Unauthorized', 401);
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: auth.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return apiSuccess({ items, total }, 'Cart retrieved');
  } catch (error) {
    return apiError('Failed to retrieve cart', 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return apiError('Invalid productId or quantity', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      return apiError('Product not found or inactive', 404);
    }

    if (product.stock < quantity) {
      return apiError(`Only ${product.stock} items in stock`, 400);
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: auth.userId,
          productId,
        },
      },
      update: {
        quantity,
      },
      create: {
        userId: auth.userId,
        productId,
        quantity,
      },
      include: {
        product: {
          select: { id: true, name: true, price: true, images: true, stock: true },
        },
      },
    });

    return apiSuccess(cartItem, 'Cart updated');
  } catch (error) {
    return apiError('Failed to update cart', 500, error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (productId) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: auth.userId,
          productId,
        },
      });
      return apiSuccess({ productId }, 'Item removed from cart');
    } else {
      // Clear all
      await prisma.cartItem.deleteMany({
        where: { userId: auth.userId },
      });
      return apiSuccess(null, 'Cart cleared');
    }
  } catch (error) {
    return apiError('Failed to modify cart', 500, error);
  }
}

