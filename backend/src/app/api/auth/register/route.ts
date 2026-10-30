import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth';
import { apiError, apiSuccess } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError('Validation error', 400, parseResult.error.format());
    }

    const { name, email, password, phone, address } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError('Email already in use', 409);
    }

    const passwordHash = await hashPassword(password);

    // Make the first registered user an ADMIN automatically, else CUSTOMER
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 ? 'ADMIN' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        phone,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return apiSuccess(
      {
        user,
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    return apiError('Failed to register user', 500, error);
  }
}

