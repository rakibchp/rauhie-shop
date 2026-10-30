import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { updateProductSchema } from '@/lib/validations/product';
import { apiError, apiSuccess } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiSuccess(product, 'Product retrieved');
  } catch (error) {
    return apiError('Failed to retrieve product', 500, error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const { id } = await params;
    const body = await req.json();

    const parseResult = updateProductSchema.safeParse(body);
    if (!parseResult.success) {
      return apiError('Validation error', 400, parseResult.error.format());
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: parseResult.data,
      include: { category: true },
    });

    return apiSuccess(updated, 'Product updated successfully');
  } catch (error) {
    return apiError('Failed to update product', 500, error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Product not found', 404);
    }

    await prisma.product.delete({ where: { id } });
    return apiSuccess({ id }, 'Product deleted successfully');
  } catch (error) {
    return apiError('Failed to delete product', 500, error);
  }
}

