import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
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

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return apiSuccess(categories, 'Categories retrieved');
  } catch (error) {
    return apiError('Failed to retrieve categories', 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const body = await req.json();
    const { name, description, image } = body;

    if (!name || typeof name !== 'string') {
      return apiError('Category name is required', 400);
    }

    const slug = slugify(name);
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      return apiError('Category already exists', 409);
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description,
        image,
      },
    });

    return apiSuccess(category, 'Category created', 201);
  } catch (error) {
    return apiError('Failed to create category', 500, error);
  }
}

