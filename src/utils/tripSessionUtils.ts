import { TripItinerary } from '../types/catalog.ts';

export const STORAGE_TRIPS_KEY = 'libertadgo_trips_v2';
export const LEGACY_ACTIVE_ID_KEY = 'libertadgo_active_trip_id_v2';
export const LEGACY_DEFAULT_TRIP_ID = 'trip_default_riymo';

export type StorageReader = Pick<Storage, 'getItem'>;
export type StorageWriter = Pick<Storage, 'setItem' | 'removeItem'>;

/**
 * Always returns null on initialization/reload so RiyMo starts with an empty
 * trip workspace and never auto-loads a default, example, or last-used trip.
 */
export function getInitialActiveTrip(): TripItinerary | null {
  return null;
}

/**
 * Loads user-saved trips from storage while filtering out any legacy seeded
 * example trip (`trip_default_riymo`) or malformed entries.
 */
export function loadSavedTripsFromStorage(storage?: StorageReader | null): TripItinerary[] {
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_TRIPS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is TripItinerary => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<TripItinerary>;
      if (typeof candidate.id !== 'string' || !candidate.id.trim()) return false;
      if (candidate.id === LEGACY_DEFAULT_TRIP_ID) return false;
      if (typeof candidate.title !== 'string') return false;
      return true;
    });
  } catch {
    return [];
  }
}

/**
 * Persists user-saved trips without storing an active trip pointer for auto-restore.
 */
export function persistSavedTripsToStorage(
  storage: StorageWriter | null | undefined,
  trips: TripItinerary[]
): void {
  if (!storage) return;

  try {
    const cleanTrips = trips.filter((t) => t.id !== LEGACY_DEFAULT_TRIP_ID);
    if (cleanTrips.length > 0) {
      storage.setItem(STORAGE_TRIPS_KEY, JSON.stringify(cleanTrips));
    } else {
      storage.removeItem(STORAGE_TRIPS_KEY);
    }
    storage.removeItem(LEGACY_ACTIVE_ID_KEY);
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

/**
 * Clears any legacy active-trip pointer from storage so reloads never restore
 * a previously open trip.
 */
export function clearLegacyActiveTripStorage(storage?: Pick<Storage, 'removeItem'> | null): void {
  if (!storage) return;
  try {
    storage.removeItem(LEGACY_ACTIVE_ID_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Determines whether the active trip workspace must be cleared when auth state
 * transitions (e.g., logout, login, or switching user accounts).
 */
export function resolveSessionResetOnAuthChange(
  prevUserId: string | null | undefined,
  nextUserId: string | null,
  isAuthLoading: boolean
): { nextPrevUserId: string | null | undefined; shouldResetWorkspace: boolean } {
  if (isAuthLoading) {
    return { nextPrevUserId: prevUserId, shouldResetWorkspace: false };
  }

  // First resolution after initial mount: establish baseline without wiping user actions
  if (prevUserId === undefined) {
    return { nextPrevUserId: nextUserId, shouldResetWorkspace: false };
  }

  if (prevUserId !== nextUserId) {
    return { nextPrevUserId: nextUserId, shouldResetWorkspace: true };
  }

  return { nextPrevUserId: prevUserId, shouldResetWorkspace: false };
}
