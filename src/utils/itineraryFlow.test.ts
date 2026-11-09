import test from 'node:test';
import assert from 'node:assert/strict';
import { Place, TripActivity, TripItinerary } from '../types/catalog.ts';
import { INITIAL_PLACES } from '../data/initialPlaces.ts';
import {
  addPlaceToDay,
  removeActivityAndReindex,
  reorderDayActivities,
  moveActivityToDayAndIndex,
  getActivitiesForDay,
  getDayColor,
} from './itineraryUtils.ts';

const placeA = INITIAL_PLACES[0]; // e.g. Huanchaco
const placeB = INITIAL_PLACES[1]; // e.g. Chan Chan
const placeC = INITIAL_PLACES[2]; // e.g. Huaca de la Luna

test('Pruebas Obligatorias Fase 3: 14 Casos de Itinerario y Gestión Diaria', () => {
  const tripId = 'trip_fase3_libertadgo';
  let activities: TripActivity[] = [];

  // 1 & 4. Setup initial trip with activities across days
  // Día 1: Place A, Place B
  activities = addPlaceToDay(activities, tripId, placeA, 1).activities;
  activities = addPlaceToDay(activities, tripId, placeB, 1).activities;
  // Día 2: Place C, Place A (assigned to Day 2 as well)
  activities = addPlaceToDay(activities, tripId, placeC, 2).activities;
  activities = addPlaceToDay(activities, tripId, placeA, 2).activities;

  // CASO 1: Consultar Todos los días
  assert.equal(activities.length, 4, 'Todos los días contiene 4 actividades totales');
  const allDaysList = [1, 2, 3].map((d) => getActivitiesForDay(activities, d));
  assert.equal(allDaysList[0].length, 2, 'Día 1 tiene 2 actividades en vista global');
  assert.equal(allDaysList[1].length, 2, 'Día 2 tiene 2 actividades en vista global');
  assert.equal(allDaysList[2].length, 0, 'Día 3 tiene 0 actividades en vista global');

  // CASO 2: Entrar al Día 1
  const day1Activities = getActivitiesForDay(activities, 1);
  assert.equal(day1Activities.length, 2);
  assert.equal(day1Activities[0].placeId, placeA.id);
  assert.equal(day1Activities[0].order, 1);
  assert.equal(day1Activities[1].placeId, placeB.id);
  assert.equal(day1Activities[1].order, 2);

  // CASO 3: Entrar al Día 2
  const day2Activities = getActivitiesForDay(activities, 2);
  assert.equal(day2Activities.length, 2);
  assert.equal(day2Activities[0].placeId, placeC.id);
  assert.equal(day2Activities[0].order, 1);
  assert.equal(day2Activities[1].placeId, placeA.id);
  assert.equal(day2Activities[1].order, 2);

  // CASO 4: Comprobar que cada jornada muestra exclusivamente sus propias actividades
  day1Activities.forEach((a) => assert.equal(a.dayNumber, 1));
  day2Activities.forEach((a) => assert.equal(a.dayNumber, 2));

  // CASO 5 & 6: Añadir un establecimiento desde Explorar y comprobar que aparece en el día seleccionado
  const placeD = INITIAL_PLACES[3];
  const addRes = addPlaceToDay(activities, tripId, placeD, 1);
  assert.equal(addRes.added, true);
  activities = addRes.activities;

  const day1Updated = getActivitiesForDay(activities, 1);
  assert.equal(day1Updated.length, 3);
  assert.equal(day1Updated[2].placeId, placeD.id);
  assert.equal(day1Updated[2].order, 3);
  assert.equal(day1Updated[2].dayNumber, 1);

  // CASO 7: Quitar una actividad de un día (quitar placeA de Día 1)
  const actToRemove = day1Updated[0]; // placeA en Día 1
  assert.equal(actToRemove.placeId, placeA.id);
  activities = removeActivityAndReindex(activities, actToRemove.id);

  const day1AfterRemoval = getActivitiesForDay(activities, 1);
  assert.equal(day1AfterRemoval.length, 2);
  // Re-indexación correcta: 1, 2
  assert.equal(day1AfterRemoval[0].order, 1);
  assert.equal(day1AfterRemoval[1].order, 2);
  assert.equal(day1AfterRemoval[0].placeId, placeB.id);
  assert.equal(day1AfterRemoval[1].placeId, placeD.id);

  // CASO 8: Comprobar que el lugar sigue existiendo intacto en el catálogo
  const placeAInCatalog = INITIAL_PLACES.find((p) => p.id === placeA.id);
  assert.ok(placeAInCatalog, 'El lugar sigue existiendo en el catálogo sin alteraciones');
  assert.equal(placeAInCatalog?.name, placeA.name);

  // CASO 9: Comprobar que permanece en otros días si estaba asignada
  const day2Check = getActivitiesForDay(activities, 2);
  const placeAStillInDay2 = day2Check.find((a) => a.placeId === placeA.id);
  assert.ok(placeAStillInDay2, 'PlaceA permanece intacto en el Día 2');
  assert.equal(placeAStillInDay2?.dayNumber, 2);

  // CASO 10: Cambiar el orden de actividades (swap placeB y placeD en Día 1)
  const reorderedDay1 = reorderDayActivities(activities, 1, [
    day1AfterRemoval[1].id, // placeD pasa a ser #1
    day1AfterRemoval[0].id, // placeB pasa a ser #2
  ]);
  activities = reorderedDay1;

  const day1Reordered = getActivitiesForDay(activities, 1);
  assert.equal(day1Reordered[0].placeId, placeD.id);
  assert.equal(day1Reordered[0].order, 1);
  assert.equal(day1Reordered[1].placeId, placeB.id);
  assert.equal(day1Reordered[1].order, 2);

  // CASO 11: Verificar que el orden se conserva al recargar (persistencia JSON)
  const tripToPersist: TripItinerary = {
    id: tripId,
    title: 'Viaje Cultural Trujillo',
    destinationId: 'trujillo',
    destinationName: 'Trujillo',
    startDate: '2026-05-12',
    endDate: '2026-05-14',
    totalDays: 3,
    totalNights: 2,
    savedPlaceIds: [],
    activities,
    notes: 'Recordatorios',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(tripToPersist);
  const reloadedTrip: TripItinerary = JSON.parse(serialized);

  const reloadedDay1 = getActivitiesForDay(reloadedTrip.activities, 1);
  assert.equal(reloadedDay1[0].placeId, placeD.id);
  assert.equal(reloadedDay1[0].order, 1);
  assert.equal(reloadedDay1[1].placeId, placeB.id);
  assert.equal(reloadedDay1[1].order, 2);

  // CASO 12: Consultar el mapa y comprobar correspondencia de marcadores y colores
  const colorDay1 = getDayColor(1);
  const colorDay2 = getDayColor(2);
  assert.equal(colorDay1.bg, '#E85B49', 'Día 1 tiene color Coral asignado');
  assert.equal(colorDay2.bg, '#2563EB', 'Día 2 tiene color Azul asignado');
  assert.notEqual(colorDay1.bg, colorDay2.bg, 'Día 1 y Día 2 tienen colores visualmente diferenciados');

  // CASO 13: Comprobar los días sin actividades (Día 3 vacío)
  const day3Activities = getActivitiesForDay(reloadedTrip.activities, 3);
  assert.equal(day3Activities.length, 0, 'Día 3 no tiene actividades');

  // CASO 14: Verificar que no se generan duplicados dentro del mismo día
  const duplicateAttempt = addPlaceToDay(reloadedTrip.activities, tripId, placeD, 1);
  assert.equal(duplicateAttempt.added, false, 'No se permite duplicar placeD en Día 1');
  assert.equal(duplicateAttempt.activities.length, reloadedTrip.activities.length);
});
