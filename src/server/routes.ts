import { Router, Request, Response } from 'express';
import { catalogRepository } from './repository.ts';
import { INITIAL_EVENTS } from '../data/initialEvents.ts';
import { CreateTripSchema, AddActivitySchema, CreateCampaignSchema, CreateSubmissionSchema, AiChatSchema } from './schemas.ts';
import { authRouter } from './authRoutes.ts';
import { creatorsRouter } from './creatorsRoutes.ts';
import { adminRouter } from './adminRoutes.ts';
import { authMiddleware, requireAuth } from './authService.ts';
import {
  aiRateLimiter,
  aiCreditTracker,
  AI_FREE_CREDITS_CAP,
  campaignRateLimiter,
  submissionRateLimiter,
  voteRateLimiter,
  itineraryRateLimiter,
} from './rateLimiter.ts';

import { checkDatabaseHealth } from './repositories/index.ts';

export const apiRouter = Router();

const DEFAULT_PUBLIC_PAGE_SIZE = 50;
const MAX_PUBLIC_PAGE_SIZE = 100;

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parsePagination(
  pageValue: unknown,
  limitValue: unknown
): { page: number; limit: number } | null {
  const page = pageValue === undefined ? 1 : parsePositiveInteger(pageValue);
  const limit = limitValue === undefined
    ? DEFAULT_PUBLIC_PAGE_SIZE
    : parsePositiveInteger(limitValue);

  if (page === null || limit === null || limit > MAX_PUBLIC_PAGE_SIZE) {
    return null;
  }

  if (!Number.isSafeInteger((page - 1) * limit)) {
    return null;
  }

  return { page, limit };
}

// GET /api/health - Public health check returning application/json status
apiRouter.get('/health', async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: dbHealth.connected ? 'healthy' : 'degraded',
    database: dbHealth.connected ? 'connected' : 'not_configured',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    timestamp: new Date().toISOString(),
  });
});

// Apply auth token parser across all /api routes
apiRouter.use(authMiddleware);

// Mount Creators & Auth Sub-Routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/creators', creatorsRouter);
apiRouter.use('/admin', adminRouter);

// GET /api/destinations
apiRouter.get('/destinations', (_req: Request, res: Response) => {
  const destinations = catalogRepository.getDestinations();
  res.json({
    success: true,
    data: destinations,
    region: 'La Libertad, Perú',
    total: destinations.length,
  });
});

// GET /api/destinations/:id
apiRouter.get('/destinations/:id', (req: Request, res: Response) => {
  const dest = catalogRepository.getDestinationById(req.params.id);
  if (!dest) {
    res.status(404).json({ success: false, error: 'Destino no encontrado en La Libertad' });
    return;
  }
  res.json({ success: true, data: dest });
});

// GET /api/events - Cultural & tourist events in La Libertad
apiRouter.get('/events', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: INITIAL_EVENTS,
    total: INITIAL_EVENTS.length,
    region: 'La Libertad, Perú',
  });
});

// GET /api/places
apiRouter.get('/places', async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query.page, req.query.limit);
  if (!pagination) {
    res.status(400).json({
      success: false,
      error: 'page debe ser un entero positivo y limit un entero entre 1 y 100',
    });
    return;
  }

  try {
    const { localityId, category, q } = req.query;
    const result = await catalogRepository.getPlacesPage({
      localityId: typeof localityId === 'string' ? localityId : undefined,
      category: typeof category === 'string' ? category : undefined,
      search: typeof q === 'string' ? q : undefined,
    }, pagination.page, pagination.limit);

    res.json({
      success: true,
      data: result.places,
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit),
      regionConstraint: 'La Libertad',
      sources: ['MINCETUR', 'OpenStreetMap', 'Directorio_Oficial_La_Libertad'],
    });
  } catch (err) {
    console.error('[Places Error] Error getting places:', err);
    res.status(500).json({ success: false, error: 'Error al consultar catálogo de lugares' });
  }
});

// GET /api/places/search
apiRouter.get('/places/search', async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query.page, req.query.limit);
  if (!pagination) {
    res.status(400).json({
      success: false,
      error: 'page debe ser un entero positivo y limit un entero entre 1 y 100',
    });
    return;
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q || q.length > 120) {
    res.status(400).json({
      success: false,
      error: 'La búsqueda debe tener entre 1 y 120 caracteres',
    });
    return;
  }

  try {
    const localityId = typeof req.query.localityId === 'string' ? req.query.localityId : undefined;
    const result = await catalogRepository.getPlacesPage({
      search: q,
      localityId,
    }, pagination.page, pagination.limit);
    res.json({
      success: true,
      data: result.places,
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit),
    });
  } catch (err) {
    console.error('[Places Error] Error searching places:', err);
    res.status(500).json({ success: false, error: 'Error al buscar lugares' });
  }
});

// GET /api/places/:id/videos - Approved videos associated with a specific place
apiRouter.get('/places/:id/videos', async (req: Request, res: Response) => {
  try {
    const place = await catalogRepository.getPlaceById(req.params.id);
    if (!place) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado en el catálogo de La Libertad' });
      return;
    }
    const { getCreatorsRepository } = await import('./repositories/index.ts');
    const repo = getCreatorsRepository();
    const videos = await repo.getVideosForPlace(req.params.id);
    res.json({
      success: true,
      data: videos,
      total: videos.length,
      placeId: req.params.id,
    });
  } catch (err) {
    console.error('[Places Error] Error getting place videos:', err);
    res.status(500).json({ success: false, error: 'Error al consultar videos del lugar' });
  }
});

// GET /api/places/:id
apiRouter.get('/places/:id', async (req: Request, res: Response) => {
  try {
    const place = await catalogRepository.getPlaceById(req.params.id);
    if (!place) {
      res.status(404).json({ success: false, error: 'Lugar no encontrado en el catálogo de La Libertad' });
      return;
    }
    res.json({ success: true, data: place });
  } catch (err) {
    console.error('[Places Error] Error getting place by id:', err);
    res.status(500).json({ success: false, error: 'Error al consultar lugar' });
  }
});

// GET /api/route - Real-world street routing via OpenStreetMap / OSRM
const COORDS_RE = /^-?\d{1,3}(\.\d+)?,-?\d{1,2}(\.\d+)?(;-?\d{1,3}(\.\d+)?,-?\d{1,2}(\.\d+)?){1,24}$/;

apiRouter.get('/route', async (req: Request, res: Response) => {
  const coordinates = typeof req.query.coordinates === 'string' ? req.query.coordinates.trim() : '';
  if (!COORDS_RE.test(coordinates)) {
    res.status(400).json({
      success: false,
      error: 'Coordenadas inválidas. Debe ser lng1,lat1;lng2,lat2 numérico (2 a 25 puntos).',
    });
    return;
  }

  const pairs = coordinates.split(';');
  const isValidRange = pairs.every((p) => {
    const parts = p.split(',');
    if (parts.length !== 2) return false;
    const lng = Number(parts[0]);
    const lat = Number(parts[1]);
    return Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  });

  if (!isValidRange) {
    res.status(400).json({
      success: false,
      error: 'Coordenadas fuera de rango geográfico válido.',
    });
    return;
  }

  try {
    const rawProfile = typeof req.query.profile === 'string' ? req.query.profile.trim().toLowerCase() : 'driving';
    const osrmProfile = rawProfile === 'walking' || rawProfile === 'foot' ? 'foot' : 'driving';
    const safeCoords = encodeURIComponent(coordinates).replace(/%2C/g, ',').replace(/%3B/g, ';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${safeCoords}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const osrmResponse = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'LibertadGO-Turismo-LaLibertad/1.0',
      },
    });
    clearTimeout(timeout);

    if (!osrmResponse.ok) {
      res.status(502).json({
        success: false,
        error: 'El servicio de enrutamiento OSRM no respondió correctamente.',
      });
      return;
    }

    const data = await osrmResponse.json();
    if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
      const best = data.routes[0];
      const distanceMeters = Math.round(best.distance || 0);
      const durationSeconds = Math.round(best.duration || 0);

      const distanceFormatted =
        distanceMeters < 1000
          ? `${distanceMeters} m`
          : `${(distanceMeters / 1000).toFixed(1)} km`;

      const minutes = Math.round(durationSeconds / 60);
      const durationFormatted =
        minutes < 60
          ? `${Math.max(1, minutes)} min`
          : `${Math.floor(minutes / 60)} h ${minutes % 60 > 0 ? `${minutes % 60} min` : ''}`.trim();

      res.json({
        success: true,
        route: {
          coordinates: best.geometry?.coordinates || [],
          distanceMeters,
          durationSeconds,
          distanceFormatted,
          durationFormatted,
          provider: 'OSRM / OpenStreetMap',
        },
      });
      return;
    }

    res.status(404).json({
      success: false,
      error: 'Recorrido vial aún no disponible para este tramo.',
    });
  } catch (err) {
    console.warn('[Routing] Error querying OSRM:', err instanceof Error ? err.message : String(err));
    res.status(503).json({
      success: false,
      error: 'Servicio de cálculo de rutas no disponible temporalmente.',
    });
  }
});

// POST /api/itineraries
apiRouter.post('/itineraries', itineraryRateLimiter, (req: Request, res: Response) => {
  const parseResult = CreateTripSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e: { message: string }) => e.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const { destinationId, startDate, endDate, title } = parseResult.data;
  const result = catalogRepository.createItinerary({
    destinationId,
    startDate,
    endDate,
    title,
  });

  if (result.error || !result.itinerary) {
    res.status(400).json({ success: false, error: result.error || 'Error al crear itinerario' });
    return;
  }

  res.status(201).json({ success: true, data: result.itinerary });
});

// GET /api/itineraries/:id
apiRouter.get('/itineraries/:id', (req: Request, res: Response) => {
  const itinerary = catalogRepository.getItineraryById(req.params.id);
  if (!itinerary) {
    res.status(404).json({ success: false, error: 'Itinerario no encontrado' });
    return;
  }
  res.json({ success: true, data: itinerary });
});

// POST /api/itineraries/:id/activities
apiRouter.post('/itineraries/:id/activities', async (req: Request, res: Response) => {
  const parseResult = AddActivitySchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e: { message: string }) => e.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }
  const { placeId, dayNumber, timeSlot, notes } = parseResult.data;

  const result = await catalogRepository.addActivity(req.params.id, {
    placeId,
    dayNumber,
    timeSlot,
    notes,
  });

  if (result.error || !result.activity) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }

  res.status(201).json({ success: true, data: result.activity });
});

// DELETE /api/itineraries/:id/activities/:activityId
apiRouter.delete('/itineraries/:id/activities/:activityId', (req: Request, res: Response) => {
  const success = catalogRepository.removeActivity(req.params.id, req.params.activityId);
  if (!success) {
    res.status(404).json({ success: false, error: 'Actividad o itinerario no encontrado' });
    return;
  }
  res.json({ success: true, message: 'Actividad eliminada' });
});

// =========================================================================
// PAQUETE PARA LOCALES & CREADORES: CAMPAÑAS Y CONCURSO DE VIDEOS (TOP 3)
// =========================================================================

// GET /api/campaigns
apiRouter.get('/campaigns', (req: Request, res: Response) => {
  const { localityId, q, startDate, endDate } = req.query;
  const campaigns = catalogRepository.getCampaigns({
    localityId: typeof localityId === 'string' ? localityId : undefined,
    search: typeof q === 'string' ? q : undefined,
    startDate: typeof startDate === 'string' ? startDate : undefined,
    endDate: typeof endDate === 'string' ? endDate : undefined,
  });

  res.json({
    success: true,
    data: campaigns,
    total: campaigns.length,
    region: 'La Libertad, Perú',
    prizesAwardedTo: 'Top 3 Puestos (Oro, Plata, Bronce)',
  });
});

// GET /api/campaigns/:id
apiRouter.get('/campaigns/:id', (req: Request, res: Response) => {
  const campaign = catalogRepository.getCampaignById(req.params.id);
  if (!campaign) {
    res.status(404).json({ success: false, error: 'Campaña no encontrada' });
    return;
  }
  res.json({ success: true, data: campaign });
});

// POST /api/campaigns
apiRouter.post('/campaigns', requireAuth, campaignRateLimiter, (req: Request, res: Response) => {
  const parseResult = CreateCampaignSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e: { message: string }) => e.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const { title, businessName, placeId, localityId, startDate, endDate, description, videoBrief, requirements, hashtags, prizes } = parseResult.data;

  const defaultPrizes = prizes || {
    first: {
      position: 1,
      title: '1º Puesto — Oro',
      badge: '🥇 Ganador Absoluto',
      cashPEN: 1500,
      perks: ['S/ 1,500 en efectivo directo', 'Trofeo Oficial de Oro LibertadGO', 'Difusión destacada'],
    },
    second: {
      position: 2,
      title: '2º Puesto — Plata',
      badge: '🥈 Segundo Lugar',
      cashPEN: 800,
      perks: ['S/ 800 en efectivo', 'Experiencia gastronómica para 2 en el local', 'Certificado oficial'],
    },
    third: {
      position: 3,
      title: '3º Puesto — Bronce',
      badge: '🥉 Tercer Lugar',
      cashPEN: 400,
      perks: ['S/ 400 en efectivo', 'Canasta con productos regionales de La Libertad'],
    },
  };

  const newCampaign = catalogRepository.createCampaign({
    title,
    businessName,
    placeId: placeId || 'place_custom',
    localityId: localityId || 'trujillo',
    startDate,
    endDate,
    description: description || 'Campaña de video para creadores de contenido.',
    videoBrief: videoBrief || 'Video vertical de 30 a 60 segundos sobre la experiencia en nuestro local.',
    requirements: Array.isArray(requirements) ? requirements : ['Video vertical 9:16', 'Mención del local y #LibertadGO'],
    hashtags: Array.isArray(hashtags) ? hashtags : ['#LibertadGO', '#TurismoLaLibertad'],
    prizes: defaultPrizes,
    status: 'active',
  });

  res.status(201).json({ success: true, data: newCampaign });
});

// POST /api/campaigns/:id/submissions
apiRouter.post('/campaigns/:id/submissions', requireAuth, submissionRateLimiter, (req: Request, res: Response) => {
  const parseResult = CreateSubmissionSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e: { message: string }) => e.message).join(', ');
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }

  const { creatorName, creatorHandle, platform, videoUrl, title, caption, thumbnailUrl } = parseResult.data;

  const result = catalogRepository.addSubmission(req.params.id, {
    creatorName,
    creatorHandle: creatorHandle || '@creador',
    platform: platform || 'tiktok',
    videoUrl,
    title,
    caption: caption || '',
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  });

  if (result.error || !result.submission) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }

  res.status(201).json({ success: true, data: result.submission });
});

// POST /api/campaigns/:id/submissions/:subId/vote
apiRouter.post('/campaigns/:id/submissions/:subId/vote', requireAuth, voteRateLimiter, (req: Request, res: Response) => {
  const result = catalogRepository.voteSubmission(req.params.id, req.params.subId, req.user?.userId);
  if (!result.success) {
    res.status(result.duplicate ? 409 : 400).json({ success: false, error: result.error });
    return;
  }
  res.json({ success: true, newVotes: result.newVotes });
});

// =========================================================================
// ASISTENTE DE IA LIBERTADGO — 10 MENSAJES GRATIS CON GEMINI 3.8 FLASH
// =========================================================================

// POST /api/ai/chat
apiRouter.post('/ai/chat', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = AiChatSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((e: { message: string }) => e.message).join(', ');
      res.status(400).json({ success: false, error: errorMsg });
      return;
    }

    const creditCheck = aiCreditTracker.consumeCredit(req);
    if (!creditCheck.allowed) {
      res.status(429).json({
        success: false,
        error: 'Has alcanzado el límite diario de 10 consultas gratuitas al asistente IA.',
        creditsRemaining: 0,
        freeCreditsCap: AI_FREE_CREDITS_CAP,
      });
      return;
    }

    const { message, context } = parseResult.data;

    // Dynamic import to avoid cold start issues
    const { generateAiResponse } = await import('./geminiService.ts');
    const result = await generateAiResponse({
      prompt: message,
      context,
    });

    res.json({
      success: true,
      reply: result.reply,
      modelUsed: result.modelUsed,
      source: result.source,
      creditsRemaining: creditCheck.creditsRemaining,
      freeCreditsCap: AI_FREE_CREDITS_CAP,
    });
  } catch (error) {
    console.error('[API /api/ai/chat Error]', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar consulta con el asistente de IA.',
    });
  }
});

