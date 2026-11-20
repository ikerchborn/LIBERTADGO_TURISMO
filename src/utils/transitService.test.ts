import test from 'node:test';
import assert from 'node:assert/strict';
import type { Place } from '../types/catalog.ts';
import {
  calculateTaxiEstimate,
  estimateTransitCostMinutes,
  getTransitAlternatives,
  getTransitBetweenPlaces,
  isTransitWalkOverLimit,
  MAX_TRANSIT_WALK_METERS,
  resolveTransitBetweenPlaces,
  sanitizeStopName,
} from './transitService.ts';
import { getCatalogRoute, getZone } from './transitCatalog.ts';

function makePlace(
  id: string,
  name: string,
  lat: number,
  lng: number,
  localityId = 'trujillo',
  address = ''
): Place {
  return {
    id,
    slug: id,
    name,
    category: 'atractivos',
    localityId,
    localityName: localityId,
    address,
    coordinates: { lat, lng },
    geohash: 'test',
    shortDescription: 'Lugar de prueba',
    images: [],
    verification: {
      isVerified: true,
      verificationLevel: 'official_mincetur',
    },
    sources: [],
    tags: [],
  };
}

test('urban transit walking access limit enforces exact 800m boundary', () => {
  assert.equal(MAX_TRANSIT_WALK_METERS, 800);
  assert.equal(isTransitWalkOverLimit(799), false);
  assert.equal(isTransitWalkOverLimit(800), false);
  assert.equal(isTransitWalkOverLimit(801), true);
});

test('calculateTaxiEstimate computes tiered Trujillo taxi fares', () => {
  assert.deepEqual(calculateTaxiEstimate(2.0), {
    fareMin: 6,
    fareMax: 8,
    fareAvg: 7,
    estimatedMinutes: 5,
  });
  assert.deepEqual(calculateTaxiEstimate(3.0), {
    fareMin: 8,
    fareMax: 12,
    fareAvg: 10,
    estimatedMinutes: 6,
  });
  const longRide = calculateTaxiEstimate(20.0);
  assert.ok(longRide.fareMin >= 32 && longRide.fareMax > longRide.fareMin);
});

test('sanitizeStopName replaces inventory-only labels with readable fallback', () => {
  assert.equal(
    sanitizeStopName('Nodo 12', [-79.02, -8.11], 'Av. España'),
    'Av. España'
  );
  assert.equal(
    sanitizeStopName('OSM-99412', [-79.02, -8.11]),
    'Paradero sugerido'
  );
  assert.equal(
    sanitizeStopName('Óvalo Mansiche', [-79.04, -8.10]),
    'Óvalo Mansiche'
  );
});

test('getZone classifies LIBERTADGO places into regional transit zones', () => {
  assert.equal(
    getZone(makePlace('1', 'Plaza de Armas', -8.1118, -79.0287, 'trujillo')),
    'centro'
  );
  assert.equal(
    getZone(makePlace('2', 'Muelle de Huanchaco', -8.0779, -79.1197, 'huanchaco')),
    'huanchaco'
  );
  assert.equal(
    getZone(makePlace('3', 'Complejo Chan Chan', -8.1099, -79.0745, 'trujillo')),
    'chan_chan'
  );
  assert.equal(
    getZone(makePlace('4', 'Huacas de Moche', -8.1336, -78.9909, 'moche')),
    'moche'
  );
  assert.equal(
    getZone(makePlace('5', 'Complejo El Brujo', -7.9158, -79.3039, 'magdalena-cao')),
    'el_brujo'
  );
  assert.equal(
    getZone(makePlace('6', 'Puerto Chicama', -7.6944, -79.4389, 'puerto-chicama')),
    'chicama'
  );
  assert.equal(
    getZone(makePlace('7', 'Marcahuamachuco', -7.8152, -78.0501, 'huamachuco')),
    'huamachuco'
  );
});

test('getCatalogRoute resolves multi-leg El Brujo route and offers taxi alternative', () => {
  const origin = makePlace('1', 'Plaza de Armas', -8.1118, -79.0287, 'trujillo');
  const destination = makePlace('5', 'Complejo El Brujo', -7.9158, -79.3039, 'magdalena-cao');

  const route = getCatalogRoute('centro', 'el_brujo');
  assert.ok(route !== null);
  assert.equal(route.code, 'RUTA-EL-BRUJO');
  assert.ok(Array.isArray(route.routeLegs) && route.routeLegs.length === 3);

  const reverseRoute = getCatalogRoute('el_brujo', 'centro');
  assert.ok(reverseRoute !== null);
  assert.equal(reverseRoute.routeLegs?.length, 3);

  const alternatives = getTransitAlternatives(origin, destination, route);
  assert.equal(alternatives.length, 2);
  assert.equal(alternatives[0].id, 'transit');
  assert.equal(alternatives[1].id, 'direct-taxi');
});

test('getTransitBetweenPlaces handles short walks and Chan Chan internal walks', () => {
  const origin = makePlace('1', 'Origen', -8.111, -79.03);
  const nearDest = makePlace('2', 'Destino Cercano', -8.112, -79.03);
  const shortTransit = getTransitBetweenPlaces(origin, nearDest);

  assert.equal(shortTransit.vehicleType, 'caminata');
  assert.equal(shortTransit.farePen, 0);
  assert.equal(
    estimateTransitCostMinutes(origin, nearDest, 2.5, 15, shortTransit),
    shortTransit.estimatedMinutes
  );

  const chanChanMain = makePlace('3', 'Palacio Nik An (Chan Chan)', -8.1099, -79.0745, 'trujillo');
  const chanChanMuseum = makePlace('415', 'Museo de Sitio Chan Chan', -8.105, -79.069, 'trujillo');
  const internalWalk = getTransitBetweenPlaces(chanChanMain, chanChanMuseum);
  assert.equal(internalWalk.code, 'WALK-INTERNAL');
  assert.equal(internalWalk.vehicleType, 'caminata');
});

test('resolveTransitBetweenPlaces resolves OSRM walking route for short distances', async () => {
  const origin = makePlace('1', 'Origen', -8.111, -79.03);
  const destination = makePlace('2', 'Destino', -8.112, -79.03);
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    ({
      ok: true,
      json: async () => ({
        routes: [
          {
            geometry: {
              coordinates: [
                [-79.03, -8.111],
                [-79.0301, -8.1115],
                [-79.03, -8.112],
              ],
            },
            distance: 180,
            duration: 150,
          },
        ],
      }),
    }) as Response) as typeof fetch;

  try {
    const resolved = await resolveTransitBetweenPlaces(origin, destination);
    assert.equal(resolved.vehicleType, 'caminata');
    assert.equal(resolved.farePen, 0);
    assert.equal(resolved.routeGeometryVerified, true);
    assert.deepEqual(resolved.routeGeometry, [
      [-8.111, -79.03],
      [-8.1115, -79.0301],
      [-8.112, -79.03],
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolveTransitBetweenPlaces resolves a real Truxdi micro/combi route in Trujillo', async () => {
  const plazaArmas = makePlace('p1', 'Plaza de Armas de Trujillo', -8.1118, -79.0287, 'trujillo');
  const ovaloMansiche = makePlace('p2', 'Óvalo Mansiche', -8.1028, -79.0448, 'trujillo');
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    ({
      ok: true,
      json: async () => ({
        routes: [
          {
            geometry: {
              coordinates: [
                [-79.0287, -8.1118],
                [-79.029, -8.1119],
              ],
            },
            distance: 120,
            duration: 95,
          },
        ],
      }),
    }) as Response) as typeof fetch;

  try {
    const resolved = await resolveTransitBetweenPlaces(plazaArmas, ovaloMansiche);
    assert.ok(
      resolved.vehicleType === 'micro' || resolved.vehicleType === 'combi',
      `Expected micro or combi, got ${resolved.vehicleType}`
    );
    assert.ok(resolved.farePen > 0);
    assert.ok(resolved.routeGeometry && resolved.routeGeometry.length >= 2);
    assert.ok(resolved.boardingStop.length > 0 && resolved.dropoffStop.length > 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('getZone uses authoritative localityId and avoids false coordinate/keyword matches', () => {
  assert.equal(
    getZone(makePlace('c1', 'Bodega Don Juan Cascas', -7.4815, -78.8155, 'cascas')),
    'cascas'
  );
  assert.equal(
    getZone(makePlace('v1', 'Paseo de las Aguas', -8.1382, -79.0465, 'victor-larco')),
    'centro'
  );
  assert.equal(
    getZone(makePlace('v2', 'Hotel Chicama', -8.1228, -79.0427, 'victor-larco')),
    'centro'
  );
  assert.equal(
    getZone(makePlace('t1', 'Moche - Cafés Especiales', -8.1149, -79.0306, 'trujillo')),
    'centro'
  );
  assert.equal(
    getZone(makePlace('m1', 'Surf School Chicama - El Point', -7.8485, -79.4435, 'puerto-malabrigo')),
    'chicama'
  );
});

test('resolveTransitBetweenPlaces preserves cross-zone micro/bus corridors and Cascas bus', async () => {
  const plaza = makePlace('plaza', 'Plaza Mayor de Trujillo', -8.1118, -79.0287, 'trujillo');
  const chanChan = makePlace('cc', 'Complejo Arqueológico Chan Chan', -8.1099, -79.0745, 'trujillo');
  const cascas = makePlace('ca', 'Cascada El Chorro', -7.4725, -78.8085, 'cascas');
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    ({
      ok: false,
      status: 503,
    }) as Response) as typeof fetch;

  try {
    const toChanChan = await resolveTransitBetweenPlaces(plaza, chanChan);
    assert.equal(toChanChan.vehicleType, 'micro');
    assert.equal(toChanChan.code, 'M-04 A');

    const toCascas = await resolveTransitBetweenPlaces(plaza, cascas);
    assert.equal(toCascas.vehicleType, 'bus');
    assert.equal(toCascas.code, 'INTER-CASCAS');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
