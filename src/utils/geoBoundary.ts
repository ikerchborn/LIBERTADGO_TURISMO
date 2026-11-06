import { Coordinates, LA_LIBERTAD_BOUNDS, LA_LIBERTAD_LOCALITIES, Locality } from '../types/geo.ts';

/**
 * Checks if geographic coordinates are strictly inside the region of La Libertad, Perú.
 * This prevents any establishment or activity outside the region from being accepted or returned.
 */
export function isWithinLaLibertad(coords: Coordinates): boolean {
  if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return false;
  }
  if (isNaN(coords.lat) || isNaN(coords.lng)) {
    return false;
  }

  const { minLat, maxLat, minLng, maxLng } = LA_LIBERTAD_BOUNDS;

  return (
    coords.lat >= minLat &&
    coords.lat <= maxLat &&
    coords.lng >= minLng &&
    coords.lng <= maxLng
  );
}

/**
 * Validates whether a locality ID belongs to the authorized catalog of La Libertad.
 */
export function validateLocalityId(localityId: string): boolean {
  if (!localityId || typeof localityId !== 'string') return false;
  const normalized = localityId.trim().toLowerCase();
  return LA_LIBERTAD_LOCALITIES.some((loc) => loc.id === normalized);
}

/**
 * Retrieves a locality by its identifier.
 */
export function getLocality(localityId: string): Locality | undefined {
  if (!localityId) return undefined;
  const normalized = localityId.trim().toLowerCase();
  return LA_LIBERTAD_LOCALITIES.find((loc) => loc.id === normalized);
}

/**
 * Searches localities in La Libertad by name, province, or keywords.
 */
export function searchLocalities(query: string): Locality[] {
  if (!query || !query.trim()) {
    // Return all localities with priority ones first
    return [...LA_LIBERTAD_LOCALITIES].sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  const q = query.trim().toLowerCase();
  return LA_LIBERTAD_LOCALITIES.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.province.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q) ||
      loc.highlights.some((h) => h.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return 0;
  });
}
