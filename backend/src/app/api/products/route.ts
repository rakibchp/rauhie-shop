import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createProductSchema, productQuerySchema } from '@/lib/validations/product';
import { apiError, apiSuccess } from '@/lib/response';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const parsedQuery = productQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return apiError('Invalid query parameters', 400, parsedQuery.error.format());
    }

    const { page, limit, search, categoryId, minPrice, maxPrice, isFeatured, sortBy } = parsedQuery.data;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'name_asc') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess(products, 'Products retrieved', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return apiError('Failed to retrieve products', 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const body = await req.json();
    const parseResult = createProductSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError('Validation error', 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const slug = data.slug || `${slugify(data.name)}-${Date.now().toString(36)}`;

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!categoryExists) {
      return apiError('Category not found', 404);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        stock: data.stock,
        images: data.images,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
      include: {
        category: true,
      },
    });

    return apiSuccess(product, 'Product created successfully', 201);
  } catch (error) {
    return apiError('Failed to create product', 500, error);
  }
}

