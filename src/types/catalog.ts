/**
 * Domain Models for LibertadGO Tourist Catalog and Itinerary Management.
 * Designed to prevent duplicates, track data provenance, and handle MINCETUR, OSM, and local business registries.
 */

import { Coordinates } from './geo.ts';

export type DataSourceType = 'mincetur_inventory' | 'mincetur_directory' | 'openstreetmap' | 'business_registry' | 'google_places_api';

export interface DataSource {
  id: string;
  type: DataSourceType;
  name: string;
  sourceUrl?: string;
  license?: string;
  fetchedAt: string;
}

export interface PlaceSource {
  placeId: string;
  sourceId: string;
  externalId: string;
  rawDataRef?: string;
  lastSyncedAt: string;
}

export interface PlaceVerification {
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationLevel: 'unverified' | 'community' | 'official_mincetur' | 'partner_verified';
  notes?: string;
}

export interface PlaceImage {
  id: string;
  url: string;
  caption?: string;
  author?: string;
  license?: string;
  isCover: boolean;
}

export interface PlaceOpeningHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  openTime: string;  // "07:00"
  closeTime: string; // "23:00"
  isClosed: boolean;
}

export interface PlaceUpdateHistory {
  id: string;
  placeId: string;
  modifiedAt: string;
  modifiedBy: string;
  changeSummary: string;
}

export type PlaceCategory =
  | 'restaurantes'
  | 'gastronomia'
  | 'atractivos'
  | 'arqueologia'
  | 'playas'
  | 'museos'
  | 'cultura'
  | 'naturaleza'
  | 'hoteles'
  | 'actividades';

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  subcategory?: string;
  localityId: string; // must match LA_LIBERTAD_LOCALITIES id
  localityName: string;
  address: string;
  coordinates: Coordinates;
  geohash: string;
  shortDescription: string;
  fullDescription?: string;
  phone?: string;
  email?: string;
  website?: string;
  priceLevel?: 1 | 2 | 3 | 4;
  rating?: number; // Verified rating only, e.g., 4.7
  reviewsCount?: number;
  images: PlaceImage[];
  openingHours?: PlaceOpeningHours[];
  verification: PlaceVerification;
  sources: PlaceSource[];
  tags: string[];
  recommendedDurationMinutes?: number;
}

export interface TripActivity {
  id: string;
  tripId: string;
  placeId: string;
  place?: Place;
  dayNumber: number; // 1, 2, 3...
  order: number;     // 1, 2, 3...
  timeSlot?: string; // e.g. "09:30"
  customTitle?: string;
  notes?: string;
  isVisited: boolean;
  createdAt: string;
}

export interface TripItinerary {
  id: string;
  userId?: string;
  title: string;
  destinationId: string; // restricted to La Libertad
  destinationName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalDays: number;
  totalNights: number;
  coverImage?: string;
  notes: string;
  savedPlaceIds: string[];
  activities: TripActivity[];
  createdAt: string;
  updatedAt: string;
}
