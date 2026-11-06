import { Router, Request, Response } from 'express';
import { catalogRepository } from './repository.ts';
import { CreateTripSchema } from './schemas.ts';

export const apiRouter = Router();

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

// GET /api/places
apiRouter.get('/places', (req: Request, res: Response) => {
  const { localityId, category } = req.query;
  const places = catalogRepository.getPlaces({
    localityId: typeof localityId === 'string' ? localityId : undefined,
    category: typeof category === 'string' ? category : undefined,
  });

  res.json({
    success: true,
    data: places,
    total: places.length,
    regionConstraint: 'La Libertad',
  });
});

// GET /api/places/search
apiRouter.get('/places/search', (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const localityId = typeof req.query.localityId === 'string' ? req.query.localityId : undefined;

  const places = catalogRepository.searchPlaces(q, localityId);
  res.json({
    success: true,
    data: places,
    total: places.length,
  });
});

// GET /api/places/:id
apiRouter.get('/places/:id', (req: Request, res: Response) => {
  const place = catalogRepository.getPlaceById(req.params.id);
  if (!place) {
    res.status(404).json({ success: false, error: 'Lugar no encontrado en el catálogo de La Libertad' });
    return;
  }
  res.json({ success: true, data: place });
});

// POST /api/itineraries
apiRouter.post('/itineraries', (req: Request, res: Response) => {
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
apiRouter.post('/itineraries/:id/activities', (req: Request, res: Response) => {
  const { placeId, dayNumber, timeSlot, notes } = req.body;
  if (!placeId || typeof dayNumber !== 'number') {
    res.status(400).json({ success: false, error: 'placeId y dayNumber son obligatorios' });
    return;
  }

  const result = catalogRepository.addActivity(req.params.id, {
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
