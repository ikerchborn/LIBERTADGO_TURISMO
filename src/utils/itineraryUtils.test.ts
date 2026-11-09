import test from 'node:test';
import assert from 'node:assert/strict';
import { Place, TripActivity } from '../types/catalog.ts';
import {
  addPlaceToDay,
  removeActivityAndReindex,
  reorderDayActivities,
  moveActivityToDayAndIndex,
  getActivitiesForDay,
  getDayColor,
} from './itineraryUtils.ts';

const mockPlace1: Place = {
  id: 'place_huanchaco',
  slug: 'huanchaco',
  name: 'Playa Huanchaco',
  category: 'playas',
  localityId: 'huanchaco',
  localityName: 'Huanchaco',
  address: 'Malecón de Huanchaco',
  coordinates: { lat: -8.0772, lng: -79.1192 },
  geohash: '6mre54',
  shortDescription: 'Cuna de los caballitos de totora y surf ancestral.',
  images: [{ id: 'img1', url: 'https://example.com/huanchaco.jpg', isCover: true }],
  verification: { isVerified: true, verificationLevel: 'official_mincetur' },
  sources: [],
  tags: ['playa', 'surf'],
};

const mockPlace2: Place = {
  id: 'place_chanchan',
  slug: 'chan-chan',
  name: 'Chan Chan - Palacio Nik An',
  category: 'arqueologia',
  localityId: 'huanchaco',
  localityName: 'Huanchaco',
  address: 'Carretera a Huanchaco Km 5',
  coordinates: { lat: -8.1094, lng: -79.0744 },
  geohash: '6mre47',
  shortDescription: 'Ciudadela de barro prehispánica más grande de América.',
  images: [{ id: 'img2', url: 'https://example.com/chanchan.jpg', isCover: true }],
  verification: { isVerified: true, verificationLevel: 'official_mincetur' },
  sources: [],
  tags: ['arqueologia', 'chimu'],
};

const mockPlace3: Place = {
  id: 'place_romano',
  slug: 'romano-criollo',
  name: 'Restaurant Romano Criollo',
  category: 'restaurantes',
  localityId: 'trujillo',
  localityName: 'Trujillo',
  address: 'Jr. Pizarro 747, Trujillo',
  coordinates: { lat: -8.1102, lng: -79.0275 },
  geohash: '6mre6b',
  shortDescription: 'Tradición gastronómica trujillana desde 1932.',
  images: [{ id: 'img3', url: 'https://example.com/romano.jpg', isCover: true }],
  verification: { isVerified: true, verificationLevel: 'community' },
  sources: [],
  tags: ['comida-criolla'],
};

test('addPlaceToDay adds activity with correct sequential order', () => {
  const tripId = 'trip_123';
  const initialActivities: TripActivity[] = [];

  const res1 = addPlaceToDay(initialActivities, tripId, mockPlace1, 1);
  assert.equal(res1.added, true);
  assert.equal(res1.activities.length, 1);
  assert.equal(res1.activities[0].order, 1);
  assert.equal(res1.activities[0].dayNumber, 1);
  assert.equal(res1.activities[0].placeId, 'place_huanchaco');

  const res2 = addPlaceToDay(res1.activities, tripId, mockPlace2, 1);
  assert.equal(res2.added, true);
  assert.equal(res2.activities.length, 2);
  assert.equal(res2.activities[1].order, 2);
  assert.equal(res2.activities[1].placeId, 'place_chanchan');
});

test('addPlaceToDay prevents duplicate place in the same day', () => {
  const tripId = 'trip_123';
  const res1 = addPlaceToDay([], tripId, mockPlace1, 1);
  assert.equal(res1.added, true);

  // Attempt to add mockPlace1 again to Day 1
  const res2 = addPlaceToDay(res1.activities, tripId, mockPlace1, 1);
  assert.equal(res2.added, false);
  assert.equal(res2.activities.length, 1);
});

test('addPlaceToDay allows the same place in DIFFERENT days', () => {
  const tripId = 'trip_123';
  const res1 = addPlaceToDay([], tripId, mockPlace1, 1);
  assert.equal(res1.added, true);

  // Add mockPlace1 to Day 2
  const res2 = addPlaceToDay(res1.activities, tripId, mockPlace1, 2);
  assert.equal(res2.added, true);
  assert.equal(res2.activities.length, 2);
  assert.equal(res2.activities[0].dayNumber, 1);
  assert.equal(res2.activities[1].dayNumber, 2);
});

test('removeActivityAndReindex removes only target activity and reindexes remaining', () => {
  const tripId = 'trip_123';
  let acts: TripActivity[] = [];
  acts = addPlaceToDay(acts, tripId, mockPlace1, 1).activities; // order 1
  acts = addPlaceToDay(acts, tripId, mockPlace2, 1).activities; // order 2
  acts = addPlaceToDay(acts, tripId, mockPlace3, 1).activities; // order 3
  acts = addPlaceToDay(acts, tripId, mockPlace1, 2).activities; // Day 2, order 1

  const idToRemove = acts[0].id; // remove order 1 from Day 1
  const updated = removeActivityAndReindex(acts, idToRemove);

  // Day 1 now has 2 activities, reindexed 1 and 2
  const day1Acts = getActivitiesForDay(updated, 1);
  assert.equal(day1Acts.length, 2);
  assert.equal(day1Acts[0].placeId, 'place_chanchan');
  assert.equal(day1Acts[0].order, 1);
  assert.equal(day1Acts[1].placeId, 'place_romano');
  assert.equal(day1Acts[1].order, 2);

  // Day 2 activity is completely unaffected
  const day2Acts = getActivitiesForDay(updated, 2);
  assert.equal(day2Acts.length, 1);
  assert.equal(day2Acts[0].placeId, 'place_huanchaco');
  assert.equal(day2Acts[0].order, 1);
});

test('reorderDayActivities updates order strictly to 1, 2, 3...', () => {
  const tripId = 'trip_123';
  let acts: TripActivity[] = [];
  acts = addPlaceToDay(acts, tripId, mockPlace1, 1).activities; // id A
  acts = addPlaceToDay(acts, tripId, mockPlace2, 1).activities; // id B
  acts = addPlaceToDay(acts, tripId, mockPlace3, 1).activities; // id C

  const [actA, actB, actC] = acts;

  // New order: C, A, B
  const reordered = reorderDayActivities(acts, 1, [actC.id, actA.id, actB.id]);
  const sorted = getActivitiesForDay(reordered, 1);

  assert.equal(sorted[0].id, actC.id);
  assert.equal(sorted[0].order, 1);
  assert.equal(sorted[1].id, actA.id);
  assert.equal(sorted[1].order, 2);
  assert.equal(sorted[2].id, actB.id);
  assert.equal(sorted[2].order, 3);
});

test('moveActivityToDayAndIndex moves activity to another day at specific position', () => {
  const tripId = 'trip_123';
  let acts: TripActivity[] = [];
  acts = addPlaceToDay(acts, tripId, mockPlace1, 1).activities; // Day 1: A (order 1)
  acts = addPlaceToDay(acts, tripId, mockPlace2, 1).activities; // Day 1: B (order 2)
  acts = addPlaceToDay(acts, tripId, mockPlace3, 2).activities; // Day 2: C (order 1)

  const actB = acts[1]; // move B to Day 2 at position 0 (before C)
  const moved = moveActivityToDayAndIndex(acts, actB.id, 2, 0);

  // Day 1 has only A left, order 1
  const day1Acts = getActivitiesForDay(moved, 1);
  assert.equal(day1Acts.length, 1);
  assert.equal(day1Acts[0].placeId, 'place_huanchaco');
  assert.equal(day1Acts[0].order, 1);

  // Day 2 has B (order 1) and C (order 2)
  const day2Acts = getActivitiesForDay(moved, 2);
  assert.equal(day2Acts.length, 2);
  assert.equal(day2Acts[0].placeId, 'place_chanchan');
  assert.equal(day2Acts[0].order, 1);
  assert.equal(day2Acts[1].placeId, 'place_romano');
  assert.equal(day2Acts[1].order, 2);
});

test('getDayColor returns consistent colors for distinct days', () => {
  const day1Color = getDayColor(1);
  const day2Color = getDayColor(2);
  const day3Color = getDayColor(3);

  assert.notEqual(day1Color.bg, day2Color.bg);
  assert.notEqual(day2Color.bg, day3Color.bg);
  assert.equal(day1Color.bg, '#E85B49'); // Coral
});
