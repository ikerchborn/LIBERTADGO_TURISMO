import { Request, Response, Router } from 'express';
import { LA_LIBERTAD_LOCALITIES } from '../types/geo.ts';
import { AdminPlaceRecord, PlaceStatus } from '../types/adminCatalog.ts';
import { requireAdmin, requireAuth } from './authService.ts';
import { getPlaceRepository } from './repositories/placeRepository.ts';
import { CreatePlaceSchema, ListPlacesQuerySchema, UpdatePlaceSchema, UpdatePlaceStatusSchema } from './placesSchemas.ts';
import { formatPlaceValidationIssues } from '../utils/placeValidation.ts';

// Protected places administration router mounted under /api/admin/places in adminRoutes.ts
export const placesRouter = Router();
placesRouter.use(requireAuth, requireAdmin);

const validationResponse = (
  res: Response,
  error: { issues: Array<{ path: PropertyKey[]; message: string; keys?: string[] }> }
) => {
  const details = error.issues.map((issue) => {
    const pathField = issue.path.map(String).join('.');
    const field = pathField || (Array.isArray(issue.keys) && issue.keys.length > 0 ? issue.keys.join(', ') : 'payload');
    return { field, message: issue.message };
  });
  res.status(400).json({
    success: false,
    error: `Revisa los campos indicados: ${formatPlaceValidationIssues(details)}`,
    details,
  });
};

placesRouter.get('/', async (req: Request, res: Response) => {
  const parsed = ListPlacesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    validationResponse(res, parsed.error);
    return;
  }

  try {
    const { search, status, category, localityId, isVerified, page, limit, sortBy, sortOrder } = parsed.data;
    const result = await getPlaceRepository().listPlaces({
      search,
      status,
      category,
      localityId,
      isVerified,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    res.json({ success: true, data: result.places, total: result.total, page: result.page, totalPages: result.totalPages });
  } catch (error) {
    console.error('[Admin Places] Error listing places:', error);
    res.status(500).json({ success: false, error: 'Error al consultar lugares' });
  }
});

placesRouter.get('/:id/history', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await getPlaceRepository().getAuditLogs(req.params.id, 50) });
  } catch (error) {
    console.error('[Admin Places] Error getting place history:', error);
    res.status(500).json({ success: false, error: 'Error al consultar el historial del lugar' });
  }
});

placesRouter.post('/', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Autenticación requerida' });
    return;
  }
  const parsed = CreatePlaceSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    validationResponse(res, parsed.error);
    return;
  }
  try {
    const locality = LA_LIBERTAD_LOCALITIES.find((item) => item.id === parsed.data.localityId);
    if (!locality) {
      res.status(400).json({
        success: false,
        error: 'Localidad (La Libertad): Selecciona una localidad válida de La Libertad.',
        details: [{ field: 'localityId', message: 'La localidad seleccionada no existe.' }],
      });
      return;
    }
    const { changeSummary: _changeSummary, ...fields } = parsed.data;
    const data = { ...fields, localityName: locality.name } as Partial<AdminPlaceRecord>;
    const place = await getPlaceRepository().createPlace(data, req.user.userId, req.user.name);
    res.status(201).json({ success: true, data: place, message: 'Lugar creado correctamente' });
  } catch (error) {
    console.error('[Admin Places] Error creating place:', error);
    res.status(500).json({ success: false, error: 'Error al guardar el lugar' });
  }
});

placesRouter.put('/:id', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Autenticación requerida' });
    return;
  }
  const parsed = UpdatePlaceSchema.safeParse(req.body);
  if (!parsed.success) {
    validationResponse(res, parsed.error);
    return;
  }
  try {
    const repo = getPlaceRepository();
    const existing = await repo.getPlaceById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado' });
      return;
    }
    const localityId = parsed.data.localityId ?? existing.localityId;
    const locality = LA_LIBERTAD_LOCALITIES.find((item) => item.id === localityId);
    if (!locality) {
      res.status(400).json({ success: false, error: 'Selecciona una localidad válida de La Libertad.', details: [{ field: 'localityId', message: 'La localidad seleccionada no existe.' }] });
      return;
    }
    const { changeSummary, ...fields } = parsed.data;
    const updated = await repo.updatePlace(req.params.id, { ...(fields as Partial<AdminPlaceRecord>), localityName: locality.name }, req.user.userId, req.user.name, changeSummary);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado' });
      return;
    }
    res.json({ success: true, data: updated, message: 'Cambios guardados correctamente' });
  } catch (error) {
    console.error('[Admin Places] Error updating place:', error);
    res.status(500).json({ success: false, error: 'Error al guardar los cambios del lugar' });
  }
});

placesRouter.patch('/:id/status', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Autenticación requerida' });
    return;
  }
  const parsed = UpdatePlaceStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    validationResponse(res, parsed.error);
    return;
  }
  try {
    const updated = await getPlaceRepository().updateStatus(req.params.id, parsed.data.status, req.user.userId, req.user.name, parsed.data.reason);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado' });
      return;
    }
    res.json({ success: true, data: updated, message: parsed.data.status === 'ARCHIVED' ? 'Lugar archivado correctamente' : 'Estado del lugar actualizado correctamente' });
  } catch (error) {
    console.error('[Admin Places] Error updating place status:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar el estado del lugar' });
  }
});
