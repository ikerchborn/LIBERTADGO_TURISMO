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
function parseDateParts(dateStr: string): [number, number, number] | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [year, month, day] = parts;
  return [year, month, day];
}

/**
 * Calculates total days and nights between arrival and departure dates.
 * Enforces arrival <= departure and maximum 45 days for planning.
 * Strictly timezone-safe using UTC day counts.
 */
export function calculateTripDuration(startDateStr: string, endDateStr: string): TripDurationResult {
  if (!startDateStr || !endDateStr) {
    return { days: 0, nights: 0, isValid: false, error: 'Ambas fechas son obligatorias' };
  }

  const startParts = parseDateParts(startDateStr);
  const endParts = parseDateParts(endDateStr);

  if (!startParts || !endParts) {
    return { days: 0, nights: 0, isValid: false, error: 'Formato de fecha inválido' };
  }

  const startUtc = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
  const endUtc = Date.UTC(endParts[0], endParts[1] - 1, endParts[2]);

  const diffTime = endUtc - startUtc;
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
 * Formats a date range in clean Spanish, e.g. "3 – 7 nov. 2026" or "28 oct. – 2 nov. 2026"
 * Strictly timezone-safe using parsed parts.
 */
export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const startParts = parseDateParts(startDateStr);
  const endParts = parseDateParts(endDateStr);
  if (!startParts || !endParts) return '';

  const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.'];

  const [startYear, startMonthNum, startDay] = startParts;
  const [endYear, endMonthNum, endDay] = endParts;

  const startMonth = months[startMonthNum - 1] || '';
  const endMonth = months[endMonthNum - 1] || '';

  if (startYear === endYear) {
    if (startMonthNum === endMonthNum) {
      if (startDay === endDay) {
        return `${startDay} ${startMonth} ${startYear}`;
      }
      return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

export const DEFAULT_FLEXIBLE_DAYS = 3;

export interface OptionalTripDatesResult extends TripDurationResult {
  hasDates: boolean;
  startDate: string;
  endDate: string;
}

/**
 * Validates optional start/end trip dates.
 * - Both empty: valid flexible trip with DEFAULT_FLEXIBLE_DAYS (no calendar dates assigned).
 * - Only startDate provided: valid single-day trip (endDate = startDate).
 * - Only endDate provided: invalid (asks for startDate or leaving both empty).
 * - Both provided: validates via calculateTripDuration.
 */
export function calculateOptionalTripDates(
  startDateStr?: string,
  endDateStr?: string
): OptionalTripDatesResult {
  const start = (startDateStr || '').trim();
  const end = (endDateStr || '').trim();

  if (!start && !end) {
    return {
      days: DEFAULT_FLEXIBLE_DAYS,
      nights: DEFAULT_FLEXIBLE_DAYS - 1,
      hasDates: false,
      startDate: '',
      endDate: '',
      isValid: true,
    };
  }

  if (start && !end) {
    const startParts = parseDateParts(start);
    if (!startParts || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
      return {
        days: 0,
        nights: 0,
        hasDates: false,
        startDate: start,
        endDate: '',
        isValid: false,
        error: 'Formato de fecha inválido',
      };
    }
    return {
      days: 1,
      nights: 0,
      hasDates: true,
      startDate: start,
      endDate: start,
      isValid: true,
    };
  }

  if (!start && end) {
    return {
      days: 0,
      nights: 0,
      hasDates: false,
      startDate: '',
      endDate: end,
      isValid: false,
      error: 'Ingresa también la fecha de inicio o deja ambas fechas vacías',
    };
  }

  const duration = calculateTripDuration(start, end);
  return {
    ...duration,
    hasDates: duration.isValid,
    startDate: start,
    endDate: end,
  };
}

/**
 * Generates an array of day descriptors for the itinerary organizer.
 * Strictly timezone-safe using UTC arithmetic.
 * When startDateStr is empty, returns flexible day labels ("Día 1", "Día 2", ...).
 */
export function generateDayList(startDateStr: string, daysCount: number): TripDayItem[] {
  if (daysCount <= 0) return [];

  if (!startDateStr) {
    const flexibleDays: TripDayItem[] = [];
    for (let i = 0; i < daysCount; i++) {
      flexibleDays.push({
        dayNumber: i + 1,
        dateString: '',
        label: `Día ${i + 1}`,
        formattedDate: 'Fecha flexible',
        weekdayShort: '',
      });
    }
    return flexibleDays;
  }

  const startParts = parseDateParts(startDateStr);
  if (!startParts) return [];

  const weekdaysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthsShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

  const days: TripDayItem[] = [];
  const baseUtc = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);

  for (let i = 0; i < daysCount; i++) {
    const dayUtc = new Date(baseUtc + i * 86400000);
    const yyyy = dayUtc.getUTCFullYear();
    const mm = String(dayUtc.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dayUtc.getUTCDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;

    const weekday = weekdaysShort[dayUtc.getUTCDay()];
    const dayNumber = dayUtc.getUTCDate();
    const month = monthsShort[dayUtc.getUTCMonth()];

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
