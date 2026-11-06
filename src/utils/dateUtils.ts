/**
 * Utility functions for trip date calculations, calendar ranges, and day lists.
 */

export interface TripDurationResult {
  days: number;
  nights: number;
  isValid: boolean;
  error?: string;
}

export interface TripDayItem {
  dayNumber: number;
  dateString: string; // YYYY-MM-DD
  label: string;      // e.g. "Día 1"
  formattedDate: string; // e.g. "Mar., 3 nov."
  weekdayShort: string;  // e.g. "Mar"
}

/**
 * Calculates total days and nights between arrival and departure dates.
 * Enforces arrival <= departure and maximum 30 days for MVP planning.
 */
export function calculateTripDuration(startDateStr: string, endDateStr: string): TripDurationResult {
  if (!startDateStr || !endDateStr) {
    return { days: 0, nights: 0, isValid: false, error: 'Ambas fechas son obligatorias' };
  }

  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { days: 0, nights: 0, isValid: false, error: 'Formato de fecha inválido' };
  }

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: 0,
      nights: 0,
      isValid: false,
      error: 'La fecha de salida no puede ser anterior a la de llegada',
    };
  }

  // 1 day trip (same day) = 1 day, 0 nights
  // 2 days trip (1 night) = 2 days, 1 night
  const nights = diffDays;
  const days = diffDays + 1;

  if (days > 45) {
    return {
      days,
      nights,
      isValid: false,
      error: 'El viaje no puede exceder 45 días en esta versión',
    };
  }

  return {
    days,
    nights,
    isValid: true,
  };
}

/**
 * Formats a date range in clean Spanish, e.g. "3 nov. – 7 nov. 2026" or "28 oct. – 2 nov. 2026"
 */
export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

  const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.'];

  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      if (startDay === endDay) {
        return `${startDay} ${startMonth} ${startYear}`;
      }
      return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

/**
 * Generates an array of day descriptors for the itinerary organizer.
 */
export function generateDayList(startDateStr: string, daysCount: number): TripDayItem[] {
  if (!startDateStr || daysCount <= 0) return [];
  const start = new Date(startDateStr + 'T00:00:00');
  if (isNaN(start.getTime())) return [];

  const weekdaysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthsShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

  const days: TripDayItem[] = [];

  for (let i = 0; i < daysCount; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;

    const weekday = weekdaysShort[current.getDay()];
    const dayNumber = current.getDate();
    const month = monthsShort[current.getMonth()];

    days.push({
      dayNumber: i + 1,
      dateString,
      label: `Día ${i + 1}`,
      formattedDate: `${weekday}., ${dayNumber} ${month}.`,
      weekdayShort: weekday,
    });
  }

  return days;
}
