/**
 * LibertadGO Real-World Routing Service (OSRM + OpenStreetMap)
 * Calculates real driving routes along streets, avenues and highways in La Libertad, Perú.
 * Strictly adheres to guidelines: Never draws straight lines as fake routes; never invents distances or times.
 */

export interface RouteData {
  coordinates: [number, number][]; // [[lng, lat], ...] road-following points
  distanceMeters: number;
  durationSeconds: number;
  distanceFormatted: string;
  durationFormatted: string;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${Math.max(1, minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainingMinutes} min`;
}

// In-memory cache for fast repeated views and offline resilience
const routeCache = new Map<string, RouteData | null>();

/**
 * Fetch real street-following route between ordered waypoints.
 * If routing fails or fewer than 2 valid waypoints, returns null (never fake straight lines).
 */
export async function calculateRealRoute(
  waypoints: [number, number][]
): Promise<RouteData | null> {
  if (!waypoints || waypoints.length < 2) {
    return null;
  }

  // Generate cache key
  const cacheKey = waypoints.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';');
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey) || null;
  }

  try {
    // 1. Try local server proxy endpoint first
    const proxyUrl = `/api/route?coordinates=${encodeURIComponent(cacheKey)}`;
    const proxyResponse = await fetch(proxyUrl, {
      headers: { Accept: 'application/json' },
    });

    if (proxyResponse.ok) {
      const json = await proxyResponse.json();
      if (json.success && json.route) {
        routeCache.set(cacheKey, json.route);
        return json.route;
      }
    }
  } catch {
    // Server proxy failed or network hiccup, fallback to direct public OSRM endpoint
  }

  try {
    // 2. Direct public OSRM API fallback (OpenStreetMap community routing)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${cacheKey}?overview=full&geometries=geojson`;
    const response = await fetch(osrmUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      routeCache.set(cacheKey, null);
      return null;
    }

    const data = await response.json();
    if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
      const bestRoute = data.routes[0];
      const geomCoords: [number, number][] = bestRoute.geometry?.coordinates || [];

      if (geomCoords.length >= 2) {
        const routeData: RouteData = {
          coordinates: geomCoords,
          distanceMeters: bestRoute.distance,
          durationSeconds: bestRoute.duration,
          distanceFormatted: formatDistance(bestRoute.distance),
          durationFormatted: formatDuration(bestRoute.duration),
        };
        routeCache.set(cacheKey, routeData);
        return routeData;
      }
    }
  } catch (err) {
    console.warn('[Routing Service] OSRM public routing could not be reached:', err);
  }

  routeCache.set(cacheKey, null);
  return null;
}
