import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDistance, formatDuration, calculateRealRoute } from './routingService.ts';

test('formatDistance formats meters and kilometers accurately', () => {
  assert.equal(formatDistance(450), '450 m');
  assert.equal(formatDistance(999), '999 m');
  assert.equal(formatDistance(1000), '1.0 km');
  assert.equal(formatDistance(14094), '14.1 km');
  assert.equal(formatDistance(25400), '25.4 km');
});

test('formatDuration formats minutes and hours properly in Spanish', () => {
  assert.equal(formatDuration(45), '1 min');
  assert.equal(formatDuration(1312), '22 min'); // ~21.8 mins -> 22 min
  assert.equal(formatDuration(3600), '1 h');
  assert.equal(formatDuration(4500), '1 h 15 min');
  assert.equal(formatDuration(7200), '2 h');
});

test('calculateRealRoute rejects fewer than 2 waypoints without drawing straight lines', async () => {
  const resultEmpty = await calculateRealRoute([]);
  assert.equal(resultEmpty, null, 'Empty waypoints return null');

  const resultSingle = await calculateRealRoute([[-79.0287, -8.1118]]);
  assert.equal(resultSingle, null, 'Single waypoint returns null (no fake lines)');
});
