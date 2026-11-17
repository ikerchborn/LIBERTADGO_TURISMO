/**
 * Administrative Moderation API Routes for LibertadGO (/api/admin/*)
 * Strictly protected with requireAuth and requireAdmin middleware.
 * Zero trust: Every administrative mutation is verified on the backend and logged in VideoModerationLog.
 */

import express, { Router, Request, Response } from 'express';
import {
  ModerationActionSchema,
  AdminCreateVideoSchema,
  AdminUpdateVideoSchema,
  AdminCreateCreatorSchema,
  AdminUpdateCreatorSchema,
  AdminUpdateVideoPlacesSchema,
} from './creatorsSchemas.ts';
import { getCreatorsRepository, getAuthRepository } from './repositories/index.ts';
import { requireAuth, requireAdmin } from './authService.ts';
import {
  ModerationStatus,
  ModerationActionType,
  ModerationAuditPayload,
} from '../types/creators.ts';
import { INITIAL_PLACES } from '../data/initialPlaces.ts';
import { parseAndValidateVideoUrl } from '../utils/videoUrlParser.ts';
import {
  uploadCreatorAvatar,
  deleteAvatar,
  deleteLocalAvatar,
  getR2ConfigStatus,
  MAX_AVATAR_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from './services/storageService.ts';

export const adminRouter = Router();

// Apply admin guards to all routes in this router
adminRouter.use(requireAuth, requireAdmin);

// 1. GET /api/admin/metrics - Overview statistics
adminRouter.get('/metrics', async (_req: Request, res: Response) => {
  const repo = getCreatorsRepository();
  try {
    const metrics = await repo.getAdminMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Admin Error] Error fetching admin metrics:', err);
    res.status(500).json({ success: false, error: 'Error al consultar métricas del sistema' });
  }
});

// 2. GET /api/admin/moderation/queue - Moderation queue (batch place lookup)
adminRouter.get('/moderation/queue', async (req: Request, res: Response) => {
  const repo = getCreatorsRepository();
  const statusFilter = (req.query.status as ModerationStatus) || 'PENDING';

  try {
    const queue = await repo.listModerationQueue(statusFilter);

    // Batch enrich with place names for quick admin inspection without N+1 queries
    const videoIds = queue.map((v) => v.id);
    const placesMap = typeof repo.getPlacesForVideos === 'function'
      ? await repo.getPlacesForVideos(videoIds)
      : null;

    const enriched = await Promise.all(
      queue.map(async (v) => {
        const places = placesMap ? (placesMap[v.id] || []) : await repo.getPlacesForVideo(v.id);
        return {
          ...v,
          places,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
      count: enriched.length,
      status: statusFilter,
    });
  } catch (err) {
    console.error('[Admin Error] Error fetching moderation queue:', err);
    res.status(500).json({ success: false, error: 'Error al consultar la bandeja de moderación' });
  }
});

// 3. POST /api/admin/moderation/:id/action - Execute moderation action
adminRouter.post('/moderation/:id/action', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = ModerationActionSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const { action, reason, internalNotes, verifiedPlaceIds } = parseResult.data;
  const repo = getCreatorsRepository();

  try {
    const submission = await repo.findSubmissionById(req.params.id);
    if (!submission) {
      res.status(404).json({ success: false, error: 'Publicación no encontrada' });
      return;
    }

    const previousStatus = submission.status;
    const actionToStatusMap: Record<'APPROVE' | 'REJECT' | 'OBSERVE' | 'HIDE', ModerationStatus> = {
      APPROVE: 'APPROVED',
      REJECT: 'REJECTED',
      OBSERVE: 'OBSERVED',
      HIDE: 'HIDDEN',
    };
    const newStatus: ModerationStatus = actionToStatusMap[action];

    const validPlaceIds = verifiedPlaceIds && Array.isArray(verifiedPlaceIds)
      ? verifiedPlaceIds.filter((pId) => INITIAL_PLACES.some((p) => p.id === pId))
      : undefined;

    const auditPayload: ModerationAuditPayload = {
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action,
      previousStatus,
      newStatus,
      reason: reason || null,
      internalNotes: internalNotes || null,
    };

    // Update status and record audit log atomically
    const updated = await repo.updateSubmissionStatus(
      submission.id,
      newStatus,
      reason || null,
      req.user.userId,
      auditPayload,
      validPlaceIds
    );

    res.json({
      success: true,
      data: updated,
      message: `Publicación moderada con éxito. Estado: ${newStatus}`,
    });
  } catch (err) {
    console.error('[Admin Error] Error performing moderation action:', err);
    res.status(500).json({ success: false, error: 'Error interno al procesar acción de moderación' });
  }
});

// 4. GET /api/admin/moderation/:id/history - Audit trail
adminRouter.get('/moderation/:id/history', async (req: Request, res: Response) => {
  const repo = getCreatorsRepository();
  try {
    const logs = await repo.getModerationLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('[Admin Error] Error fetching moderation logs:', err);
    res.status(500).json({ success: false, error: 'Error al consultar historial de moderación' });
  }
});

// 5. PUT /api/admin/moderation/:id/places - Link/unlink tourist directory places
adminRouter.put('/moderation/:id/places', async (req: Request, res: Response) => {
  const parseResult = AdminUpdateVideoPlacesSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const { placeIds, primaryPlaceId } = parseResult.data;

  const invalidPlaceIds = placeIds.filter((pId) =>
    !INITIAL_PLACES.some((p) => p.id === pId)
  );
  if (invalidPlaceIds.length > 0) {
    res.status(400).json({
      success: false,
      error: `Los siguientes lugares no existen en el catálogo turístico: ${invalidPlaceIds.join(', ')}`,
    });
    return;
  }

  const uniquePlaceIds = Array.from(new Set(placeIds));
  if (primaryPlaceId && uniquePlaceIds.length > 0 && !uniquePlaceIds.includes(primaryPlaceId)) {
    res.status(400).json({
      success: false,
      error: 'El lugar principal debe pertenecer a la lista de lugares asociados',
    });
    return;
  }

  const repo = getCreatorsRepository();
  try {
    await repo.associatePlaces(req.params.id, uniquePlaceIds, primaryPlaceId);
    const updatedPlaces = await repo.getPlacesForVideo(req.params.id);

    res.json({
      success: true,
      data: updatedPlaces,
      message: 'Lugares vinculados actualizados correctamente',
    });
  } catch (err) {
    console.error('[Admin Error] Error updating linked places:', err);
    res.status(500).json({ success: false, error: 'Error al actualizar lugares asociados' });
  }
});

// 5a. POST /api/admin/videos - Register new video directly from Admin
adminRouter.post('/videos', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = AdminCreateVideoSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const {
    videoUrl,
    title,
    description,
    contentType,
    category,
    localityId,
    thumbnailUrl,
    creatorProfileId,
    placeIds,
    primaryPlaceId,
    status,
    externalCreatorHandle,
    externalCreatorDisplayName,
    externalCreatorAvatarUrl,
  } = parseResult.data;

  const parsed = parseAndValidateVideoUrl(videoUrl);
  if (!parsed.isValid || !parsed.data) {
    res.status(400).json({ success: false, error: parsed.error || 'URL no soportada' });
    return;
  }

  const repo = getCreatorsRepository();

  try {
    const existing = await repo.findSubmissionByPlatformAndExternalId(
      parsed.data.platform,
      parsed.data.externalVideoId
    );

    if (existing) {
      res.status(409).json({
        success: false,
        error: `Este video ya se encuentra registrado con estado: ${existing.status}`,
      });
      return;
    }

    // Verify places against valid tourist catalog
    const invalidPlaceIds = placeIds.filter((pId) =>
      !INITIAL_PLACES.some((p) => p.id === pId)
    );
    if (invalidPlaceIds.length > 0) {
      res.status(400).json({
        success: false,
        error: `Los siguientes lugares no existen en el catálogo turístico: ${invalidPlaceIds.join(', ')}`,
      });
      return;
    }

    const uniquePlaceIds = Array.from(new Set(placeIds));
    if (primaryPlaceId && uniquePlaceIds.length > 0 && !uniquePlaceIds.includes(primaryPlaceId)) {
      res.status(400).json({
        success: false,
        error: 'El lugar principal debe pertenecer a la lista de lugares asociados',
      });
      return;
    }

    const resultingStatus = status || 'APPROVED';
    const auditPayload: ModerationAuditPayload = {
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action: 'CREATE',
      previousStatus: null,
      newStatus: resultingStatus,
      reason: 'Registro y publicación directa desde el panel de administración',
      internalNotes: `Creado por administrador ${req.user.name}`,
    };

    const submission = await repo.createSubmission(
      {
        userId: req.user.userId,
        creatorProfileId: creatorProfileId || null,
        platform: parsed.data.platform,
        externalVideoId: parsed.data.externalVideoId,
        videoUrl: parsed.data.canonicalUrl,
        embedUrl: parsed.data.embedUrl,
        thumbnailUrl: thumbnailUrl || null,
        title,
        description: description || null,
        contentType,
        category,
        localityId: localityId || null,
        status: resultingStatus,
        externalCreatorHandle: externalCreatorHandle || (!creatorProfileId ? parsed.data.authorHandle || null : null),
        externalCreatorDisplayName: externalCreatorDisplayName || null,
        externalCreatorAvatarUrl: externalCreatorAvatarUrl || null,
      },
      uniquePlaceIds,
      primaryPlaceId || (uniquePlaceIds[0] || null),
      auditPayload
    );

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Video registrado y catalogado exitosamente',
    });
  } catch (err) {
    console.error('[Admin Error] Error creating video:', err);
    res.status(500).json({ success: false, error: 'Error interno al registrar el video' });
  }
});

// 5b. PUT /api/admin/videos/:id - Update existing video metadata and places
adminRouter.put('/videos/:id', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = AdminUpdateVideoSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const repo = getCreatorsRepository();
  try {
    const existing = await repo.findSubmissionById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Publicación de video no encontrada' });
      return;
    }

    const { placeIds, primaryPlaceId, ...updateFields } = parseResult.data;

    if (placeIds !== undefined) {
      const invalidPlaceIds = placeIds.filter((pId) =>
        !INITIAL_PLACES.some((p) => p.id === pId)
      );
      if (invalidPlaceIds.length > 0) {
        res.status(400).json({
          success: false,
          error: `Los siguientes lugares no existen en el catálogo turístico: ${invalidPlaceIds.join(', ')}`,
        });
        return;
      }
    }

    const uniquePlaceIds = placeIds !== undefined ? Array.from(new Set(placeIds)) : undefined;

    if (uniquePlaceIds !== undefined && primaryPlaceId) {
      if (!uniquePlaceIds.includes(primaryPlaceId)) {
        res.status(400).json({
          success: false,
          error: 'El lugar principal debe pertenecer a la lista de lugares asociados',
        });
        return;
      }
    } else if (uniquePlaceIds === undefined && primaryPlaceId) {
      const currentPlaces = await repo.getPlacesForVideo(req.params.id);
      if (!currentPlaces.some((p) => p.id === primaryPlaceId)) {
        res.status(400).json({
          success: false,
          error: 'El lugar principal debe pertenecer a los lugares actualmente asociados al video',
        });
        return;
      }
    }

    // Detect changed fields for precise traceability
    const changedFields: string[] = [];
    for (const [key, val] of Object.entries(updateFields)) {
      if (val !== undefined && (existing as any)[key] !== val) {
        changedFields.push(key);
      }
    }
    if (uniquePlaceIds !== undefined) {
      changedFields.push('placeIds');
    }
    if (primaryPlaceId !== undefined) {
      changedFields.push('primaryPlaceId');
    }

    const resultingStatus = updateFields.status || existing.status;
    const auditPayload: ModerationAuditPayload = {
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action: 'UPDATE',
      previousStatus: existing.status,
      newStatus: resultingStatus,
      reason: 'Edición administrativa de metadatos o lugares asociados',
      internalNotes: `Modificado por ${req.user.name}`,
      changedFields: changedFields.length > 0 ? changedFields : null,
    };

    const updated = await repo.updateSubmission(
      req.params.id,
      updateFields,
      uniquePlaceIds,
      primaryPlaceId,
      auditPayload
    );

    res.json({
      success: true,
      data: updated,
      message: 'Metadatos de video actualizados exitosamente',
    });
  } catch (err) {
    console.error('[Admin Error] Error updating video:', err);
    res.status(500).json({ success: false, error: 'Error interno al actualizar el video' });
  }
});

// 5c. GET /api/admin/creators - List all creators for admin management
adminRouter.get('/creators', async (_req: Request, res: Response) => {
  const repo = getCreatorsRepository();
  try {
    const creators = await repo.listAllCreators();
    res.json({
      success: true,
      data: creators,
      total: creators.length,
    });
  } catch (err) {
    console.error('[Admin Error] Error listing creators for admin:', err);
    res.status(500).json({ success: false, error: 'Error al consultar directorio de creadores' });
  }
});

// 5d. POST /api/admin/creators - Create/Register creator profile from Admin
adminRouter.post('/creators', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = AdminCreateCreatorSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const repo = getCreatorsRepository();

  try {
    // Los perfiles creados desde administración son independientes.
    // No deben vincularse automáticamente a la cuenta del administrador.
    const targetUserId = null;

    // Un handle debe ser único entre todos los perfiles.
    const existing = await repo.findCreatorProfileByHandle(parseResult.data.handle);

    if (existing) {
      res.status(409).json({
        success: false,
        error: `El identificador @${parseResult.data.handle} ya está registrado`,
      });
      return;
    }

    const hasAudienceData =
      parseResult.data.tiktokFollowers !== undefined ||
      parseResult.data.instagramFollowers !== undefined ||
      parseResult.data.youtubeSubscribers !== undefined;

    const audienceUpdatedAt =
      parseResult.data.audienceUpdatedAt ||
      (hasAudienceData ? new Date().toISOString() : null);

    const profile = await repo.createCreatorProfile({
      userId: targetUserId,
      handle: parseResult.data.handle,
      displayName: parseResult.data.displayName,
      bio: parseResult.data.bio || null,
      avatarUrl: parseResult.data.avatarUrl || null,
      primaryPlatform: parseResult.data.primaryPlatform,
      tiktokUrl: parseResult.data.tiktokUrl || null,
      instagramUrl: parseResult.data.instagramUrl || null,
      youtubeUrl: parseResult.data.youtubeUrl || null,
      tiktokFollowers: parseResult.data.tiktokFollowers ?? null,
      instagramFollowers: parseResult.data.instagramFollowers ?? null,
      youtubeSubscribers: parseResult.data.youtubeSubscribers ?? null,
      audienceUpdatedAt,
      isPublic: parseResult.data.isPublic ?? true,
      isVerified: parseResult.data.isVerified ?? false,
    });

    // Record creator audit log
    await repo.addCreatorAuditLog({
      creatorId: profile.id,
      creatorHandle: profile.handle,
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action: 'CREATE',
      previousData: null,
      newData: profile,
      changeSummary: `Creado perfil de creador @${profile.handle} (${profile.displayName}) con plataforma ${profile.primaryPlatform}.`,
    });

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Perfil de creador registrado exitosamente',
    });
  } catch (err) {
    console.error('[Admin Error] Error registering creator profile:', err);
    res.status(500).json({
      success: false,
      error: 'Error interno al registrar perfil de creador',
    });
  }
});

// 5e. PUT /api/admin/creators/:id - Update creator profile
adminRouter.put('/creators/:id', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = AdminUpdateCreatorSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const repo = getCreatorsRepository();

  try {
    const existing = await repo.findCreatorProfileById(req.params.id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Perfil de creador no encontrado',
      });
      return;
    }

    // Evitar que el handle actualizado pertenezca a otro creador.
    if (
      parseResult.data.handle &&
      parseResult.data.handle !== existing.handle
    ) {
      const handleOwner = await repo.findCreatorProfileByHandle(
        parseResult.data.handle
      );

      if (handleOwner && handleOwner.id !== existing.id) {
        res.status(409).json({
          success: false,
          error: `El identificador @${parseResult.data.handle} ya está registrado`,
        });
        return;
      }
    }

    const updatedProfile = await repo.updateCreatorProfile(
      req.params.id,
      parseResult.data
    );

    if (!updatedProfile) {
      res.status(404).json({
        success: false,
        error: 'No se pudo actualizar el perfil de creador',
      });
      return;
    }

    const isVisibilityOnly = Object.keys(parseResult.data).length === 1 && parseResult.data.isPublic !== undefined;
    const action = isVisibilityOnly ? 'VISIBILITY_CHANGE' : 'UPDATE';
    const summary = isVisibilityOnly
      ? `Cambiado estado de visibilidad a ${parseResult.data.isPublic ? 'PÚBLICO' : 'OCULTO'} para @${updatedProfile.handle}.`
      : `Actualizado perfil de creador @${updatedProfile.handle} (${Object.keys(parseResult.data).join(', ')}).`;

    await repo.addCreatorAuditLog({
      creatorId: updatedProfile.id,
      creatorHandle: updatedProfile.handle,
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action,
      previousData: existing,
      newData: updatedProfile,
      changeSummary: summary,
    });

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Perfil de creador actualizado exitosamente',
    });
  } catch (err) {
    console.error('[Admin Error] Error updating creator profile:', err);
    res.status(500).json({
      success: false,
      error: 'Error interno al actualizar perfil de creador',
    });
  }
});

// 5f. GET /api/admin/creators/:id/history - Audit trail for specific creator profile
adminRouter.get('/creators/:id/history', async (req: Request, res: Response) => {
  try {
    const repo = getCreatorsRepository();
    const logs = await repo.getCreatorAuditLogs(req.params.id, 50);
    res.json({
      success: true,
      data: logs,
      creatorId: req.params.id,
    });
  } catch (err) {
    console.error('[Admin Error] Error fetching creator history:', err);
    res.status(500).json({ success: false, error: 'Error al consultar historial del creador' });
  }
});

// 5e. GET /api/admin/users - List users for creator profile association
adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const authRepo = getAuthRepository();
    if (typeof authRepo.listUsers === 'function') {
      const users = await authRepo.listUsers();
      res.json({ success: true, data: users });
      return;
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('[Admin Error] Error listing users for admin:', err);
    res.status(500).json({ success: false, error: 'Error al consultar lista de usuarios' });
  }
});

// 5f. GET /api/admin/storage/status - Check Cloudflare R2 and storage configuration
adminRouter.get('/storage/status', async (_req: Request, res: Response) => {
  try {
    const r2Status = getR2ConfigStatus();
    res.json({
      success: true,
      storage: r2Status.mode,
      r2Configured: r2Status.isConfigured,
      missingConfig: r2Status.missingVariables,
      bucketName: r2Status.bucketName,
      publicUrl: r2Status.publicUrl,
      endpoint: r2Status.endpoint,
      maxSizeBytes: MAX_AVATAR_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    });
  } catch (err) {
    console.error('[Admin Error] Error querying storage status:', err);
    res.status(500).json({ success: false, error: 'Error al consultar estado de almacenamiento' });
  }
});

// 5g. POST /api/admin/uploads/avatar - Upload creator profile photograph
adminRouter.post(
  '/uploads/avatar',
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream'], limit: '6mb' }),
  express.json({ limit: '8mb' }),
  async (req: Request, res: Response) => {
    try {
      let fileBuffer: Buffer | null = null;
      let filename: string = 'avatar.jpg';
      let mimeType: string = 'image/jpeg';

      if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        fileBuffer = req.body;
        const rawFilename = req.headers['x-filename'] as string | undefined;
        if (rawFilename) {
          try {
            filename = decodeURIComponent(rawFilename);
          } catch {
            filename = rawFilename;
          }
        }
        mimeType = (req.headers['content-type'] as string) || 'image/jpeg';
      } else if (req.body && typeof req.body.imageBase64 === 'string') {
        const cleanBase64 = req.body.imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        fileBuffer = Buffer.from(cleanBase64, 'base64');
        filename = req.body.filename || 'avatar.jpg';
        mimeType = req.body.mimeType || 'image/jpeg';
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo de imagen para cargar',
        });
        return;
      }

      const result = await uploadCreatorAvatar(fileBuffer, filename, mimeType);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Fotografía de perfil de creador cargada exitosamente',
      });
    } catch (err) {
      console.error('[Admin Error] Error uploading creator avatar:', err);
      res.status(400).json({
        success: false,
        error: err instanceof Error ? err.message : 'Error al procesar la imagen',
      });
    }
  }
);

// 5h. DELETE /api/admin/uploads/avatar - Remove creator avatar (R2 or local)
adminRouter.delete('/uploads/avatar', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ success: false, error: 'URL requerida para eliminar la imagen' });
    return;
  }

  try {
    const deleted = await deleteAvatar(url);
    res.json({ success: true, deleted });
  } catch (err) {
    console.error('[Admin Error] Error deleting avatar:', err);
    res.status(500).json({ success: false, error: 'Error al eliminar imagen' });
  }
});

// =========================================================================
// CATALOG ADMINISTRATION: PLACES, CATEGORIES, LOCALITIES, DUPLICATES, AUDIT
// =========================================================================

import { getPlaceRepository } from './repositories/placeRepository.ts';
import {
  CreatePlaceSchema,
  UpdatePlaceSchema,
  UpdatePlaceStatusSchema,
  VerifyPlaceSchema,
  MergeDuplicatesSchema,
} from './placesSchemas.ts';
import { PlaceStatus, UnifiedAuditEntry, AuditModule } from '../types/adminCatalog.ts';

// 6. GET /api/admin/dashboard - Comprehensive system indicators
adminRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const placeRepo = getPlaceRepository();
    const creatorsRepo = getCreatorsRepository();

    // Fetch place metrics and creators metrics in parallel
    const [
      placeMetrics,
      creatorsAdminMetrics,
      allCreators,
      approvedVideosData,
      pendingVideos,
      observedVideos,
      rejectedVideos,
      placeAuditLogs,
      creatorAuditLogs,
      videoModerationLogs,
    ] = await Promise.all([
      placeRepo.getDashboardMetrics().catch((err) => {
        console.error('[Admin Dashboard] Error fetching place metrics:', err);
        return {
          totalPlaces: 0,
          publishedCount: 0,
          draftCount: 0,
          flaggedCount: 0,
          archivedCount: 0,
          verifiedCount: 0,
          unverifiedCount: 0,
          placesByCategory: [],
          placesByLocality: [],
          sourcesDistribution: [],
          potentialDuplicatesCount: 0,
          recentAuditLogs: [],
        };
      }),
      creatorsRepo.getAdminMetrics().catch((err) => {
        console.error('[Admin Dashboard] Error fetching creator admin metrics:', err);
        return {
          totalSubmissions: 0,
          pendingCount: 0,
          approvedCount: 0,
          observedCount: 0,
          rejectedCount: 0,
          totalCreators: 0,
        };
      }),
      creatorsRepo.listAllCreators().catch((err) => {
        console.error('[Admin Dashboard] Error fetching creators:', err);
        return [];
      }),
      creatorsRepo.listApprovedVideos({ limit: 1000 }).catch((err) => {
        console.error('[Admin Dashboard] Error fetching approved videos:', err);
        return { videos: [], total: 0 };
      }),
      creatorsRepo.listModerationQueue('PENDING').catch(() => []),
      creatorsRepo.listModerationQueue('OBSERVED').catch(() => []),
      creatorsRepo.listModerationQueue('REJECTED').catch(() => []),
      placeRepo.getAuditLogs('all', 30).catch(() => []),
      creatorsRepo.getCreatorAuditLogs('all', 30).catch(() => []),
      creatorsRepo.getAllModerationLogs(30).catch(() => []),
    ]);

    // 1. Process Creators Data
    const publicCreators = allCreators.filter((c) => c.isPublic);
    const hiddenCreators = allCreators.filter((c) => !c.isPublic);
    const verifiedCreators = allCreators.filter((c) => !!c.isVerified);

    let totalAudienceFollowers = 0;
    const creatorsWithAudience = allCreators.map((c) => {
      const followers =
        (c.tiktokFollowers || 0) +
        (c.instagramFollowers || 0) +
        (c.youtubeSubscribers || 0);
      totalAudienceFollowers += followers;
      return {
        id: c.id,
        handle: c.handle.startsWith('@') ? c.handle : `@${c.handle}`,
        displayName: c.displayName,
        avatarUrl: c.avatarUrl || null,
        platform: c.primaryPlatform,
        followers,
        isVerified: !!c.isVerified,
      };
    });

    // Top creators by audience
    const topCreators = creatorsWithAudience
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 5);

    const creatorsByPlatform = {
      tiktok: allCreators.filter((c) => String(c.primaryPlatform).toLowerCase() === 'tiktok').length,
      instagram: allCreators.filter((c) => String(c.primaryPlatform).toLowerCase() === 'instagram').length,
      youtube: allCreators.filter((c) => String(c.primaryPlatform).toLowerCase() === 'youtube').length,
    };

    // 2. Process Videos & Moderation Data
    const approvedVideos = approvedVideosData.videos;
    const allKnownSubmissions = [
      ...approvedVideos,
      ...pendingVideos,
      ...observedVideos,
      ...rejectedVideos,
    ];

    // Deduplicate submissions by id in case of overlap
    const uniqueSubmissionsMap = new Map<string, typeof allKnownSubmissions[0]>();
    for (const sub of allKnownSubmissions) {
      if (sub && sub.id) {
        uniqueSubmissionsMap.set(sub.id, sub);
      }
    }
    const uniqueSubmissions = Array.from(uniqueSubmissionsMap.values());

    const videoPlatformsCount = {
      tiktok: uniqueSubmissions.filter((v) => String(v.platform).toLowerCase() === 'tiktok').length,
      instagram: uniqueSubmissions.filter((v) => String(v.platform).toLowerCase() === 'instagram').length,
      youtube: uniqueSubmissions.filter((v) => String(v.platform).toLowerCase() === 'youtube').length,
    };

    // Video Category breakdown
    const categoryCountMap = new Map<string, number>();
    for (const v of approvedVideos) {
      const cat = v.category || 'general';
      categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1);
    }
    const videosByCategory = Array.from(categoryCountMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Place coverage by approved videos
    const placeIdsWithVideos = new Set<string>();
    for (const v of approvedVideos) {
      if (Array.isArray(v.places)) {
        for (const p of v.places) {
          if (p && p.id) placeIdsWithVideos.add(p.id);
        }
      }
    }
    const placesWithVideosCount = placeIdsWithVideos.size;
    const catalogCoveragePercent =
      placeMetrics.totalPlaces > 0
        ? Math.round((placesWithVideosCount / placeMetrics.totalPlaces) * 100)
        : 0;

    // 3. Process Engagement Data (Zero fake data, real accumulated counts)
    let totalInternalViews = 0;
    let totalInternalSaves = 0;
    let totalExternalViews = 0;
    let totalExternalLikes = 0;
    let totalExternalComments = 0;

    for (const v of uniqueSubmissions) {
      totalInternalViews += v.internalViewsCount || 0;
      totalInternalSaves += v.internalSavesCount || 0;
      if (v.externalMetrics) {
        totalExternalViews += v.externalMetrics.views || 0;
        totalExternalLikes += v.externalMetrics.likes || 0;
        totalExternalComments += v.externalMetrics.comments || 0;
      }
    }

    // 4. Unified Recent Activity
    const recentActivity: UnifiedAuditEntry[] = [];

    // Place activity
    for (const log of placeAuditLogs.slice(0, 15)) {
      const catalogPlace = INITIAL_PLACES.find((p) => p.id === log.placeId);
      const name =
        log.newData?.name ||
        log.previousData?.name ||
        catalogPlace?.name ||
        `Lugar #${log.placeId}`;
      recentActivity.push({
        id: log.id,
        module: 'places' as AuditModule,
        entityId: log.placeId,
        entityName: name,
        action: log.action,
        adminUserId: log.adminUserId,
        adminName: log.adminName || 'Administrador',
        previousStatus: log.previousData?.status || null,
        newStatus: log.newData?.status || null,
        changeSummary: log.changeSummary,
        createdAt: log.createdAt,
      });
    }

    // Creator activity
    for (const log of creatorAuditLogs.slice(0, 15)) {
      const handle = log.creatorHandle ? `@${log.creatorHandle.replace(/^@+/, '')}` : '';
      const displayName =
        log.creatorDisplayName ||
        log.newData?.displayName ||
        log.previousData?.displayName ||
        null;
      const entityName = handle
        ? `${handle}${displayName ? ` (${displayName})` : ''}`
        : `Creador #${log.creatorId.slice(0, 8)}`;

      recentActivity.push({
        id: log.id,
        module: 'creators' as AuditModule,
        entityId: log.creatorId,
        entityName,
        action: log.action,
        adminUserId: log.adminUserId,
        adminName: log.adminName || 'Administrador',
        previousStatus:
          log.previousData?.isPublic !== undefined
            ? log.previousData.isPublic
              ? 'Público'
              : 'Oculto'
            : null,
        newStatus:
          log.newData?.isPublic !== undefined
            ? log.newData.isPublic
              ? 'Público'
              : 'Oculto'
            : null,
        changeSummary: log.changeSummary,
        createdAt: log.createdAt,
      });
    }

    // Video activity
    for (const log of videoModerationLogs.slice(0, 15)) {
      const action =
        log.action ||
        (log.newStatus === 'APPROVED'
          ? 'APPROVE'
          : log.newStatus === 'REJECTED'
          ? 'REJECT'
          : log.newStatus === 'OBSERVED'
          ? 'OBSERVE'
          : 'UPDATE');

      let summary = `Moderación: ${action} (${log.newStatus})`;
      if (log.reason) summary += ` - Motivo: ${log.reason}`;
      if (log.internalNotes && !log.internalNotes.startsWith('__METADATA_START__')) {
        summary += ` - ${log.internalNotes}`;
      }

      const vTitle = log.videoTitle;
      const vPlatform = log.videoPlatform;
      const entityName = vTitle
        ? `${vPlatform ? `[${String(vPlatform).toUpperCase()}] ` : ''}${vTitle}`
        : `Video #${log.videoId.slice(0, 8)}`;

      recentActivity.push({
        id: log.id,
        module: 'videos' as AuditModule,
        entityId: log.videoId,
        entityName,
        action,
        adminUserId: log.adminUserId,
        adminName: log.adminName || 'Administrador',
        previousStatus: log.previousStatus || null,
        newStatus: log.newStatus || null,
        changeSummary: summary,
        createdAt: log.createdAt,
      });
    }

    // Sort unified activity descending by date and keep top 8
    recentActivity.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const topRecentActivity = recentActivity.slice(0, 8);

    // Build comprehensive response
    const completeDashboardMetrics = {
      ...placeMetrics,
      creators: {
        total: allCreators.length,
        publicCount: publicCreators.length,
        hiddenCount: hiddenCreators.length,
        verifiedCount: verifiedCreators.length,
        byPlatform: creatorsByPlatform,
        totalAudienceFollowers,
        topCreators,
      },
      videos: {
        total: creatorsAdminMetrics.totalSubmissions,
        approved: creatorsAdminMetrics.approvedCount,
        pending: creatorsAdminMetrics.pendingCount,
        observed: creatorsAdminMetrics.observedCount,
        rejected: creatorsAdminMetrics.rejectedCount,
        byPlatform: videoPlatformsCount,
        byCategory: videosByCategory,
        placesWithVideosCount,
        catalogCoveragePercent,
      },
      engagement: {
        totalInternalViews,
        totalInternalSaves,
        totalExternalViews,
        totalExternalLikes,
        totalExternalComments,
      },
      recentActivity: topRecentActivity,
    };

    res.json({
      success: true,
      data: completeDashboardMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Admin Error] Error fetching admin dashboard metrics:', err);
    res.status(500).json({
      success: false,
      error: 'Error al generar indicadores del panel administrativo',
    });
  }
});

// 7. GET /api/admin/places - List places with filters and pagination
adminRouter.get('/places', async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      category,
      localityId,
      isVerified,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const repo = getPlaceRepository();
    const result = await repo.listPlaces({
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? (status as PlaceStatus | 'ALL') : undefined,
      category: typeof category === 'string' ? (category as any) : undefined,
      localityId: typeof localityId === 'string' ? localityId : undefined,
      isVerified:
        isVerified === 'true'
          ? true
          : isVerified === 'false'
          ? false
          : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
      sortBy: typeof sortBy === 'string' ? (sortBy as any) : 'updatedAt',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    });

    res.json({
      success: true,
      data: result.places,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err) {
    console.error('[Admin Error] Error listing places:', err);
    res.status(500).json({ success: false, error: 'Error al consultar catálogo administrativo' });
  }
});

// 8. GET /api/admin/places/:id - Single place details with full relations
adminRouter.get('/places/:id', async (req: Request, res: Response) => {
  try {
    const repo = getPlaceRepository();
    const place = await repo.getPlaceById(req.params.id);
    if (!place) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado en el catálogo' });
      return;
    }

    const history = await repo.getAuditLogs(place.id, 20);

    res.json({
      success: true,
      data: {
        ...place,
        auditHistory: history,
      },
    });
  } catch (err) {
    console.error('[Admin Error] Error fetching place details:', err);
    res.status(500).json({ success: false, error: 'Error al consultar detalle del lugar' });
  }
});

// 9. POST /api/admin/places - Create new place
adminRouter.post('/places', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = CreatePlaceSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  try {
    const repo = getPlaceRepository();
    const created = await repo.createPlace(parseResult.data as any, req.user.userId, req.user.name);
    res.status(201).json({
      success: true,
      data: created,
      message: `Lugar "${created.name}" creado exitosamente`,
    });
  } catch (err) {
    console.error('[Admin Error] Error creating place:', err);
    res.status(500).json({ success: false, error: 'Error al crear lugar en el catálogo' });
  }
});

// 10. PUT /api/admin/places/:id - Full place update
adminRouter.put('/places/:id', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = UpdatePlaceSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  try {
    const repo = getPlaceRepository();
    const updated = await repo.updatePlace(
      req.params.id,
      parseResult.data as any,
      req.user.userId,
      req.user.name,
      req.body.changeSummary
    );

    if (!updated) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado para actualizar' });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: `Lugar "${updated.name}" actualizado exitosamente`,
    });
  } catch (err) {
    console.error('[Admin Error] Error updating place:', err);
    res.status(500).json({ success: false, error: 'Error al actualizar lugar' });
  }
});

// 11. PATCH /api/admin/places/:id/status - Change place status
adminRouter.patch('/places/:id/status', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = UpdatePlaceStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  try {
    const repo = getPlaceRepository();
    const updated = await repo.updateStatus(
      req.params.id,
      parseResult.data.status,
      req.user.userId,
      req.user.name,
      parseResult.data.reason
    );

    if (!updated) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: `Estado de "${updated.name}" cambiado a ${parseResult.data.status}`,
    });
  } catch (err) {
    console.error('[Admin Error] Error changing place status:', err);
    res.status(500).json({ success: false, error: 'Error al actualizar estado del lugar' });
  }
});

// 12. PATCH /api/admin/places/:id/verify - Update verification
adminRouter.patch('/places/:id/verify', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = VerifyPlaceSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  try {
    const repo = getPlaceRepository();
    const updated = await repo.verifyPlace(
      req.params.id,
      parseResult.data.isVerified,
      parseResult.data.verificationLevel,
      parseResult.data.notes,
      req.user.userId,
      req.user.name
    );

    if (!updated) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: `Verificación de "${updated.name}" actualizada con éxito`,
    });
  } catch (err) {
    console.error('[Admin Error] Error verifying place:', err);
    res.status(500).json({ success: false, error: 'Error al actualizar verificación' });
  }
});

// 13. GET /api/admin/categories - Category statistics
adminRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const repo = getPlaceRepository();
    const stats = await repo.getCategoriesStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[Admin Error] Error fetching categories stats:', err);
    res.status(500).json({ success: false, error: 'Error al consultar categorías' });
  }
});

// 14. GET /api/admin/localities - Locality statistics
adminRouter.get('/localities', async (_req: Request, res: Response) => {
  try {
    const repo = getPlaceRepository();
    const stats = await repo.getLocalitiesStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[Admin Error] Error fetching localities stats:', err);
    res.status(500).json({ success: false, error: 'Error al consultar localidades' });
  }
});

// 15. GET /api/admin/sources - Sources statistics
adminRouter.get('/sources', async (_req: Request, res: Response) => {
  try {
    const repo = getPlaceRepository();
    const stats = await repo.getSourcesStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[Admin Error] Error fetching sources stats:', err);
    res.status(500).json({ success: false, error: 'Error al consultar fuentes de datos' });
  }
});

// 16. GET /api/admin/duplicates - Potential duplicates detection
adminRouter.get('/duplicates', async (_req: Request, res: Response) => {
  try {
    const repo = getPlaceRepository();
    const duplicates = await repo.findDuplicates();
    res.json({
      success: true,
      data: duplicates,
      total: duplicates.length,
    });
  } catch (err) {
    console.error('[Admin Error] Error detecting duplicates:', err);
    res.status(500).json({ success: false, error: 'Error al identificar duplicados' });
  }
});

// 17. POST /api/admin/duplicates/merge - Merge duplicates into primary place
adminRouter.post('/duplicates/merge', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = MergeDuplicatesSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  try {
    const repo = getPlaceRepository();
    const result = await repo.mergeDuplicates(
      parseResult.data.primaryId,
      parseResult.data.duplicateIds,
      req.user.userId,
      req.user.name
    );

    res.json({
      success: true,
      data: result.primaryPlace,
      mergedCount: result.mergedCount,
      message: `Fusión completada: ${result.mergedCount} lugar(es) fusionado(s) exitosamente`,
    });
  } catch (err) {
    console.error('[Admin Error] Error merging duplicates:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Error al fusionar lugares duplicados',
    });
  }
});

// 18. GET /api/admin/audit - Unified immutable audit trail across Places, Creators, and Videos
adminRouter.get('/audit', async (req: Request, res: Response) => {
  try {
    const placeRepo = getPlaceRepository();
    const creatorsRepo = getCreatorsRepository();

    const moduleFilter = typeof req.query.module === 'string' ? req.query.module.toLowerCase() : 'all';
    const actionFilter = typeof req.query.action === 'string' ? req.query.action.toUpperCase() : 'ALL';
    const searchFilter = typeof req.query.search === 'string' ? req.query.search.toLowerCase().trim() : '';
    const startDateFilter = typeof req.query.startDate === 'string' && req.query.startDate.trim() ? req.query.startDate.trim() : null;
    const endDateFilter = typeof req.query.endDate === 'string' && req.query.endDate.trim() ? req.query.endDate.trim() : null;
    const legacyPlaceId = typeof req.query.placeId === 'string' ? req.query.placeId : undefined;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));

    // Parallel fetch from all modules
    const [placeLogs, creatorLogs, videoLogs] = await Promise.all([
      placeRepo.getAuditLogs(legacyPlaceId || 'all', 500).catch((err) => {
        console.error('[Admin Audit] Error fetching place audit logs:', err);
        return [];
      }),
      creatorsRepo.getCreatorAuditLogs('all', 500).catch((err) => {
        console.error('[Admin Audit] Error fetching creator audit logs:', err);
        return [];
      }),
      creatorsRepo.getAllModerationLogs(500).catch((err) => {
        console.error('[Admin Audit] Error fetching video moderation logs:', err);
        return [];
      }),
    ]);

    // Map Places entries
    const placeEntries: UnifiedAuditEntry[] = placeLogs.map((log) => {
      const catalogPlace = INITIAL_PLACES.find((p) => p.id === log.placeId);
      const name = log.newData?.name || log.previousData?.name || catalogPlace?.name || `Lugar #${log.placeId}`;
      return {
        id: log.id,
        module: 'places' as AuditModule,
        entityId: log.placeId,
        entityName: name,
        action: log.action,
        adminUserId: log.adminUserId,
        adminName: log.adminName || 'Administrador',
        previousStatus: log.previousData?.status || null,
        newStatus: log.newData?.status || null,
        changeSummary: log.changeSummary,
        details: {
          previousData: log.previousData,
          newData: log.newData,
        },
        createdAt: log.createdAt,
      };
    });

    // Map Creators entries
    const creatorEntries: UnifiedAuditEntry[] = creatorLogs.map((log) => {
      const handle = log.creatorHandle ? `@${log.creatorHandle.replace(/^@+/, '')}` : '';
      const displayName = log.creatorDisplayName || log.newData?.displayName || log.previousData?.displayName || null;
      const entityName = handle
        ? `${handle}${displayName ? ` (${displayName})` : ''}`
        : `Creador #${log.creatorId.slice(0, 8)}`;

      return {
        id: log.id,
        module: 'creators' as AuditModule,
        entityId: log.creatorId,
        entityName,
        action: log.action,
        adminUserId: log.adminUserId,
        adminName: log.adminName || 'Administrador',
        previousStatus:
          log.previousData?.isPublic !== undefined
            ? log.previousData.isPublic
              ? 'Público'
              : 'Oculto'
            : null,
        newStatus:
          log.newData?.isPublic !== undefined
            ? log.newData.isPublic
              ? 'Público'
              : 'Oculto'
            : null,
        changeSummary: log.changeSummary,
        details: {
          previousData: log.previousData,
          newData: log.newData,
        },
        createdAt: log.createdAt,
      };
    });

    // Map Videos entries
    const videoEntries: UnifiedAuditEntry[] = videoLogs.map((log) => {
      const action =
        log.action ||
        (log.newStatus === 'APPROVED'
          ? 'APPROVE'
          : log.newStatus === 'REJECTED'
          ? 'REJECT'
          : log.newStatus === 'OBSERVED'
          ? 'OBSERVE'
          : 'UPDATE');

      let summary = `Moderación: ${action} (${log.newStatus})`;
      if (log.reason) summary += ` - Motivo: ${log.reason}`;
      if (log.internalNotes && !log.internalNotes.startsWith('__METADATA_START__')) {
        summary += ` - ${log.internalNotes}`;
      }

      const vTitle = log.videoTitle;
      const vPlatform = log.videoPlatform;
      const entityName = vTitle
        ? `${vPlatform ? `[${String(vPlatform).toUpperCase()}] ` : ''}${vTitle}`
        : `Video #${log.videoId.slice(0, 8)}`;

      return {
        id: log.id,
        module: 'videos' as AuditModule,
        entityId: log.videoId,
        entityName,
        action,
        adminUserId: log.adminUserId,
        adminName: log.adminName || 'Administrador',
        previousStatus: log.previousStatus || null,
        newStatus: log.newStatus || null,
        changeSummary: summary,
        details: {
          reason: log.reason,
          internalNotes: log.internalNotes,
          changedFields: log.changedFields,
          previousStatus: log.previousStatus,
          newStatus: log.newStatus,
          videoTitle: log.videoTitle,
          videoPlatform: log.videoPlatform,
        },
        createdAt: log.createdAt,
      };
    });

    // Module counts before filtering
    const counts = {
      all: placeEntries.length + creatorEntries.length + videoEntries.length,
      places: placeEntries.length,
      creators: creatorEntries.length,
      videos: videoEntries.length,
    };

    // Filter by module
    let allEntries: UnifiedAuditEntry[] = [];
    if (moduleFilter === 'places') {
      allEntries = placeEntries;
    } else if (moduleFilter === 'creators') {
      allEntries = creatorEntries;
    } else if (moduleFilter === 'videos') {
      allEntries = videoEntries;
    } else {
      allEntries = [...placeEntries, ...creatorEntries, ...videoEntries];
    }

    // Filter by legacy placeId if passed and module was all
    if (legacyPlaceId) {
      allEntries = allEntries.filter((e) => e.module === 'places' && e.entityId === legacyPlaceId);
    }

    // Filter by action
    if (actionFilter && actionFilter !== 'ALL') {
      allEntries = allEntries.filter(
        (e) => e.action.toUpperCase() === actionFilter || (e.newStatus && e.newStatus.toUpperCase() === actionFilter)
      );
    }

    // Filter by search text
    if (searchFilter) {
      allEntries = allEntries.filter((e) => {
        const matchesEntity =
          e.entityName.toLowerCase().includes(searchFilter) ||
          e.entityId.toLowerCase().includes(searchFilter);
        const matchesSummary = e.changeSummary.toLowerCase().includes(searchFilter);
        const matchesAdmin =
          e.adminName.toLowerCase().includes(searchFilter) ||
          (e.adminUserId && e.adminUserId.toLowerCase().includes(searchFilter));
        const matchesAction = e.action.toLowerCase().includes(searchFilter);
        return matchesEntity || matchesSummary || matchesAdmin || matchesAction;
      });
    }

    // Filter by date range (normalized UTC boundaries)
    if (startDateFilter) {
      const normalizedStart =
        startDateFilter.length === 10 && !startDateFilter.includes('T')
          ? `${startDateFilter}T00:00:00.000Z`
          : startDateFilter;
      const startTime = new Date(normalizedStart).getTime();
      if (!isNaN(startTime)) {
        allEntries = allEntries.filter((e) => new Date(e.createdAt).getTime() >= startTime);
      }
    }
    if (endDateFilter) {
      const normalizedEnd =
        endDateFilter.length === 10 && !endDateFilter.includes('T')
          ? `${endDateFilter}T23:59:59.999Z`
          : endDateFilter;
      const endTime = new Date(normalizedEnd).getTime();
      if (!isNaN(endTime)) {
        allEntries = allEntries.filter((e) => new Date(e.createdAt).getTime() <= endTime);
      }
    }

    // Sort by created_at DESC (newest first)
    allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const total = allEntries.length;
    const startIndex = (page - 1) * limit;
    const paginated = allEntries.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts,
    });
  } catch (err) {
    console.error('[Admin Error] Error fetching unified audit trail:', err);
    res.status(500).json({ success: false, error: 'Error al consultar registro de auditoría unificado' });
  }
});

// 19. GET /api/admin/places/:id/history - Audit logs for specific place
adminRouter.get('/places/:id/history', async (req: Request, res: Response) => {
  try {
    const repo = getPlaceRepository();
    const logs = await repo.getAuditLogs(req.params.id, 50);
    res.json({
      success: true,
      data: logs,
      placeId: req.params.id,
    });
  } catch (err) {
    console.error('[Admin Error] Error fetching place history:', err);
    res.status(500).json({ success: false, error: 'Error al consultar historial del lugar' });
  }
});

