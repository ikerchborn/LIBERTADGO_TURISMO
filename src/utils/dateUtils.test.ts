import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTripDuration, formatDateRange, generateDayList } from './dateUtils.ts';

test('calculateTripDuration computes days and nights for a standard 5-day trip', () => {
  const result = calculateTripDuration('2026-11-03', '2026-11-07');
  assert.equal(result.isValid, true);
  assert.equal(result.days, 5);
  assert.equal(result.nights, 4);
});

test('calculateTripDuration handles same-day single day trip (1 day, 0 nights)', () => {
  const result = calculateTripDuration('2026-11-03', '2026-11-03');
  assert.equal(result.isValid, true);
  assert.equal(result.days, 1);
  assert.equal(result.nights, 0);
});

test('calculateTripDuration rejects end dates before start dates', () => {
  const result = calculateTripDuration('2026-11-07', '2026-11-03');
  assert.equal(result.isValid, false);
  assert.match(result.error || '', /no puede ser anterior/);
});

test('calculateTripDuration rejects trips exceeding maximum limits', () => {
  const result = calculateTripDuration('2026-01-01', '2026-03-01');
  assert.equal(result.isValid, false);
  assert.match(result.error || '', /no puede exceder/);
});

test('formatDateRange formats dates cleanly in Spanish', () => {
  const formatted = formatDateRange('2026-11-03', '2026-11-07');
  assert.equal(formatted, '3 – 7 nov. 2026');
});

test('generateDayList generates correct day items and labels', () => {
  const days = generateDayList('2026-11-03', 3);
  assert.equal(days.length, 3);
  assert.equal(days[0].dayNumber, 1);
  assert.equal(days[0].dateString, '2026-11-03');
  assert.equal(days[1].dayNumber, 2);
  assert.equal(days[1].dateString, '2026-11-04');
  assert.equal(days[2].dayNumber, 3);
  assert.equal(days[2].dateString, '2026-11-05');
});
