import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { apiError, apiSuccess } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError('Validation error', 400, parseResult.error.format());
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return apiError('Invalid email or password', 401);
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return apiError('Invalid email or password', 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return apiSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    return apiError('Failed to login', 500, error);
  }
}

