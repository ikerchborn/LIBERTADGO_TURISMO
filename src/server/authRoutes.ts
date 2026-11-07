/**
 * Authentication Routes for LibertadGO
 * Endpoints: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
 */

import { Router, Request, Response } from 'express';
import { RegisterUserSchema, LoginUserSchema } from './creatorsSchemas.ts';
import { getAuthRepository, getCreatorsRepository } from './repositories/index.ts';
import { hashPassword, verifyPassword, createToken, requireAuth } from './authService.ts';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  const parseResult = RegisterUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const { email, password, name } = parseResult.data;
  const authRepo = getAuthRepository();

  try {
    const existing = await authRepo.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cuenta registrada con este correo electrónico',
      });
      return;
    }

    // Public registration always assigns USER role. Admin is only created via bootstrapAdminFromEnv.
    const newUser = await authRepo.createUser({
      email,
      passwordHash: hashPassword(password),
      name,
      role: 'USER',
    });

    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          createdAt: newUser.createdAt,
        },
        token,
      },
      message: 'Cuenta creada exitosamente',
    });
  } catch (err) {
    console.error('[Auth Error] Error registering user:', err);
    res.status(500).json({ success: false, error: 'Error interno al registrar usuario' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  const parseResult = LoginUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const { email, password } = parseResult.data;
  const authRepo = getAuthRepository();

  try {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Verifica tu correo o contraseña.',
      });
      return;
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Verifica tu correo o contraseña.',
      });
      return;
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
    });
  } catch (err) {
    console.error('[Auth Error] Error logging in:', err);
    res.status(500).json({ success: false, error: 'Error interno al iniciar sesión' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  try {
    const authRepo = getAuthRepository();
    const creatorsRepo = getCreatorsRepository();

    const user = await authRepo.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    const creatorProfile = await creatorsRepo.findCreatorProfileByUserId(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        creatorProfile,
      },
    });
  } catch (err) {
    console.error('[Auth Error] Error getting current user:', err);
    res.status(500).json({ success: false, error: 'Error al consultar información del usuario' });
  }
});
