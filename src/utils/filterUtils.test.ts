import { test } from 'node:test';
import assert from 'node:assert';
import { matchesCategory, matchesSearchQuery, filterCatalogPlaces } from './filterUtils.ts';
import { INITIAL_PLACES } from '../data/initialPlaces.ts';

test('matchesCategory matches "todas" for any category', () => {
  assert.strictEqual(matchesCategory('restaurantes', 'todas'), true);
  assert.strictEqual(matchesCategory('playas', 'todas'), true);
  assert.strictEqual(matchesCategory('arqueologia', 'todas'), true);
});

test('matchesCategory maps "restaurantes" and "gastronomia"', () => {
  assert.strictEqual(matchesCategory('restaurantes', 'restaurantes'), true);
  assert.strictEqual(matchesCategory('gastronomia', 'restaurantes'), true);
  assert.strictEqual(matchesCategory('playas', 'restaurantes'), false);
});

test('matchesCategory strictly matches other categories', () => {
  assert.strictEqual(matchesCategory('playas', 'playas'), true);
  assert.strictEqual(matchesCategory('hoteles', 'playas'), false);
  assert.strictEqual(matchesCategory('arqueologia', 'arqueologia'), true);
  assert.strictEqual(matchesCategory('museos', 'museos'), true);
  assert.strictEqual(matchesCategory('atractivos', 'atractivos'), true);
});

test('matchesSearchQuery finds places ignoring accents and case', () => {
  const chanChan = INITIAL_PLACES.find((p) => p.name.includes('Chan Chan'))!;
  assert.ok(chanChan);
  assert.strictEqual(matchesSearchQuery(chanChan, 'chan chan'), true);
  assert.strictEqual(matchesSearchQuery(chanChan, 'Chán Chán'), true);
  assert.strictEqual(matchesSearchQuery(chanChan, 'adobe'), true);
});

test('matchesSearchQuery filters properly with restaurant and search query', () => {
  const results = filterCatalogPlaces(INITIAL_PLACES, 'restaurantes', 'ceviche');
  assert.ok(results.length > 0);
  assert.ok(results.every((p) => p.category === 'restaurantes' || p.category === 'gastronomia'));
});

test('filterCatalogPlaces returns all places when category is todas and query is empty', () => {
  const all = filterCatalogPlaces(INITIAL_PLACES, 'todas', '');
  assert.strictEqual(all.length, INITIAL_PLACES.length);
});

test('filterCatalogPlaces with empty results returns empty array', () => {
  const empty = filterCatalogPlaces(INITIAL_PLACES, 'playas', 'inexistente-xyz-123');
  assert.strictEqual(empty.length, 0);
});
