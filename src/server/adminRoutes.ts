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
  ModerationAuditPayload,
} from '../types/creators.ts';
import { INITIAL_PLACES } from '../data/initialPlaces.ts';
import { parseAndValidateVideoUrl } from '../utils/videoUrlParser.ts';
import {
  uploadCreatorAvatar,
  deleteAvatar,
  getR2ConfigStatus,
  MAX_AVATAR_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from './services/storageService.ts';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/metrics', async (_req: Request, res: Response) => {
  const repo = getCreatorsRepository();
  try {
    const metrics = await repo.getAdminMetrics();
    res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[Admin Error] Error fetching admin metrics:', err);
    res.status(500).json({ success: false, error: 'Error al consultar métricas del sistema' });
  }
});

adminRouter.get('/moderation/queue', async (req: Request, res: Response) => {
  const repo = getCreatorsRepository();
  const rawStatus = typeof req.query.status === 'string' ? req.query.status : 'ALL';
  const validStatuses: ModerationStatus[] = ['PENDING', 'APPROVED', 'OBSERVED', 'REJECTED', 'HIDDEN'];
  const statusFilter: ModerationStatus | 'ALL' = rawStatus === 'ALL'
    ? 'ALL'
    : validStatuses.includes(rawStatus as ModerationStatus)
      ? rawStatus as ModerationStatus
      : 'ALL';

  try {
    let queue;
    if (statusFilter === 'ALL') {
      const batches = await Promise.all(validStatuses.map((status) => repo.listModerationQueue(status)));
      queue = batches.flat();
    } else {
      queue = await repo.listModerationQueue(statusFilter);
    }

    const videoIds = queue.map((v) => v.id);
    const placesMap = typeof repo.getPlacesForVideos === 'function'
      ? await repo.getPlacesForVideos(videoIds)
      : null;

    const enriched = await Promise.all(queue.map(async (v) => ({
      ...v,
      places: placesMap ? (placesMap[v.id] || []) : await repo.getPlacesForVideo(v.id),
    })));

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

adminRouter.post('/moderation/:id/action', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = ModerationActionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, error: parseResult.error.issues.map((i) => i.message).join(', ') });
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
      APPROVE: 'APPROVED', REJECT: 'REJECTED', OBSERVE: 'OBSERVED', HIDE: 'HIDDEN',
    };
    const newStatus = actionToStatusMap[action];
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

    const updated = await repo.updateSubmissionStatus(
      submission.id,
      newStatus,
      reason || null,
      req.user.userId,
      auditPayload,
      validPlaceIds
    );

    res.json({ success: true, data: updated, message: `Publicación moderada con éxito. Estado: ${newStatus}` });
  } catch (err) {
    console.error('[Admin Error] Error performing moderation action:', err);
    res.status(500).json({ success: false, error: 'Error interno al procesar acción de moderación' });
  }
});

adminRouter.get('/moderation/:id/history', async (req: Request, res: Response) => {
  try {
    const repo = getCreatorsRepository();
    const logs = await repo.getModerationLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('[Admin Error] Error fetching moderation logs:', err);
    res.status(500).json({ success: false, error: 'Error al consultar historial de moderación' });
  }
});

adminRouter.put('/moderation/:id/places', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = AdminUpdateVideoPlacesSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, error: parseResult.error.issues.map((i) => i.message).join(', ') });
    return;
  }

  const { placeIds, primaryPlaceId } = parseResult.data;
  const invalidPlaceIds = placeIds.filter((pId) => !INITIAL_PLACES.some((p) => p.id === pId));
  if (invalidPlaceIds.length > 0) {
    res.status(400).json({ success: false, error: `Los siguientes lugares no existen en el catálogo turístico: ${invalidPlaceIds.join(', ')}` });
    return;
  }

  const uniquePlaceIds = Array.from(new Set(placeIds));
  if (primaryPlaceId && uniquePlaceIds.length > 0 && !uniquePlaceIds.includes(primaryPlaceId)) {
    res.status(400).json({ success: false, error: 'El lugar principal debe pertenecer a la lista de lugares asociados' });
    return;
  }

  const repo = getCreatorsRepository();
  try {
    const existing = await repo.findSubmissionById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Publicación no encontrada' });
      return;
    }

    const previousPlaces = await repo.getPlacesForVideo(req.params.id);
    await repo.associatePlaces(req.params.id, uniquePlaceIds, primaryPlaceId);
    const updatedPlaces = await repo.getPlacesForVideo(req.params.id);

    const addedPlaceIds = uniquePlaceIds.filter((id) => !previousPlaces.some((p) => p.id === id));
    const removedPlaceIds = previousPlaces.map((p) => p.id).filter((id) => !uniquePlaceIds.includes(id));

    if (addedPlaceIds.length > 0 || removedPlaceIds.length > 0) {
      await repo.addModerationLog({
        videoId: req.params.id,
        adminUserId: req.user.userId,
        adminName: req.user.name,
        action: 'UPDATE',
        previousStatus: existing.status,
        newStatus: existing.status,
        reason: 'Cambio de asociaciones con lugares turísticos',
        internalNotes: `Añadidos: ${addedPlaceIds.join(', ') || 'ninguno'}; retirados: ${removedPlaceIds.join(', ') || 'ninguno'}`,
        changedFields: ['placeIds'],
      });
    }

    res.json({ success: true, data: updatedPlaces, message: 'Lugares vinculados actualizados correctamente' });
  } catch (err) {
    console.error('[Admin Error] Error updating linked places:', err);
    res.status(500).json({ success: false, error: 'Error al actualizar lugares asociados' });
  }
});

adminRouter.post('/videos', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = AdminCreateVideoSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, error: parseResult.error.issues.map((i) => i.message).join(', ') });
    return;
  }

  const {
    videoUrl, title, description, contentType, category, localityId, thumbnailUrl,
    creatorProfileId, placeIds, primaryPlaceId, status,
    externalCreatorHandle, externalCreatorDisplayName, externalCreatorAvatarUrl,
  } = parseResult.data;

  const parsed = parseAndValidateVideoUrl(videoUrl);
  if (!parsed.isValid || !parsed.data) {
    res.status(400).json({ success: false, error: parsed.error || 'URL no soportada' });
    return;
  }

  const repo = getCreatorsRepository();
  try {
    const existing = await repo.findSubmissionByPlatformAndExternalId(parsed.data.platform, parsed.data.externalVideoId);
    if (existing) {
      res.status(409).json({ success: false, error: `Este video ya se encuentra registrado con estado: ${existing.status}` });
      return;
    }

    const invalidPlaceIds = placeIds.filter((pId) => !INITIAL_PLACES.some((p) => p.id === pId));
    if (invalidPlaceIds.length > 0) {
      res.status(400).json({ success: false, error: `Los siguientes lugares no existen en el catálogo turístico: ${invalidPlaceIds.join(', ')}` });
      return;
    }

    const uniquePlaceIds = Array.from(new Set(placeIds));
    if (primaryPlaceId && uniquePlaceIds.length > 0 && !uniquePlaceIds.includes(primaryPlaceId)) {
      res.status(400).json({ success: false, error: 'El lugar principal debe pertenecer a la lista de lugares asociados' });
      return;
    }

    const resultingStatus = status || 'PENDING';
    const auditPayload: ModerationAuditPayload = {
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action: 'CREATE',
      previousStatus: null,
      newStatus: resultingStatus,
      reason: 'Registro desde el panel de administración',
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

    res.status(201).json({ success: true, data: submission, message: 'Video registrado y enviado a revisión' });
  } catch (err) {
    console.error('[Admin Error] Error creating video:', err);
    res.status(500).json({ success: false, error: 'Error interno al registrar el video' });
  }
});

adminRouter.put('/videos/:id', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const parseResult = AdminUpdateVideoSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, error: parseResult.error.issues.map((i) => i.message).join(', ') });
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
    const previousPlaces = await repo.getPlacesForVideo(req.params.id);

    if (placeIds !== undefined) {
      const invalidPlaceIds = placeIds.filter((pId) => !INITIAL_PLACES.some((p) => p.id === pId));
      if (invalidPlaceIds.length > 0) {
        res.status(400).json({ success: false, error: `Los siguientes lugares no existen en el catálogo turístico: ${invalidPlaceIds.join(', ')}` });
        return;
      }
    }

    const uniquePlaceIds = placeIds !== undefined ? Array.from(new Set(placeIds)) : undefined;
    if (uniquePlaceIds !== undefined && primaryPlaceId && !uniquePlaceIds.includes(primaryPlaceId)) {
      res.status(400).json({ success: false, error: 'El lugar principal debe pertenecer a la lista de lugares asociados' });
      return;
    }

    const changedFields: string[] = [];
    for (const [key, val] of Object.entries(updateFields)) {
      if (val !== undefined && (existing as any)[key] !== val) changedFields.push(key);
    }

    let placeChangeSummary = '';
    if (uniquePlaceIds !== undefined) {
      changedFields.push('placeIds');
      const previousIds = previousPlaces.map((p) => p.id);
      const addedPlaceIds = uniquePlaceIds.filter((id) => !previousIds.includes(id));
      const removedPlaceIds = previousIds.filter((id) => !uniquePlaceIds.includes(id));
      placeChangeSummary = ` Añadidos: ${addedPlaceIds.join(', ') || 'ninguno'}; retirados: ${removedPlaceIds.join(', ') || 'ninguno'}.`;
    }
    if (primaryPlaceId !== undefined) changedFields.push('primaryPlaceId');

    const resultingStatus = updateFields.status || existing.status;
    const auditPayload: ModerationAuditPayload = {
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action: 'UPDATE',
      previousStatus: existing.status,
      newStatus: resultingStatus,
      reason: 'Edición administrativa de metadatos o lugares asociados',
      internalNotes: `Modificado por ${req.user.name}.${placeChangeSummary}`,
      changedFields: changedFields.length > 0 ? changedFields : null,
    };

    const updated = await repo.updateSubmission(req.params.id, updateFields, uniquePlaceIds, primaryPlaceId, auditPayload);
    res.json({ success: true, data: updated, message: 'Metadatos de video actualizados exitosamente' });
  } catch (err) {
    console.error('[Admin Error] Error updating video:', err);
    res.status(500).json({ success: false, error: 'Error interno al actualizar el video' });
  }
});

adminRouter.get('/creators', async (_req: Request, res: Response) => {
  try {
    const repo = getCreatorsRepository();
    const creators = await repo.listAllCreators();
    res.json({ success: true, data: creators, total: creators.length });
  } catch (err) {
    console.error('[Admin Error] Error listing creators:', err);
    res.status(500).json({ success: false, error: 'Error al consultar directorio de creadores' });
  }
});

adminRouter.post('/creators', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }
  const parseResult = AdminCreateCreatorSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, error: parseResult.error.issues.map((i) => i.message).join(', ') });
    return;
  }
  const repo = getCreatorsRepository();
  try {
    const existing = await repo.findCreatorProfileByHandle(parseResult.data.handle);
    if (existing) {
      res.status(409).json({ success: false, error: `El identificador @${parseResult.data.handle} ya está registrado` });
      return;
    }
    const hasAudienceData = parseResult.data.tiktokFollowers !== undefined || parseResult.data.instagramFollowers !== undefined || parseResult.data.youtubeSubscribers !== undefined;
    const profile = await repo.createCreatorProfile({
      userId: null,
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
      audienceUpdatedAt: parseResult.data.audienceUpdatedAt || (hasAudienceData ? new Date().toISOString() : null),
      isPublic: parseResult.data.isPublic ?? true,
      isVerified: parseResult.data.isVerified ?? false,
    });
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
    res.status(201).json({ success: true, data: profile, message: 'Perfil de creador registrado exitosamente' });
  } catch (err) {
    console.error('[Admin Error] Error registering creator profile:', err);
    res.status(500).json({ success: false, error: 'Error interno al registrar perfil de creador' });
  }
});

adminRouter.put('/creators/:id', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }
  const parseResult = AdminUpdateCreatorSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, error: parseResult.error.issues.map((i) => i.message).join(', ') });
    return;
  }
  const repo = getCreatorsRepository();
  try {
    const existing = await repo.findCreatorProfileById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Perfil de creador no encontrado' });
      return;
    }
    if (parseResult.data.handle && parseResult.data.handle !== existing.handle) {
      const handleOwner = await repo.findCreatorProfileByHandle(parseResult.data.handle);
      if (handleOwner && handleOwner.id !== existing.id) {
        res.status(409).json({ success: false, error: `El identificador @${parseResult.data.handle} ya está registrado` });
        return;
      }
    }
    const updatedProfile = await repo.updateCreatorProfile(req.params.id, parseResult.data);
    if (!updatedProfile) {
      res.status(404).json({ success: false, error: 'No se pudo actualizar el perfil de creador' });
      return;
    }
    const isVisibilityOnly = Object.keys(parseResult.data).length === 1 && parseResult.data.isPublic !== undefined;
    await repo.addCreatorAuditLog({
      creatorId: updatedProfile.id,
      creatorHandle: updatedProfile.handle,
      adminUserId: req.user.userId,
      adminName: req.user.name,
      action: isVisibilityOnly ? 'VISIBILITY_CHANGE' : 'UPDATE',
      previousData: existing,
      newData: updatedProfile,
      changeSummary: isVisibilityOnly
        ? `Cambiado estado de visibilidad a ${parseResult.data.isPublic ? 'PÚBLICO' : 'OCULTO'} para @${updatedProfile.handle}.`
        : `Actualizado perfil de creador @${updatedProfile.handle} (${Object.keys(parseResult.data).join(', ')}).`,
    });
    res.json({ success: true, data: updatedProfile, message: 'Perfil de creador actualizado exitosamente' });
  } catch (err) {
    console.error('[Admin Error] Error updating creator profile:', err);
    res.status(500).json({ success: false, error: 'Error interno al actualizar perfil de creador' });
  }
});

adminRouter.get('/creators/:id/history', async (req: Request, res: Response) => {
  try {
    const repo = getCreatorsRepository();
    const logs = await repo.getCreatorAuditLogs(req.params.id, 50);
    res.json({ success: true, data: logs, creatorId: req.params.id });
  } catch (err) {
    console.error('[Admin Error] Error fetching creator history:', err);
    res.status(500).json({ success: false, error: 'Error al consultar historial del creador' });
  }
});

adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const authRepo = getAuthRepository();
    if (typeof authRepo.listUsers === 'function') {
      res.json({ success: true, data: await authRepo.listUsers() });
      return;
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('[Admin Error] Error listing users:', err);
    res.status(500).json({ success: false, error: 'Error al consultar lista de usuarios' });
  }
});

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

adminRouter.post('/uploads/avatar', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream'], limit: '6mb' }), express.json({ limit: '8mb' }), async (req: Request, res: Response) => {
  try {
    let fileBuffer: Buffer | null = null;
    let filename = 'avatar.jpg';
    let mimeType = 'image/jpeg';
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      fileBuffer = req.body;
      const rawFilename = req.headers['x-filename'] as string | undefined;
      if (rawFilename) {
        try { filename = decodeURIComponent(rawFilename); } catch { filename = rawFilename; }
      }
      mimeType = (req.headers['content-type'] as string) || 'image/jpeg';
    } else if (req.body && typeof req.body.imageBase64 === 'string') {
      const cleanBase64 = req.body.imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      fileBuffer = Buffer.from(cleanBase64, 'base64');
      filename = req.body.filename || 'avatar.jpg';
      mimeType = req.body.mimeType || 'image/jpeg';
    }
    if (!fileBuffer || fileBuffer.length === 0) {
      res.status(400).json({ success: false, error: 'No se recibió ningún archivo de imagen para cargar' });
      return;
    }
    const result = await uploadCreatorAvatar(fileBuffer, filename, mimeType);
    res.status(201).json({ success: true, data: result, message: 'Fotografía de perfil de creador cargada exitosamente' });
  } catch (err) {
    console.error('[Admin Error] Error uploading creator avatar:', err);
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Error al procesar la imagen' });
  }
});

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
