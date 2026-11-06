import test from 'node:test';
import assert from 'node:assert/strict';
import { isWithinLaLibertad, validateLocalityId, getLocality, searchLocalities } from './geoBoundary.ts';

test('isWithinLaLibertad accepts coordinates inside Trujillo and Huanchaco', () => {
  // Trujillo Plaza Mayor
  assert.equal(isWithinLaLibertad({ lat: -8.1118, lng: -79.0287 }), true);
  // Huanchaco Beach
  assert.equal(isWithinLaLibertad({ lat: -8.0779, lng: -79.1197 }), true);
  // Marcahuamachuco
  assert.equal(isWithinLaLibertad({ lat: -7.8142, lng: -78.0494 }), true);
});

test('isWithinLaLibertad rejects coordinates outside La Libertad (Lima, Cusco, Piura, Paris)', () => {
  // Lima Plaza Mayor (-12.0464, -77.0428)
  assert.equal(isWithinLaLibertad({ lat: -12.0464, lng: -77.0428 }), false);
  // Cusco (-13.5319, -71.9675)
  assert.equal(isWithinLaLibertad({ lat: -13.5319, lng: -71.9675 }), false);
  // Piura (-5.1945, -80.6328)
  assert.equal(isWithinLaLibertad({ lat: -5.1945, lng: -80.6328 }), false);
  // Paris (48.8566, 2.3522)
  assert.equal(isWithinLaLibertad({ lat: 48.8566, lng: 2.3522 }), false);
});

test('validateLocalityId correctly validates the 10 authorized catalog localities', () => {
  assert.equal(validateLocalityId('trujillo'), true);
  assert.equal(validateLocalityId('huanchaco'), true);
  assert.equal(validateLocalityId('moche'), true);
  assert.equal(validateLocalityId('victor-larco'), true);
  assert.equal(validateLocalityId('la-esperanza'), true);
  assert.equal(validateLocalityId('magdalena-cao'), true);
  assert.equal(validateLocalityId('pacasmayo'), true);
  assert.equal(validateLocalityId('huamachuco'), true);
  assert.equal(validateLocalityId('cascas'), true);
  assert.equal(validateLocalityId('puerto-malabrigo'), true);

  // Rejects other regions/cities
  assert.equal(validateLocalityId('lima'), false);
  assert.equal(validateLocalityId('chiclayo'), false);
  assert.equal(validateLocalityId('arequipa'), false);
});

test('searchLocalities finds matching localities by text and prioritizes top 4', () => {
  const matches = searchLocalities('surf');
  assert.ok(matches.some((m) => m.id === 'huanchaco'));
  assert.ok(matches.some((m) => m.id === 'puerto-malabrigo'));

  const emptySearch = searchLocalities('');
  assert.equal(emptySearch.length, 10);
  assert.equal(emptySearch[0].isPriority, true);
});
