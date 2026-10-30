import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

// In-memory store mapping client keys to request counters
const clientStore = new Map<string, ClientRecord>();

// Periodic memory cleanup every 60 seconds
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of clientStore.entries()) {
    if (now > record.resetTime) {
      clientStore.delete(key);
    }
  }
}, 60000);

// Prevent cleanup interval from preventing graceful Node.js shutdown
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Creates an Express rate-limiting middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too Many Requests: Rate limit exceeded. Please wait a moment before trying again.',
    keyGenerator = (req: Request) => {
      const forwarded = req.headers['x-forwarded-for'];
      const rawIp = typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket.remoteAddress;
      return rawIp || '127.0.0.1';
    },
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.baseUrl || ''}:${keyGenerator(req)}`;
    const now = Date.now();

    let record = clientStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      clientStore.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

    // Standard RFC RateLimit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message,
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    next();
  };
}

// Preset: General API rate limiter (100 requests per 60 seconds)
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too Many Requests: You have exceeded the general API rate limit. Please try again shortly.',
});

// Preset: Authentication rate limiter (15 requests per 60 seconds to protect against brute-force)
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too Many Requests: Too many authentication attempts from this IP. Please wait 1 minute before trying again.',
});

// Preset: AI Gemini endpoints rate limiter (20 requests per 60 seconds to protect model quota)
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too Many Requests: AI request limit reached for this window. Please wait a moment before consulting the AI concierge again.',
});
