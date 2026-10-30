import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'unreachable';
  }

  return NextResponse.json({
    status: 'online',
    service: 'Rauhie Shop Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        detail: 'GET /api/products/:id',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
      },
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories',
      },
      orders: {
        list: 'GET /api/orders',
        create: 'POST /api/orders',
        detail: 'GET /api/orders/:id',
        updateStatus: 'PATCH /api/orders/:id',
      },
      cart: {
        get: 'GET /api/cart',
        addOrUpdate: 'POST /api/cart',
        remove: 'DELETE /api/cart',
      },
    },
  });
}

