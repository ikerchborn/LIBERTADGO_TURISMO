/**
 * Authentication & Security Service for LibertadGO
 * Provides password hashing (scrypt + random salt), cryptographically signed session tokens,
 * role-based access control (USER / ADMIN), and ownership authorization middleware.
 * Zero hardcoded credentials.
 */

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/creators.ts';
import { getAuthRepository } from './repositories/index.ts';

const DEV_DEFAULT_SECRET = 'libertadgo_sec_sig_7b29e01f5c6a84d3e218';
const TOKEN_EXPIRY_DAYS = 7;

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!secret || secret.trim() === '' || secret === DEV_DEFAULT_SECRET) {
      throw new Error(
        '[Security] FATAL: SESSION_SECRET is mandatory in production and must not use the development default secret.'
      );
    }
    if (secret.length < 16) {
      throw new Error(
        '[Security] FATAL: SESSION_SECRET must be at least 16 characters long in production.'
      );
    }
    return secret;
  }

  return secret || DEV_DEFAULT_SECRET;
}

export function validateSecurityConfig(): void {
  // Triggers fail-fast check in production
  getSessionSecret();
}


export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// --- PASSWORD UTILITIES ---

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

// --- TOKEN UTILITIES ---

export function createToken(user: { id: string; email: string; name: string; role: UserRole }): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_DAYS * 86400,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(payloadB64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// --- MIDDLEWARES ---

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    // Check for cookie token if present
    const match = req.headers.cookie.match(/libertadgo_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Autenticación requerida. Inicia sesión para continuar.',
    });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Autenticación requerida para acceder al área administrativa.',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado: se requieren permisos administrativos para esta operación.',
    });
    return;
  }

  next();
}

/**
 * Bootstrap Initial Admin on First Boot if environment variables are provided
 * Does NOT hardcode any credentials.
 */
export async function bootstrapAdminFromEnv(): Promise<void> {
  const email = process.env.ADMIN_INITIAL_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const name = process.env.ADMIN_INITIAL_NAME || 'Administrador LibertadGO';

  if (!email || !password) return;

  const authRepo = getAuthRepository();
  const existing = await authRepo.findUserByEmail(email);

  if (!existing) {
    console.log(`[Security] Bootstrapping initial admin account for: ${email}`);
    await authRepo.createUser({
      email,
      passwordHash: hashPassword(password),
      name,
      role: 'ADMIN',
    });
  }
}
