import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();

    const parseResult = createReviewSchema.safeParse(body);
    if (!parseResult.success) {
      return apiError('Validation error', 400, parseResult.error.format());
    }

    const { productId, rating, comment } = parseResult.data;

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return apiError('Product not found', 404);
    }

    let userId = auth?.userId;
    if (!userId) {
      // Find or create guest user
      const guest = await prisma.user.upsert({
        where: { email: 'guest@rauhie.com' },
        update: {},
        create: {
          name: 'Verified Shopper',
          email: 'guest@rauhie.com',
          passwordHash: 'guest-account-placeholder',
          role: 'CUSTOMER',
        },
      });
      userId = guest.id;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(review, 'Review submitted successfully', 201);
  } catch (error) {
    return apiError('Failed to submit review', 500, error);
  }
}

