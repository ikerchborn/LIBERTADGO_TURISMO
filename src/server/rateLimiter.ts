/**
 * In-Memory Sliding Window Rate Limiter & View Abuse Protection
 * Zero external dependencies, high performance, ephemeral-safe.
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const store = new Map<string, RateLimitRecord>();
  const { windowMs, maxRequests, message = 'Demasiadas solicitudes. Por favor intenta más tarde.' } = options;

  // Periodic cleanup of expired records every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  cleanupInterval.unref();

  const handler = (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : (req.ip || req.socket.remoteAddress || 'unknown_client');

    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds,
      });
      return;
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    next();
  };

  (handler as any).clearForTesting = () => {
    store.clear();
  };

  return handler as ((req: Request, res: Response, next: NextFunction) => void) & { clearForTesting: () => void };
}

/**
 * Authentication Brute-Force Limiter: 10 attempts per minute per IP
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Demasiados intentos de autenticación. Por favor espera 1 minuto.',
});

/**
 * Video Submission Spam Limiter: 10 submissions per 5 minutes per user/IP
 */
export const submissionRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  message: 'Límite de envíos alcanzado. Puedes registrar hasta 10 videos cada 5 minutos.',
  keyGenerator: (req) => req.user?.userId || req.ip || 'anon_submitter',
});

/**
 * Bookmark/Save Toggle Limiter: 30 toggles per minute per user
 */
export const saveVideoRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Límite de guardado en favoritos alcanzado. Espera un momento.',
  keyGenerator: (req) => req.user?.userId || req.ip || 'anon_saver',
});

/**
 * AI Assistant Rate Limiter: 3 requests per minute per user/IP
 */
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 3,
  message: 'Demasiadas consultas al asistente IA. Espera un minuto.',
  keyGenerator: (req) => req.user?.userId || req.ip || 'anon_ai',
});

/**
 * Campaign Creation Limiter: 5 campaigns per hour per user
 */
export const campaignRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  message: 'Límite de creación de campañas alcanzado. Intenta más tarde.',
  keyGenerator: (req) => req.user?.userId || req.ip || 'anon_campaign',
});

/**
 * Campaign Vote Limiter: 20 votes per minute per user
 */
export const voteRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Demasiados votos en poco tiempo. Espera un momento.',
  keyGenerator: (req) => req.user?.userId || req.ip || 'anon_voter',
});

/**
 * Itinerary Creation Limiter: 20 itineraries per 10 minutes per user/IP
 */
export const itineraryRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 20,
  message: 'Límite de creación de itinerarios alcanzado. Espera unos minutos.',
  keyGenerator: (req) => req.user?.userId || req.ip || 'anon_itinerary',
});

/**
 * Server-side AI Daily Credit Tracker (10 free messages per 24h per user/IP)
 * Never trusts client-supplied remainingCredits.
 */
export const AI_FREE_CREDITS_CAP = 10;
const AI_CREDITS_WINDOW_MS = 24 * 60 * 60 * 1000;
const AI_CREDITS_MAX_KEYS = 10000;

class AiCreditTracker {
  private usage = new Map<string, { used: number; resetAt: number }>();

  constructor() {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.usage.entries()) {
        if (now > entry.resetAt) {
          this.usage.delete(key);
        }
      }
    }, 10 * 60 * 1000);
    cleanupInterval.unref();
  }

  public consumeCredit(req: Request): { allowed: boolean; creditsRemaining: number } {
    const key = req.user?.userId || req.ip || req.socket.remoteAddress || 'anon_ai';
    const now = Date.now();
    const record = this.usage.get(key);

    if (!record || now > record.resetAt) {
      if (this.usage.size >= AI_CREDITS_MAX_KEYS) {
        const oldest = this.usage.keys().next().value;
        if (oldest) this.usage.delete(oldest);
      }
      this.usage.set(key, { used: 1, resetAt: now + AI_CREDITS_WINDOW_MS });
      return { allowed: true, creditsRemaining: AI_FREE_CREDITS_CAP - 1 };
    }

    if (record.used >= AI_FREE_CREDITS_CAP) {
      return { allowed: false, creditsRemaining: 0 };
    }

    record.used += 1;
    return { allowed: true, creditsRemaining: AI_FREE_CREDITS_CAP - record.used };
  }

  public clearForTesting(): void {
    this.usage.clear();
  }
}

export const aiCreditTracker = new AiCreditTracker();

/**
 * Video View Deduplication Cache
 * Prevents rapid view count inflation: ensures at least 60 seconds between view increments
 * for the same video from the same IP/user.
 */
class VideoViewDeduplicator {
  private recentViews = new Map<string, number>();

  constructor() {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamp] of this.recentViews.entries()) {
        if (now - timestamp > 60 * 1000) {
          this.recentViews.delete(key);
        }
      }
    }, 60 * 1000);
    cleanupInterval.unref();
  }

  public shouldIncrement(videoId: string, req: Request): boolean {
    const clientId = req.user?.userId || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${videoId}___${clientId}`;
    const now = Date.now();
    const lastView = this.recentViews.get(key);

    if (lastView && now - lastView < 60 * 1000) {
      return false; // Cooldown active, do not inflate view count
    }

    this.recentViews.set(key, now);
    return true;
  }

  public clearForTesting(): void {
    this.recentViews.clear();
  }
}

export const videoViewDeduplicator = new VideoViewDeduplicator();
