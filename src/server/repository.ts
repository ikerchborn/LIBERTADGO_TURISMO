import { INITIAL_PLACES } from '../data/initialPlaces.ts';
import { Place, TripItinerary, TripActivity } from '../types/catalog.ts';
import { LA_LIBERTAD_LOCALITIES, Locality } from '../types/geo.ts';
import { isWithinLaLibertad, validateLocalityId, getLocality } from '../utils/geoBoundary.ts';
import { calculateTripDuration, formatDateRange } from '../utils/dateUtils.ts';

class CatalogRepository {
  private places: Map<string, Place> = new Map();
  private itineraries: Map<string, TripItinerary> = new Map();

  constructor() {
    // Populate verified places catalog
    for (const place of INITIAL_PLACES) {
      if (isWithinLaLibertad(place.coordinates)) {
        this.places.set(place.id, place);
      }
    }
  }

  // --- DESTINATIONS ---
  public getDestinations(): Locality[] {
    return LA_LIBERTAD_LOCALITIES;
  }

  public getDestinationById(id: string): Locality | undefined {
    return getLocality(id);
  }

  // --- PLACES & CATALOG ---
  public getPlaces(filters?: { localityId?: string; category?: string }): Place[] {
    let result = Array.from(this.places.values());

    if (filters?.localityId) {
      const locId = filters.localityId.toLowerCase();
      result = result.filter((p) => p.localityId.toLowerCase() === locId);
    }

    if (filters?.category) {
      const cat = filters.category.toLowerCase();
      result = result.filter((p) => p.category.toLowerCase() === cat);
    }

    // Double check strict boundary constraint
    return result.filter((p) => isWithinLaLibertad(p.coordinates));
  }

  public getPlaceById(id: string): Place | undefined {
    const place = this.places.get(id);
    if (!place || !isWithinLaLibertad(place.coordinates)) return undefined;
    return place;
  }

  public searchPlaces(query: string, localityId?: string): Place[] {
    const q = (query || '').toLowerCase().trim();
    let result = Array.from(this.places.values());

    if (localityId) {
      result = result.filter((p) => p.localityId.toLowerCase() === localityId.toLowerCase());
    }

    if (q) {
      result = result.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    return result.filter((p) => isWithinLaLibertad(p.coordinates));
  }

  // --- ITINERARIES ---
  public createItinerary(params: {
    destinationId: string;
    startDate: string;
    endDate: string;
    title?: string;
  }): { itinerary?: TripItinerary; error?: string } {
    if (!validateLocalityId(params.destinationId)) {
      return { error: 'El destino debe pertenecer a la región La Libertad, Perú' };
    }

    const locality = getLocality(params.destinationId);
    if (!locality) {
      return { error: 'Destino no encontrado en el catálogo de La Libertad' };
    }

    const duration = calculateTripDuration(params.startDate, params.endDate);
    if (!duration.isValid) {
      return { error: duration.error || 'Fechas de viaje inválidas' };
    }

    const id = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = params.title?.trim() || `Viaje a ${locality.name}`;

    const newItinerary: TripItinerary = {
      id,
      title,
      destinationId: locality.id,
      destinationName: locality.name,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays: duration.days,
      totalNights: duration.nights,
      coverImage: locality.heroImage,
      notes: '',
      savedPlaceIds: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.itineraries.set(id, newItinerary);
    return { itinerary: newItinerary };
  }

  public getItineraryById(id: string): TripItinerary | undefined {
    return this.itineraries.get(id);
  }

  public addActivity(itineraryId: string, activityInput: {
    placeId: string;
    dayNumber: number;
    timeSlot?: string;
    notes?: string;
  }): { activity?: TripActivity; error?: string } {
    const itinerary = this.itineraries.get(itineraryId);
    if (!itinerary) return { error: 'Itinerario no encontrado' };

    const place = this.places.get(activityInput.placeId);
    if (!place) return { error: 'Lugar no encontrado en el catálogo' };

    if (activityInput.dayNumber < 1 || activityInput.dayNumber > itinerary.totalDays) {
      return { error: `El día debe estar entre 1 y ${itinerary.totalDays}` };
    }

    const dayActivities = itinerary.activities.filter((a) => a.dayNumber === activityInput.dayNumber);
    const order = dayActivities.length + 1;

    const activity: TripActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tripId: itineraryId,
      placeId: place.id,
      place,
      dayNumber: activityInput.dayNumber,
      order,
      timeSlot: activityInput.timeSlot,
      notes: activityInput.notes,
      isVisited: false,
      createdAt: new Date().toISOString(),
    };

    itinerary.activities.push(activity);
    itinerary.updatedAt = new Date().toISOString();

    return { activity };
  }

  public removeActivity(itineraryId: string, activityId: string): boolean {
    const itinerary = this.itineraries.get(itineraryId);
    if (!itinerary) return false;

    const index = itinerary.activities.findIndex((a) => a.id === activityId);
    if (index === -1) return false;

    itinerary.activities.splice(index, 1);
    itinerary.updatedAt = new Date().toISOString();
    return true;
  }
}

export const catalogRepository = new CatalogRepository();
