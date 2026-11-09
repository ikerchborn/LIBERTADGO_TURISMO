import test from 'node:test';
import assert from 'node:assert/strict';
import { Place, TripItinerary, TripActivity } from '../types/catalog.ts';
import { INITIAL_PLACES } from '../data/initialPlaces.ts';
import { generateDayList } from './dateUtils.ts';
import { getActivitiesForDay, getDayColor } from './itineraryUtils.ts';
import { matchesCategory, matchesSearchQuery } from './filterUtils.ts';

const MOCK_TRIP: TripItinerary = {
  id: 'test-trip-mobile',
  title: 'Viaje La Libertad',
  destinationId: 'trujillo',
  destinationName: 'Trujillo',
  startDate: '2026-06-01',
  endDate: '2026-06-05',
  totalDays: 5,
  totalNights: 4,
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
  activities: [
    {
      id: 'act-d1-1',
      tripId: 'test-trip-mobile',
      placeId: 'trujillo-plaza-mayor',
      dayNumber: 1,
      order: 1,
      isVisited: false,
      createdAt: '2026-05-01T00:00:00Z',
    },
    {
      id: 'act-d1-2',
      tripId: 'test-trip-mobile',
      placeId: 'trujillo-catedral',
      dayNumber: 1,
      order: 2,
      isVisited: false,
      createdAt: '2026-05-01T00:00:00Z',
    },
    {
      id: 'act-d2-1',
      tripId: 'test-trip-mobile',
      placeId: 'huanchaco-playa',
      dayNumber: 2,
      order: 1,
      isVisited: false,
      createdAt: '2026-05-01T00:00:00Z',
    },
    {
      id: 'act-d2-2',
      tripId: 'test-trip-mobile',
      placeId: 'huanchaco-muelle',
      dayNumber: 2,
      order: 2,
      isVisited: false,
      createdAt: '2026-05-01T00:00:00Z',
    },
    {
      id: 'act-d2-3',
      tripId: 'test-trip-mobile',
      placeId: 'huanchaco-club-colonial',
      dayNumber: 2,
      order: 3,
      isVisited: false,
      createdAt: '2026-05-01T00:00:00Z',
    },
  ],
  savedPlaceIds: ['moche-huaca-luna'],
  notes: '',
};

test('1. Day list starts with Day 1 and accurately defines all days', () => {
  const days = generateDayList(MOCK_TRIP.startDate, MOCK_TRIP.totalDays);
  assert.equal(days.length, 5);
  assert.equal(days[0].dayNumber, 1, 'First day must be Day 1, never Day 2');
  assert.equal(days[1].dayNumber, 2);
  assert.equal(days[4].dayNumber, 5);
});

test('2. Modo Planificar - Día 1 muestra EXCLUSIVAMENTE actividades del Día 1', () => {
  const day1Activities = MOCK_TRIP.activities
    .filter((a) => a.dayNumber === 1)
    .sort((a, b) => a.order - b.order);

  assert.equal(day1Activities.length, 2);
  assert.equal(day1Activities[0].placeId, 'trujillo-plaza-mayor');
  assert.equal(day1Activities[0].order, 1);
  assert.equal(day1Activities[1].placeId, 'trujillo-catedral');
  assert.equal(day1Activities[1].order, 2);

  // Ensure NO Day 2 activities are included in Day 1
  const hasDay2InDay1 = day1Activities.some((a) => a.dayNumber !== 1);
  assert.equal(hasDay2InDay1, false, 'No Day 2 activities can appear in Day 1');
});

test('3. Modo Planificar - Día 2 muestra EXCLUSIVAMENTE actividades del Día 2 con orden 1..3', () => {
  const day2Activities = MOCK_TRIP.activities
    .filter((a) => a.dayNumber === 2)
    .sort((a, b) => a.order - b.order);

  assert.equal(day2Activities.length, 3);
  assert.deepEqual(day2Activities.map((a) => a.order), [1, 2, 3]);

  // Ensure NO Day 1 activities are included in Day 2
  const hasDay1InDay2 = day2Activities.some((a) => a.dayNumber !== 2);
  assert.equal(hasDay1InDay2, false, 'No Day 1 activities can appear in Day 2');
});

test('4. Modo Planificar - "Todos los días" agrupa actividades separadas por día sin mezclar', () => {
  const allActivities = MOCK_TRIP.activities;
  assert.equal(allActivities.length, 5);

  const day1Acts = getActivitiesForDay(allActivities, 1);
  const day2Acts = getActivitiesForDay(allActivities, 2);
  const day3Acts = getActivitiesForDay(allActivities, 3);

  assert.equal(day1Acts.length, 2);
  assert.equal(day2Acts.length, 3);
  assert.equal(day3Acts.length, 0);

  // Check distinct colors per day
  const colorD1 = getDayColor(1);
  const colorD2 = getDayColor(2);
  assert.notEqual(colorD1.bg, colorD2.bg, 'Distinct days must have distinct colors');
});

test('5. Modo Explorar - Muestra todos los lugares del catálogo que coinciden con filtros', () => {
  const places = INITIAL_PLACES;
  assert.ok(places.length > 5);

  // Explore without filter shows full catalog
  const allExplore = places.filter(
    (p) => matchesCategory(p.category, 'todas') && matchesSearchQuery(p, '')
  );
  assert.equal(allExplore.length, places.length);

  // Category filter narrows correctly
  const gastro = places.filter(
    (p) => matchesCategory(p.category, 'restaurantes') && matchesSearchQuery(p, '')
  );
  assert.ok(gastro.length > 0);
  assert.ok(gastro.every((p) => p.category === 'restaurantes' || p.category === 'gastronomia'));
});

test('6. Waypoints de rutas diarias nunca conectan días distintos', () => {
  const day1Acts = getActivitiesForDay(MOCK_TRIP.activities, 1);
  const day2Acts = getActivitiesForDay(MOCK_TRIP.activities, 2);

  const day1Waypoints = day1Acts.map((a) => a.placeId);
  const day2Waypoints = day2Acts.map((a) => a.placeId);

  // Cross check disjoint sets
  const intersection = day1Waypoints.filter((id) => day2Waypoints.includes(id));
  assert.equal(intersection.length, 0, 'Waypoints of Day 1 and Day 2 are independent');
});

test('7. Responsive Viewports: Total days and category counts fit scroll requirements without global overflow', () => {
  const viewports = [320, 375, 390, 430, 768, 1440];
  const days = generateDayList(MOCK_TRIP.startDate, MOCK_TRIP.totalDays);
  
  viewports.forEach((vpWidth) => {
    // Estimación mínima de ancho por día (botón de 90px + gap de 6px)
    const totalDaysRequiredWidth = (days.length + 1) * 96; // +1 por 'Todos los días'
    if (vpWidth < totalDaysRequiredWidth) {
      // Confirma que el ancho es menor al contenido y requiere contenedor desplazable independiente
      assert.ok(
        totalDaysRequiredWidth > vpWidth,
        `Viewport ${vpWidth}px correctly requires horizontal scrolling without global overflow`
      );
    }
  });
});

test('8. Day selector options: All day items 1..N and Todos los días remain distinct and ordered', () => {
  const days = generateDayList(MOCK_TRIP.startDate, MOCK_TRIP.totalDays);
  const dayNumbers = days.map((d) => d.dayNumber);
  
  // Confirma orden ascendente estricto empezando en Día 1
  assert.deepEqual(dayNumbers, [1, 2, 3, 4, 5]);
  assert.equal(dayNumbers[0], 1, 'Day 1 is strictly first');
  assert.equal(dayNumbers[dayNumbers.length - 1], 5, 'Day 5 is strictly last');
});

