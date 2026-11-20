/** Resolves Truxdi's urban route geometry and stop inventory into feasible transit legs. */
import type { Place } from '../types/catalog.ts';
import type {
  CatalogConfidence,
  TransitOption,
  TruxdiDirection,
  TruxdiRoute,
  TruxdiStop,
} from '../types/transit.ts';
import { isTransitWalkOverLimitKm, MAX_TRANSIT_WALK_KM } from './transitPolicy.ts';
import { getRouteColor, loadTruxdiRoutes, TEXT_ON_DARK } from './transitCatalogData.ts';
import { findNearbyReadableStopName, sanitizeStopName } from './transitCatalog.ts';
import {
  getPolylineDistanceKm,
  getWalkingRoute,
  haversineKm,
  type WalkingRouteResult,
} from './transitGeo.ts';

const truxdiGeometryDistanceCache = new Map<string, number>();
const truxdiCandidatesCache = new Map<
  string,
  Array<{ transit: TransitOption; totalEstimatedMinutes: number }>
>();

function sliceTruxdiGeometry(
  geometry: [number, number][],
  startPosition: number,
  endPosition: number
): [number, number][] | null {
  if (
    geometry.length < 2 ||
    !Number.isFinite(startPosition) ||
    !Number.isFinite(endPosition) ||
    startPosition < 0 ||
    endPosition <= startPosition ||
    endPosition > geometry.length - 1
  ) {
    return null;
  }

  const interpolate = (position: number): [number, number] => {
    const index = Math.floor(position);
    const fraction = position - index;
    const start = geometry[index];
    const end = geometry[Math.min(index + 1, geometry.length - 1)];
    return [
      start[0] + (end[0] - start[0]) * fraction,
      start[1] + (end[1] - start[1]) * fraction,
    ];
  };
  const segment: [number, number][] = [interpolate(startPosition)];
  for (let index = Math.floor(startPosition) + 1; index < endPosition; index += 1) {
    segment.push(geometry[index]);
  }
  segment.push(interpolate(endPosition));
  return segment.map(([longitude, latitude]) => [latitude, longitude]);
}

function getTruxdiFullRouteDistanceKm(
  route: TruxdiRoute,
  direction: TruxdiDirection,
  geometry: [number, number][]
): number {
  const key = `${route.route_id}:${direction}`;
  const cachedDistance = truxdiGeometryDistanceCache.get(key);
  if (cachedDistance !== undefined) return cachedDistance;

  const distance = getPolylineDistanceKm(
    geometry.map(([longitude, latitude]) => [latitude, longitude])
  );
  truxdiGeometryDistanceCache.set(key, distance);
  return distance;
}

interface PolylineProjection {
  geometryPosition: number;
  coordinates: [number, number]; // [lng, lat]
  distanceKm: number;
}

/**
 * Projects a [lat, lng] point onto the closest segment of a [lng, lat][] polyline.
 */
function projectPointOntoPolyline(
  targetLat: number,
  targetLng: number,
  geometry: [number, number][]
): PolylineProjection | null {
  if (geometry.length < 2) return null;

  const cosLat = Math.cos((targetLat * Math.PI) / 180);
  let bestDistSq = Infinity;
  let bestPos = 0;
  let bestLng = geometry[0][0];
  let bestLat = geometry[0][1];

  for (let i = 0; i < geometry.length - 1; i += 1) {
    const [ax, ay] = geometry[i];
    const [bx, by] = geometry[i + 1];
    const dx = (bx - ax) * cosLat;
    const dy = by - ay;
    const px = (targetLng - ax) * cosLat;
    const py = targetLat - ay;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq > 0 ? Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq)) : 0;
    const projLng = ax + (bx - ax) * t;
    const projLat = ay + (by - ay) * t;
    const ex = (targetLng - projLng) * cosLat;
    const ey = targetLat - projLat;
    const distSq = ex * ex + ey * ey;

    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestPos = i + t;
      bestLng = projLng;
      bestLat = projLat;
    }
  }

  return {
    geometryPosition: bestPos,
    coordinates: [bestLng, bestLat],
    distanceKm: haversineKm(targetLat, targetLng, bestLat, bestLng),
  };
}

function buildVirtualStop(
  label: string,
  projection: PolylineProjection,
  direction: TruxdiDirection
): TruxdiStop {
  return {
    name: label,
    coordinates: projection.coordinates,
    direction,
    position: projection.geometryPosition,
    geometry_position: projection.geometryPosition,
    geometry_distance_m: 0,
  };
}

function getTruxdiTransitCandidates(
  origin: Place,
  destination: Place,
  routes: TruxdiRoute[]
): Array<{ transit: TransitOption; totalEstimatedMinutes: number }> {
  const oLat = origin.coordinates.lat;
  const oLng = origin.coordinates.lng;
  const dLat = destination.coordinates.lat;
  const dLng = destination.coordinates.lng;

  const cacheKey = `${oLat},${oLng}>${dLat},${dLng}`;
  const cachedCandidates = truxdiCandidatesCache.get(cacheKey);
  if (cachedCandidates) return cachedCandidates;

  const candidates: Array<{ transit: TransitOption; totalEstimatedMinutes: number }> = [];
  const maxStopAccessKm = MAX_TRANSIT_WALK_KM;

  for (const route of routes) {
    if (
      !route.vehicle_type ||
      typeof route.fare?.standard !== 'number' ||
      !Number.isFinite(route.fare.standard)
    ) {
      continue;
    }

    for (const direction of ['ida', 'vuelta'] as const) {
      const geometry = direction === 'ida' ? route.geometry_ida : route.geometry_vuelta;
      if (!Array.isArray(geometry) || geometry.length < 2) continue;

      const sourceDirection = route.direction_sources.find((source) =>
        direction === 'vuelta'
          ? source.direction === 'inbound'
          : source.direction === 'outbound' || source.direction === 'loop'
      );
      const geometryVerified =
        direction === 'ida' ? route.geometry_ida_verified : route.geometry_vuelta_verified;
      const stops = route.stops
        .filter(
          (stop) =>
            stop.direction === direction &&
            typeof stop.geometry_position === 'number' &&
            (stop.geometry_distance_m ?? Infinity) <= 50
        )
        .sort((left, right) => left.position - right.position);
      if (stops.length < 2) continue;
      const fullRouteDistanceKm = getTruxdiFullRouteDistanceKm(route, direction, geometry);

      const boardingProjection = projectPointOntoPolyline(oLat, oLng, geometry);
      const alightingProjection = projectPointOntoPolyline(dLat, dLng, geometry);

      const findNearestStopLabel = (proj: PolylineProjection, fallbackLabel: string): string => {
        let bestStop: TruxdiStop | null = null;
        let bestDist = 0.25;
        for (const stop of stops) {
          const d = haversineKm(
            stop.coordinates[1],
            stop.coordinates[0],
            proj.coordinates[1],
            proj.coordinates[0]
          );
          if (d < bestDist) {
            bestDist = d;
            bestStop = stop;
          }
        }
        return bestStop ? `${bestStop.name} (en ruta)` : fallbackLabel;
      };

      const boardingWithVirtual = [...stops];
      if (boardingProjection && boardingProjection.distanceKm <= maxStopAccessKm) {
        boardingWithVirtual.push(
          buildVirtualStop(
            findNearestStopLabel(boardingProjection, `Paradero en ruta (${origin.name})`),
            boardingProjection,
            direction
          )
        );
      }

      const alightingWithVirtual = [...stops];
      if (alightingProjection && alightingProjection.distanceKm <= maxStopAccessKm) {
        alightingWithVirtual.push(
          buildVirtualStop(
            findNearestStopLabel(alightingProjection, `Paradero en ruta (${destination.name})`),
            alightingProjection,
            direction
          )
        );
      }

      const boardingCandidates = boardingWithVirtual
        .map((stop) => ({
          stop,
          distanceKm: haversineKm(oLat, oLng, stop.coordinates[1], stop.coordinates[0]),
        }))
        .filter(({ distanceKm }) => distanceKm <= maxStopAccessKm)
        .sort((left, right) => left.distanceKm - right.distanceKm)
        .slice(0, 4);

      for (const boarding of boardingCandidates) {
        const alightingCandidates = alightingWithVirtual
          .filter(
            (stop) =>
              (stop.geometry_position ?? -1) > (boarding.stop.geometry_position ?? -1)
          )
          .map((stop) => ({
            stop,
            distanceKm: haversineKm(dLat, dLng, stop.coordinates[1], stop.coordinates[0]),
          }))
          .filter(({ distanceKm }) => distanceKm <= maxStopAccessKm)
          .sort((left, right) => left.distanceKm - right.distanceKm)
          .slice(0, 4);

        for (const alighting of alightingCandidates) {
          const routeGeometry = sliceTruxdiGeometry(
            geometry,
            boarding.stop.geometry_position!,
            alighting.stop.geometry_position!
          );
          if (!routeGeometry || routeGeometry.length < 2) continue;

          const routeDistanceKm = getPolylineDistanceKm(routeGeometry);
          if (routeDistanceKm < 0.1) continue;
          const estimatedMinutes =
            route.estimated_minutes && fullRouteDistanceKm > 0
              ? Math.max(
                  2,
                  Math.round(
                    (route.estimated_minutes * routeDistanceKm) / fullRouteDistanceKm
                  )
                )
              : Math.max(2, Math.round((routeDistanceKm / 18) * 60));
          const routeCode =
            route.route_code ?? route.source_route_code ?? route.route_id;
          const badgeColor = route.badge_color ?? getRouteColor(routeCode);
          const boardingStopName = sanitizeStopName(
            boarding.stop.name,
            boarding.stop.coordinates,
            boarding.stop.street ??
              boarding.stop.address ??
              boarding.stop.urbanization ??
              boarding.stop.sector ??
              findNearbyReadableStopName(stops, boarding.stop)
          );
          const dropoffStopName = sanitizeStopName(
            alighting.stop.name,
            alighting.stop.coordinates,
            alighting.stop.street ??
              alighting.stop.address ??
              alighting.stop.urbanization ??
              alighting.stop.sector ??
              findNearbyReadableStopName(stops, alighting.stop)
          );
          const walkMinutes =
            ((boarding.distanceKm + alighting.distanceKm) / 4.5) * 60 * 1.3;
          const waitMinutes = 6;
          const confidence: CatalogConfidence = geometryVerified
            ? 'alta'
            : (sourceDirection?.confidence ?? 0) >= 0.5
              ? 'media'
              : 'baja';

          candidates.push({
            totalEstimatedMinutes: walkMinutes + waitMinutes + estimatedMinutes,
            transit: {
              code: routeCode,
              serviceName:
                route.route_name ?? route.company_name ?? `Ruta ${routeCode}`,
              vehicleType: route.vehicle_type,
              farePen: route.fare.standard,
              fareRangePen: [route.fare.standard, route.fare.standard],
              estimatedMinutes,
              waitMinutes,
              boardingStop: boardingStopName,
              dropoffStop: dropoffStopName,
              boardingPoint: [
                boarding.stop.coordinates[1],
                boarding.stop.coordinates[0],
              ],
              dropoffPoint: [
                alighting.stop.coordinates[1],
                alighting.stop.coordinates[0],
              ],
              instructions: `Camina hasta ${boardingStopName}, sube a ${route.company_name ?? routeCode} (${routeCode}) y baja en ${dropoffStopName}.`,
              confidence,
              source: `Truxdi · ${sourceDirection?.review_status ?? 'revisión pendiente'}`,
              routeGeometry,
              routeGeometryVerified: geometryVerified,
              routeDistanceKm,
              vehicleImageUrl: route.vehicle_image_url ?? undefined,
              routeColor: badgeColor,
              routeCode,
              companyName: route.company_name ?? route.route_name ?? routeCode,
              badgeColor,
              textColor: route.text_color ?? TEXT_ON_DARK,
              boardingLandmarkHint: boarding.stop.landmark_hint,
              dropoffLandmarkHint: alighting.stop.landmark_hint,
            },
          });
        }
      }
    }
  }

  const sortedCandidates = candidates.sort(
    (left, right) => left.totalEstimatedMinutes - right.totalEstimatedMinutes
  );
  if (truxdiCandidatesCache.size >= 250) truxdiCandidatesCache.clear();
  truxdiCandidatesCache.set(cacheKey, sortedCandidates);
  return sortedCandidates;
}

/**
 * Finds the fastest feasible Truxdi option among the leading route candidates.
 *
 * Access walks over the shared 800 m distance limit are rejected.
 */
export async function resolveTruxdiTransit(
  origin: Place,
  destination: Place
): Promise<TransitOption | null> {
  const routes = await loadTruxdiRoutes();
  const candidates = getTruxdiTransitCandidates(origin, destination, routes);
  const oLat = origin.coordinates.lat;
  const oLng = origin.coordinates.lng;
  const dLat = destination.coordinates.lat;
  const dLng = destination.coordinates.lng;

  const evaluated = await Promise.all(
    candidates.slice(0, 10).map(async (candidate) => {
      const transit = candidate.transit;
      const accessDistances = [
        haversineKm(oLat, oLng, transit.boardingPoint[0], transit.boardingPoint[1]),
        haversineKm(transit.dropoffPoint[0], transit.dropoffPoint[1], dLat, dLng),
      ];
      const accessRoutes: Array<WalkingRouteResult | null> = await Promise.all([
        accessDistances[0] > 0.05
          ? getWalkingRoute([oLat, oLng], transit.boardingPoint)
          : Promise.resolve(null),
        accessDistances[1] > 0.05
          ? getWalkingRoute(transit.dropoffPoint, [dLat, dLng])
          : Promise.resolve(null),
      ]);
      const inaccessible = accessRoutes.some((route, index) => {
        if (!route) return accessDistances[index] > 0.05;
        if (isTransitWalkOverLimitKm(route.distanceKm)) return true;
        return route.isFallback && isTransitWalkOverLimitKm(accessDistances[index]);
      });
      if (inaccessible) return null;

      const unverifiedAccess = accessRoutes.some(
        (route, index) =>
          accessDistances[index] > 0.05 && (!route || route.isFallback)
      );
      const boardingWalkGeometry =
        accessRoutes[0] &&
        !accessRoutes[0].isFallback &&
        accessRoutes[0].coordinates.length >= 2
          ? accessRoutes[0].coordinates
          : undefined;
      const dropoffWalkGeometry =
        accessRoutes[1] &&
        !accessRoutes[1].isFallback &&
        accessRoutes[1].coordinates.length >= 2
          ? accessRoutes[1].coordinates
          : undefined;

      const walkMinutes =
        (accessRoutes[0]?.durationMin ?? 0) + (accessRoutes[1]?.durationMin ?? 0);
      const realTotalMinutes =
        walkMinutes + transit.waitMinutes + transit.estimatedMinutes;

      return {
        realTotalMinutes,
        unverifiedAccess,
        option: {
          ...transit,
          ...(boardingWalkGeometry ? { boardingWalkGeometry } : {}),
          ...(dropoffWalkGeometry ? { dropoffWalkGeometry } : {}),
          ...(unverifiedAccess
            ? {
                warning: [
                  transit.warning,
                  'No se pudo validar por OSRM el acceso peatonal a uno de los paraderos.',
                ]
                  .filter(Boolean)
                  .join(' '),
              }
            : {}),
        } as TransitOption,
      };
    })
  );

  const feasible = evaluated
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((left, right) => {
      if (left.unverifiedAccess !== right.unverifiedAccess) {
        return left.unverifiedAccess ? 1 : -1;
      }
      return left.realTotalMinutes - right.realTotalMinutes;
    });

  return feasible[0]?.option ?? null;
}
