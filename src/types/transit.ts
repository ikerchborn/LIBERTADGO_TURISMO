/** Shared transport-catalog and normalized transit itinerary contracts for La Libertad, Perú. */

export type CatalogVehicleType = 'bus' | 'combi' | 'colectivo' | 'mototaxi';

export type CatalogConfidence = 'alta' | 'media' | 'baja';

export interface CatalogStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  landmark_hint?: string;
  street?: string;
  urbanization?: string;
  sector?: string;
}

export interface CatalogRoute {
  id: string;
  code: string;
  serviceName: string;
  route_code?: string;
  company_name?: string;
  badge_color?: string;
  text_color?: string;
  vehicleType: CatalogVehicleType;
  category?: string;
  farePen: number;
  fareRangePen: [number, number];
  estimatedMinutes: number;
  distanceKm: number;
  boardingStopId: string;
  dropoffStopId: string;
  geometry_ida?: {
    geometry?: {
      coordinates?: [number, number][]; // [lng, lat][]
    };
  };
  geometry_vuelta?: {
    geometry?: {
      coordinates?: [number, number][]; // [lng, lat][]
    };
  };
  routeGeometry?: {
    geometry?: {
      coordinates?: [number, number][]; // [lng, lat][]
    };
  };
  geometryVerified?: boolean;
  geometry_ida_verified?: boolean;
  geometry_vuelta_verified?: boolean;
  headwayMinutes?: number;
  confidence: CatalogConfidence;
  source: string;
}

export interface TransportCatalog {
  stops: CatalogStop[];
  routes: CatalogRoute[];
  routeLegs: Array<{
    id: string;
    totalEstimatedMinutes: number;
    totalFarePen: number;
    legs: Array<{ routeId: string }>;
    confidence: CatalogConfidence;
    source: string;
  }>;
}

export type TruxdiDirection = 'ida' | 'vuelta';

export interface TruxdiStop {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  direction: TruxdiDirection | null;
  position: number;
  geometry_position?: number;
  geometry_distance_m?: number;
  landmark_hint?: string;
  street?: string;
  address?: string;
  urbanization?: string;
  sector?: string;
}

export interface TruxdiRoute {
  route_id: string;
  route_name?: string | null;
  route_code?: string | null;
  source_route_code?: string | null;
  company_name?: string | null;
  vehicle_type?: 'micro' | 'combi' | null;
  estimated_minutes?: number | null;
  badge_color?: string | null;
  text_color?: string | null;
  vehicle_image_url?: string | null;
  fare: { standard: number | null; currency: 'PEN' };
  geometry_ida: [number, number][]; // [lng, lat][]
  geometry_vuelta: [number, number][]; // [lng, lat][]
  geometry_ida_verified: boolean;
  geometry_vuelta_verified: boolean;
  stops: TruxdiStop[];
  direction_sources: Array<{
    direction: string;
    review_status: string;
    confidence: number | null;
  }>;
}

export interface TransitRouteLeg {
  code: string;
  serviceName: string;
  vehicleType: 'bus' | 'colectivo' | 'mototaxi';
  farePen: number;
  estimatedMinutes: number;
  waitMinutes: number;
  boardingStop: string;
  dropoffStop: string;
  /** [lat, lng] */
  boardingPoint: [number, number];
  /** [lat, lng] */
  dropoffPoint: [number, number];
  /** [lat, lng][] */
  routeGeometry?: [number, number][];
  routeGeometryVerified?: boolean;
  /** [lat, lng][] real street-following walk from origin to boardingPoint */
  boardingWalkGeometry?: [number, number][];
  /** [lat, lng][] real street-following walk from dropoffPoint to destination */
  dropoffWalkGeometry?: [number, number][];
  routeColor: string;
  routeCode?: string;
  companyName?: string;
  badgeColor?: string;
  textColor?: string;
  boardingLandmarkHint?: string;
  dropoffLandmarkHint?: string;
}

/**
 * Normalized transit, taxi, or walking option consumed by itinerary and map components.
 * Note: `boardingPoint`, `dropoffPoint`, and `routeGeometry` use `[lat, lng]` order.
 */
export interface TransitOption {
  code: string;
  serviceName: string;
  headsign?: string;
  vehicleType: 'micro' | 'combi' | 'bus' | 'colectivo' | 'mototaxi' | 'caminata' | 'taxi';
  farePen: number;
  estimatedMinutes: number;
  waitMinutes: number;
  boardingStop: string;
  dropoffStop: string;
  /** [lat, lng] */
  boardingPoint: [number, number];
  /** [lat, lng] */
  dropoffPoint: [number, number];
  instructions: string;
  fareRangePen?: [number, number];
  confidence?: CatalogConfidence;
  source?: string;
  /** [lat, lng][] */
  routeGeometry?: [number, number][];
  routeGeometryVerified?: boolean;
  /** [lat, lng][] real street-following walk from origin to boardingPoint */
  boardingWalkGeometry?: [number, number][];
  /** [lat, lng][] real street-following walk from dropoffPoint to destination */
  dropoffWalkGeometry?: [number, number][];
  routeDistanceKm?: number;
  vehicleImageUrl?: string;
  warning?: string;
  routeColor?: string;
  routeCode?: string;
  companyName?: string;
  badgeColor?: string;
  textColor?: string;
  boardingLandmarkHint?: string;
  dropoffLandmarkHint?: string;
  routeLegs?: TransitRouteLeg[];
}

export interface TransportImageItem {
  id: string;
  name: string;
  type: string;
  image_url: string;
  source_url?: string;
  note?: string;
}
