import test from 'node:test';
import assert from 'node:assert/strict';
import { TripItinerary } from '../types/catalog.ts';
import {
  STORAGE_TRIPS_KEY,
  LEGACY_ACTIVE_ID_KEY,
  LEGACY_DEFAULT_TRIP_ID,
  getInitialActiveTrip,
  loadSavedTripsFromStorage,
  persistSavedTripsToStorage,
  clearLegacyActiveTripStorage,
  resolveSessionResetOnAuthChange,
} from './tripSessionUtils.ts';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    dump(): Record<string, string> {
      return Object.fromEntries(store.entries());
    },
  };
}

const sampleUserTrip: TripItinerary = {
  id: 'trip_user_123',
  title: 'Escapada a Huanchaco',
  destinationId: 'huanchaco',
  destinationName: 'Huanchaco',
  startDate: '2026-08-01',
  endDate: '2026-08-03',
  totalDays: 3,
  totalNights: 2,
  notes: '',
  savedPlaceIds: [],
  activities: [],
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-07-01T10:00:00.000Z',
};

const legacySeedTrip: TripItinerary = {
  ...sampleUserTrip,
  id: LEGACY_DEFAULT_TRIP_ID,
  title: 'Exploración La Libertad',
  destinationId: 'trujillo',
  destinationName: 'Trujillo',
};

test('Inicio vacío: siempre inicia sin viaje activo ni viaje de ejemplo', () => {
  const emptyStorage = createMemoryStorage();
  assert.equal(getInitialActiveTrip(), null);
  assert.deepEqual(loadSavedTripsFromStorage(emptyStorage), []);
});

test('Recarga de página: conserva viajes guardados del usuario pero no restaura viaje activo previo', () => {
  const storage = createMemoryStorage({
    [STORAGE_TRIPS_KEY]: JSON.stringify([sampleUserTrip, legacySeedTrip]),
    [LEGACY_ACTIVE_ID_KEY]: sampleUserTrip.id,
  });

  const activeOnReload = getInitialActiveTrip();
  const saved = loadSavedTripsFromStorage(storage);
  clearLegacyActiveTripStorage(storage);

  assert.equal(activeOnReload, null, 'No se debe restaurar automáticamente el último viaje activo');
  assert.equal(saved.length, 1, 'Solo se deben cargar viajes reales del usuario, sin el viaje de ejemplo');
  assert.equal(saved[0].id, sampleUserTrip.id);
  assert.equal(storage.getItem(LEGACY_ACTIVE_ID_KEY), null);
});

test('Persistencia: guardar viajes del usuario no escribe puntero de viaje activo automático', () => {
  const storage = createMemoryStorage({
    [LEGACY_ACTIVE_ID_KEY]: sampleUserTrip.id,
  });

  persistSavedTripsToStorage(storage, [sampleUserTrip]);

  assert.equal(storage.getItem(LEGACY_ACTIVE_ID_KEY), null);
  const reloaded = loadSavedTripsFromStorage(storage);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].title, 'Escapada a Huanchaco');

  persistSavedTripsToStorage(storage, []);
  assert.equal(storage.getItem(STORAGE_TRIPS_KEY), null);
});

test('Sesión: al cerrar sesión y volver a iniciar se reinicia el espacio de viaje a vacío', () => {
  // 1. Carga inicial mientras autentica
  const loadingStep = resolveSessionResetOnAuthChange(undefined, null, true);
  assert.equal(loadingStep.shouldResetWorkspace, false);

  // 2. Hidratación inicial autenticada: establece línea base sin interferir
  const initAuth = resolveSessionResetOnAuthChange(undefined, 'user_1', false);
  assert.equal(initAuth.nextPrevUserId, 'user_1');
  assert.equal(initAuth.shouldResetWorkspace, false);

  // 3. Misma sesión activa: no reinicia el viaje que el usuario está editando
  const sameSession = resolveSessionResetOnAuthChange('user_1', 'user_1', false);
  assert.equal(sameSession.shouldResetWorkspace, false);

  // 4. Cierre de sesión: debe limpiar currentTrip -> null
  const logoutStep = resolveSessionResetOnAuthChange('user_1', null, false);
  assert.equal(logoutStep.nextPrevUserId, null);
  assert.equal(logoutStep.shouldResetWorkspace, true);

  // 5. Nuevo inicio de sesión: debe iniciar con currentTrip -> null
  const loginStep = resolveSessionResetOnAuthChange(null, 'user_1', false);
  assert.equal(loginStep.nextPrevUserId, 'user_1');
  assert.equal(loginStep.shouldResetWorkspace, true);
});
