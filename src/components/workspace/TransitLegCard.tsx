import React, { useEffect, useState } from 'react';
import { Bus, Footprints, Car, AlertTriangle, Sparkles } from 'lucide-react';
import type { Place } from '../../types/catalog.ts';
import type { TransitOption } from '../../types/transit.ts';
import { getTransitAlternatives, getTransportImage } from '../../utils/transitService.ts';

interface TransitLegCardProps {
  origin: Place;
  destination: Place;
  transit: TransitOption;
  isResolving?: boolean;
}

function getVehicleLabel(vehicleType: TransitOption['vehicleType']): string {
  switch (vehicleType) {
    case 'micro':
      return 'Microbús';
    case 'combi':
      return 'Combi';
    case 'bus':
      return 'Bus';
    case 'colectivo':
      return 'Colectivo';
    case 'mototaxi':
      return 'Mototaxi';
    case 'caminata':
      return 'A pie';
    case 'taxi':
      return 'Taxi';
  }
}

function formatStopLabel(stop: string, fallbackPlaceName: string, isTaxi: boolean): string {
  if (isTaxi && (/^Punto de partida\s*\(/i.test(stop) || /^Destino\s*\(/i.test(stop))) {
    return fallbackPlaceName;
  }
  return stop;
}

export const TransitLegCard: React.FC<TransitLegCardProps> = ({
  origin,
  destination,
  transit,
  isResolving = false,
}) => {
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<'transit' | 'direct-taxi'>(
    'transit'
  );
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setSelectedAlternativeId('transit');
  }, [origin.id, destination.id]);

  const alternatives = getTransitAlternatives(origin, destination, transit);
  const activeOption =
    alternatives.find((alt) => alt.id === selectedAlternativeId)?.transit ?? transit;

  const isWalk = activeOption.vehicleType === 'caminata';
  const isTaxi = activeOption.vehicleType === 'taxi';
  const hasMultiLegs = Boolean(activeOption.routeLegs && activeOption.routeLegs.length > 1);
  const transportImage = getTransportImage(activeOption.serviceName, activeOption.code);
  useEffect(() => {
    setImgError(false);
  }, [transportImage?.image_url]);
  const totalMinutes = activeOption.estimatedMinutes + activeOption.waitMinutes;

  const accentColor = isWalk
    ? '#059669'
    : isTaxi
      ? '#D97706'
      : activeOption.badgeColor ?? '#17243A';

  const containerStyle = isWalk
    ? 'bg-emerald-50/45 border-emerald-200/80'
    : 'bg-[#F8FAFC] border-[#E2E8F0]';

  const boardingLabel = formatStopLabel(activeOption.boardingStop, origin.name, isTaxi);
  const dropoffLabel = formatStopLabel(activeOption.dropoffStop, destination.name, isTaxi);

  const fareText =
    activeOption.farePen === 0
      ? 'Gratis'
      : activeOption.fareRangePen && activeOption.fareRangePen[0] !== activeOption.fareRangePen[1]
        ? `S/ ${activeOption.fareRangePen[0].toFixed(0)}–${activeOption.fareRangePen[1].toFixed(0)}`
        : `S/ ${activeOption.farePen.toFixed(2)}`;

  return (
    <div
      className={`mx-1 sm:mx-3 my-1.5 rounded-xl border border-l-[3px] p-2.5 sm:p-3 transition-colors ${containerStyle}`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Ilustración o ícono del vehículo */}
          {transportImage && !imgError && !isWalk && !isTaxi ? (
            <img
              src={transportImage.image_url}
              alt={`Imagen referencial de ${activeOption.serviceName}`}
              loading="lazy"
              width={48}
              height={32}
              className="h-8 w-12 shrink-0 rounded-lg border border-[#E2E8F0] bg-white object-contain p-0.5 mt-0.5"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isWalk
                  ? 'bg-emerald-600 text-white'
                  : isTaxi
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#17243A] text-white'
              }`}
            >
              {isWalk ? (
                <Footprints className="w-4 h-4" />
              ) : isTaxi ? (
                <Car className="w-4 h-4" />
              ) : (
                <Bus className="w-4 h-4" />
              )}
            </div>
          )}

          {/* Detalles de la ruta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {!isWalk && !isTaxi && (
                <span
                  className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide shrink-0"
                  style={{
                    backgroundColor: activeOption.badgeColor ?? '#17243A',
                    color: activeOption.textColor ?? '#FFFFFF',
                  }}
                >
                  Línea {activeOption.routeCode ?? activeOption.code}
                </span>
              )}

              <span className="font-semibold text-[#17243A] text-xs leading-snug">
                {isWalk
                  ? 'Caminata'
                  : isTaxi
                    ? 'Taxi directo o aplicativo'
                    : activeOption.companyName ?? activeOption.serviceName}
              </span>

              {!isWalk && !isTaxi && (
                <span className="text-[11px] text-[#64748B] font-medium">
                  ({getVehicleLabel(activeOption.vehicleType)})
                </span>
              )}

              {isResolving && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#E85B49] font-medium">
                  <Sparkles className="w-3 h-3 motion-safe:animate-pulse" />
                  <span>Buscando ruta...</span>
                </span>
              )}
            </div>

            {/* Caminata */}
            {isWalk && (
              <p className="text-[11px] text-emerald-800/90 mt-1 leading-snug">
                {activeOption.instructions}
              </p>
            )}

            {/* Tramo único o taxi: lista vertical limpia sin flechas huérfanas */}
            {!isWalk && !hasMultiLegs && (
              <div className="mt-1.5 space-y-0.5 text-[11px] text-[#475569]">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-[#64748B] shrink-0 w-10">
                    {isTaxi ? 'Desde:' : 'Sube:'}
                  </span>
                  <span className="font-medium text-[#17243A] leading-snug">
                    {boardingLabel}
                    {!isTaxi &&
                      activeOption.boardingLandmarkHint &&
                      activeOption.boardingLandmarkHint !== activeOption.boardingStop && (
                        <span className="font-normal text-[#64748B]">
                          {' '}
                          ({activeOption.boardingLandmarkHint})
                        </span>
                      )}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-[#64748B] shrink-0 w-10">
                    {isTaxi ? 'Hasta:' : 'Baja:'}
                  </span>
                  <span className="font-medium text-[#17243A] leading-snug">
                    {dropoffLabel}
                    {!isTaxi &&
                      activeOption.dropoffLandmarkHint &&
                      activeOption.dropoffLandmarkHint !== activeOption.dropoffStop && (
                        <span className="font-normal text-[#64748B]">
                          {' '}
                          ({activeOption.dropoffLandmarkHint})
                        </span>
                      )}
                  </span>
                </div>
              </div>
            )}

            {/* Tramos con transbordo: línea de tiempo compacta sin duplicar resumen */}
            {!isWalk && hasMultiLegs && activeOption.routeLegs && (
              <ol className="mt-2 space-y-1.5 border-l border-[#CBD5E1] pl-2.5 ml-1">
                {activeOption.routeLegs.map((leg, legIndex) => (
                  <li key={`${leg.code}-${legIndex}`} className="text-[11px] leading-snug">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: leg.badgeColor ?? '#17243A' }}
                      />
                      <span className="font-bold text-[#17243A]">
                        {leg.routeCode ?? leg.code}
                      </span>
                      <span className="text-[#475569] font-medium">
                        {leg.companyName ?? leg.serviceName}
                      </span>
                    </div>
                    <div className="text-[#64748B] pl-3.5 mt-0.5">
                      {legIndex === 0 ? 'Sube' : 'Transbordo'} en{' '}
                      <span className="text-[#17243A] font-medium">{leg.boardingStop}</span> hasta{' '}
                      <span className="text-[#17243A] font-medium">{leg.dropoffStop}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {/* Alternativa Taxi Directo cuando hay transbordos */}
            {alternatives.length > 1 && (
              <div
                role="group"
                aria-label="Opciones de transporte"
                className="mt-2 inline-flex items-center p-0.5 rounded-lg bg-[#E2E8F0]/60 border border-[#E2E8F0]"
              >
                {alternatives.map((alt) => {
                  const shortLabel =
                    alt.id === 'transit' ? 'Transporte público' : 'Taxi directo';
                  const isActive = selectedAlternativeId === alt.id;
                  return (
                    <button
                      key={alt.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedAlternativeId(alt.id)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17243A] focus-visible:ring-offset-1 ${
                        isActive
                          ? 'bg-white text-[#17243A] shadow-2xs'
                          : 'text-[#64748B] hover:text-[#17243A]'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Aviso si el acceso peatonal no pudo validarse o es aproximado */}
            {activeOption.warning && (
              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-[#64748B]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{activeOption.warning}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tarifa y duración total */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E2E8F0] shrink-0 tabular-nums">
          <span className="text-xs font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 whitespace-nowrap">
            {fareText}
          </span>
          <span className="text-[11px] font-medium text-[#64748B] whitespace-nowrap">
            ~{totalMinutes} min
          </span>
        </div>
      </div>
    </div>
  );
};
