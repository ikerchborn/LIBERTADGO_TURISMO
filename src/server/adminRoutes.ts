/**
 * Administrative Moderation API Routes for LibertadGO (/api/admin/*)
 * Strictly protected with requireAuth and requireAdmin middleware.
 * Zero trust: Every administrative mutation is verified on the backend and logged in VideoModerationLog.
 */

import { Router, Request, Response } from 'express';
import { ModerationActionSchema } from './creatorsSchemas.ts';
import { getCreatorsRepository } from './repositories/index.ts';
import { requireAuth, requireAdmin } from './authService.ts';
import { ModerationStatus } from '../types/creators.ts';
import { INITIAL_PLACES } from '../data/initialPlaces.ts';

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

// 2. GET /api/admin/moderation/queue - Moderation queue
adminRouter.get('/moderation/queue', async (req: Request, res: Response) => {
  const repo = getCreatorsRepository();
  const statusFilter = (req.query.status as ModerationStatus) || 'PENDING';

  try {
    const queue = await repo.listModerationQueue(statusFilter);

    // Enrich with place names for quick admin inspection
    const enriched = await Promise.all(
      queue.map(async (v) => {
        const places = await repo.getPlacesForVideo(v.id);
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

    // If verified places are provided by admin, update associations
    if (verifiedPlaceIds && Array.isArray(verifiedPlaceIds)) {
      const validIds = verifiedPlaceIds.filter((pId) =>
        INITIAL_PLACES.some((p) => p.id === pId)
      );
      await repo.associatePlaces(submission.id, validIds);
    }

    // Update status
    const updated = await repo.updateSubmissionStatus(
      submission.id,
      newStatus,
      reason || null,
      req.user.userId
    );

    // Record immutable audit log
    await repo.addModerationLog({
      videoId: submission.id,
      adminUserId: req.user.userId,
      adminName: req.user.name,
      previousStatus,
      newStatus,
      reason: reason || null,
      internalNotes: internalNotes || null,
    });

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
  const { placeIds, primaryPlaceId } = req.body;
  if (!Array.isArray(placeIds)) {
    res.status(400).json({ success: false, error: 'placeIds debe ser un array de identificadores' });
    return;
  }

  const repo = getCreatorsRepository();
  try {
    const validIds = placeIds.filter((pId) =>
      INITIAL_PLACES.some((p) => p.id === pId)
    );

    await repo.associatePlaces(req.params.id, validIds, primaryPlaceId);
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
