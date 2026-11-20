/**
 * Geographic helpers and verified pedestrian route requests for transit access checks.
 * All coordinate tuples in this module follow `[lat, lng]` order.
 */

export interface WalkingRouteResult {
  /** `[lat, lng][]` */
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  isFallback: boolean;
  fallbackReason?: string;
}

/** Great-circle Haversine distance in kilometers between two `[lat, lng]` points. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Sums great-circle distances between consecutive `[lat, lng]` polyline points. */
export function getPolylineDistanceKm(coordinates: [number, number][]): number {
  let distance = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    distance += haversineKm(
      coordinates[index - 1][0],
      coordinates[index - 1][1],
      coordinates[index][0],
      coordinates[index][1]
    );
  }
  return distance;
}

const walkingRouteCache = new Map<string, Promise<WalkingRouteResult | null>>();

async function fetchWalkingRouteInternal(
  origin: [number, number],
  destination: [number, number]
): Promise<WalkingRouteResult | null> {
  if (
    !origin.every(Number.isFinite) ||
    !destination.every(Number.isFinite)
  ) {
    return null;
  }

  const coordsQuery = `${origin[1].toFixed(6)},${origin[0].toFixed(6)};${destination[1].toFixed(6)},${destination[0].toFixed(6)}`;

  // 1. Try local server proxy first (when running in browser / full-stack mode)
  if (typeof window !== 'undefined') {
    try {
      const proxyRes = await fetch(
        `/api/route?coordinates=${encodeURIComponent(coordsQuery)}&profile=walking`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) }
      );
      if (proxyRes.ok) {
        const json = await proxyRes.json();
        const coords = json?.route?.coordinates;
        if (json?.success && Array.isArray(coords) && coords.length >= 2) {
          return {
            coordinates: coords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]),
            distanceKm: (json.route.distanceMeters || 0) / 1000,
            durationMin: Math.max(1, Math.round((json.route.durationSeconds || 0) / 60)),
            isFallback: false,
          };
        }
      }
    } catch {
      // Fall back to direct public OSRM endpoint
    }
  }

  // 2. Direct public OSRM foot routing
  let fallbackReason = 'El servicio de rutas no devolvió una ruta vial válida.';
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${coordsQuery}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) {
      fallbackReason = `El servicio de rutas respondió con estado ${res.status}.`;
      throw new Error(fallbackReason);
    }
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route || !Array.isArray(route.geometry?.coordinates) || route.geometry.coordinates.length < 2) {
      throw new Error('No route in OSRM payload');
    }
    const validCoords = route.geometry.coordinates.every(
      (c: unknown) =>
        Array.isArray(c) &&
        c.length >= 2 &&
        Number.isFinite(c[0]) &&
        Number.isFinite(c[1])
    );
    if (!validCoords) {
      throw new Error('Invalid route geometry in OSRM payload');
    }

    return {
      coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
      distanceKm: (route.distance || 0) / 1000,
      durationMin: Math.max(1, Math.round((route.duration || 0) / 60)),
      isFallback: false,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      fallbackReason = 'El cálculo de calles excedió 4 segundos.';
    } else if (error instanceof Error && error.message !== fallbackReason) {
      fallbackReason = 'No se pudo validar la ruta peatonal sobre la red vial.';
    }
    const totalKm = haversineKm(origin[0], origin[1], destination[0], destination[1]);
    return {
      coordinates: [origin, destination],
      distanceKm: totalKm,
      durationMin: Math.max(1, Math.round((totalKm / 4.5) * 60)),
      isFallback: true,
      fallbackReason,
    };
  }
}

/**
 * Reuses in-flight/successful pedestrian requests; failed and approximate results are not cached.
 */
export function getWalkingRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<WalkingRouteResult | null> {
  const key = `${origin.join(',')}>${destination.join(',')}`;
  const cached = walkingRouteCache.get(key);
  if (cached) return cached;

  const route = fetchWalkingRouteInternal(origin, destination);
  walkingRouteCache.set(key, route);
  void route.then(
    (result) => {
      if (!result || result.isFallback) walkingRouteCache.delete(key);
    },
    () => {
      walkingRouteCache.delete(key);
    }
  );
  return route;
}
