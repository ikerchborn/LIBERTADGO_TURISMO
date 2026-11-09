/**
 * Utilities for LibertadGO Itinerary Management (Phase 3).
 * Pure functions for day activity organization, reordering, duplicate prevention, and multi-day color palettes.
 */

import { Place, TripActivity } from '../types/catalog.ts';

/**
 * Standard visual color palette for distinguishing trip days in map and timeline
 */
export const DAY_PALETTE: { bg: string; text: string; border: string; lightBg: string; name: string }[] = [
  { bg: '#E85B49', text: '#FFFFFF', border: '#CB4B39', lightBg: 'bg-rose-50 text-[#E85B49] border-rose-200', name: 'Coral' },
  { bg: '#2563EB', text: '#FFFFFF', border: '#1D4ED8', lightBg: 'bg-blue-50 text-[#2563EB] border-blue-200', name: 'Azul' },
  { bg: '#059669', text: '#FFFFFF', border: '#047857', lightBg: 'bg-emerald-50 text-[#059669] border-emerald-200', name: 'Esmeralda' },
  { bg: '#7C3AED', text: '#FFFFFF', border: '#6D28D9', lightBg: 'bg-purple-50 text-[#7C3AED] border-purple-200', name: 'Púrpura' },
  { bg: '#D97706', text: '#FFFFFF', border: '#B45309', lightBg: 'bg-amber-50 text-[#D97706] border-amber-200', name: 'Ámbar' },
  { bg: '#0891B2', text: '#FFFFFF', border: '#0E7490', lightBg: 'bg-cyan-50 text-[#0891B2] border-cyan-200', name: 'Cian' },
  { bg: '#475569', text: '#FFFFFF', border: '#334155', lightBg: 'bg-slate-50 text-[#475569] border-slate-200', name: 'Pizarra' },
];

export function getDayColor(dayNumber: number) {
  const index = Math.max(0, dayNumber - 1) % DAY_PALETTE.length;
  return DAY_PALETTE[index];
}

/**
 * Filter activities for a specific day and sort them strictly by order (1, 2, 3...)
 */
export function getActivitiesForDay(activities: TripActivity[], dayNumber: number): TripActivity[] {
  return activities
    .filter((a) => a.dayNumber === dayNumber)
    .sort((a, b) => a.order - b.order);
}

/**
 * Add a place to a specific day, preventing duplicates in the SAME day.
 * Returns updated activities array and a boolean indicating if it was added.
 */
export function addPlaceToDay(
  activities: TripActivity[],
  tripId: string,
  place: Place,
  dayNumber: number
): { activities: TripActivity[]; added: boolean } {
  const alreadyExistsInDay = activities.some(
    (a) => a.placeId === place.id && a.dayNumber === dayNumber
  );

  if (alreadyExistsInDay) {
    return { activities, added: false };
  }

  const dayActivities = activities.filter((a) => a.dayNumber === dayNumber);
  const nextOrder = dayActivities.length + 1;

  const newActivity: TripActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tripId,
    placeId: place.id,
    place,
    dayNumber,
    order: nextOrder,
    isVisited: false,
    createdAt: new Date().toISOString(),
  };

  return {
    activities: [...activities, newActivity],
    added: true,
  };
}

/**
 * Remove an activity by its unique ID and re-index the remaining activities of that day.
 * Leaves other days untouched and preserves catalog places.
 */
export function removeActivityAndReindex(
  activities: TripActivity[],
  activityId: string
): TripActivity[] {
  const target = activities.find((a) => a.id === activityId);
  if (!target) return activities;

  const remaining = activities.filter((a) => a.id !== activityId);

  // Re-index only the day of the removed activity
  return remaining.map((a) => {
    if (a.dayNumber === target.dayNumber && a.order > target.order) {
      return { ...a, order: a.order - 1 };
    }
    return a;
  });
}

/**
 * Reorder activities for a day using an ordered array of activity IDs.
 * Strictly guarantees sequential order: 1, 2, 3...
 */
export function reorderDayActivities(
  activities: TripActivity[],
  dayNumber: number,
  orderedActivityIds: string[]
): TripActivity[] {
  const orderMap = new Map<string, number>();
  orderedActivityIds.forEach((id, index) => {
    orderMap.set(id, index + 1);
  });

  return activities.map((a) => {
    if (a.dayNumber === dayNumber && orderMap.has(a.id)) {
      return { ...a, order: orderMap.get(a.id)! };
    }
    return a;
  });
}

/**
 * Move an activity to a target day at a specified index (Drag and Drop between days or within a day).
 * Properly re-indexes both source and target days.
 */
export function moveActivityToDayAndIndex(
  activities: TripActivity[],
  activityId: string,
  targetDayNumber: number,
  targetIndex?: number
): TripActivity[] {
  const activity = activities.find((a) => a.id === activityId);
  if (!activity) return activities;

  const sourceDay = activity.dayNumber;
  const isSameDay = sourceDay === targetDayNumber;

  // Activities without the target
  const otherActivities = activities.filter((a) => a.id !== activityId);

  // Target day list
  const targetDayList = otherActivities
    .filter((a) => a.dayNumber === targetDayNumber)
    .sort((a, b) => a.order - b.order);

  // Insert at target index
  const safeIndex =
    targetIndex === undefined
      ? targetDayList.length
      : Math.max(0, Math.min(targetIndex, targetDayList.length));

  const movedActivity: TripActivity = {
    ...activity,
    dayNumber: targetDayNumber,
  };

  targetDayList.splice(safeIndex, 0, movedActivity);

  // Re-index target day
  const updatedTargetDay = targetDayList.map((a, idx) => ({
    ...a,
    order: idx + 1,
  }));

  // If moving between different days, re-index source day
  let updatedSourceDay: TripActivity[] = [];
  if (!isSameDay) {
    const sourceDayList = otherActivities
      .filter((a) => a.dayNumber === sourceDay)
      .sort((a, b) => a.order - b.order);
    updatedSourceDay = sourceDayList.map((a, idx) => ({
      ...a,
      order: idx + 1,
    }));
  }

  // All other days
  const rest = otherActivities.filter(
    (a) => a.dayNumber !== targetDayNumber && a.dayNumber !== sourceDay
  );

  return [...rest, ...updatedTargetDay, ...updatedSourceDay];
}
