import { NextResponse } from 'next/server';

export interface ApiResponseOptions<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | unknown;
  meta?: Record<string, unknown>;
}

export function apiSuccess<T>(data: T, message = 'Success', status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      meta,
    },
    { status }
  );
}

export function apiError(message = 'An unexpected error occurred', status = 500, error?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: error instanceof Error ? error.message : error,
    },
    { status }
  );
}

