import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);
import { Place, TripItinerary } from '../../types/catalog.ts';
import { Locality } from '../../types/geo.ts';
import { getLocality } from '../../utils/geoBoundary.ts';
import {
  RotateCcw,
  Plus,
  Trash2,
  Star,
  Layers,
  Navigation,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Bookmark,
  X
} from 'lucide-react';
import { PlaceImage } from '../common/PlaceImage.tsx';

interface MapPanelProps {
  trip: TripItinerary;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onAddPlaceToDay?: (place: Place, dayNumber: number) => void;
  onRemoveActivity?: (activityId: string) => void;
  onToggleSavePlace?: (placeId: string) => void;
  selectedDayNumber?: number | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Visual category styling
const CATEGORY_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  restaurantes: { bg: '#D97706', icon: '🍴', label: 'Gastronomía' },
  gastronomia: { bg: '#D97706', icon: '🍴', label: 'Gastronomía' },
  arqueologia: { bg: '#9A3412', icon: '🏛️', label: 'Arqueología' },
  playas: { bg: '#0284C7', icon: '🌊', label: 'Playas' },
  museos: { bg: '#7C3AED', icon: '🎨', label: 'Museos' },
  atractivos: { bg: '#059669', icon: '⭐', label: 'Atractivos' },
  hoteles: { bg: '#4338CA', icon: '🏨', label: 'Hoteles' },
};

export const MapPanel: React.FC<MapPanelProps> = ({
  trip,
  places,
  selectedPlace,
  onSelectPlace,
  onAddPlaceToDay,
  onRemoveActivity,
  onToggleSavePlace,
  selectedDayNumber = null,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  const destinationLocality: Locality | undefined = getLocality(trip.destinationId);
  const centerLat = destinationLocality?.coordinates.lat || -8.1118;
  const centerLng = destinationLocality?.coordinates.lng || -79.0287;
  const initialZoom = destinationLocality?.defaultZoom || 14;

  const savedIds = useMemo(() => new Set(trip.savedPlaceIds || []), [trip.savedPlaceIds]);

  // Initialize MapLibre GL JS
  const initMap = useCallback(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if any
    if (mapInstanceRef.current) {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    setMapError(null);
    setMapLoaded(false);

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> | LibertadGO',
            },
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [centerLng, centerLat],
        zoom: initialZoom,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('error', (e) => {
        if (e && e.error) {
          const err = e.error as { status?: number; message?: string };
          if (err.status === 403) {
            console.warn('[MapLibre] Tile access warning:', err.message);
          }
        }
      });

      map.on('load', () => {
        if (!map.getSource('itinerary-route')) {
          map.addSource('itinerary-route', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          // Route casing (white line)
          map.addLayer({
            id: 'itinerary-route-casing',
            type: 'line',
            source: 'itinerary-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#FFFFFF',
              'line-width': 6,
              'line-opacity': 0.95,
            },
          });

          // Route line (Coral #E85B49)
          map.addLayer({
            id: 'itinerary-route-line',
            type: 'line',
            source: 'itinerary-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#E85B49',
              'line-width': 3.5,
              'line-dasharray': [1, 0],
            },
          });
        }

        setMapLoaded(true);
      });

      mapInstanceRef.current = map;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al inicializar el mapa';
      console.error('[MapLibre] Error:', msg);
      setMapError(msg);
    }
  }, [centerLat, centerLng, initialZoom]);

  useEffect(() => {
    initMap();
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  // ResizeObserver to resize map smoothly whenever dimensions change
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current && mapLoaded) {
        mapInstanceRef.current.resize();
      }
    });

    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, [mapLoaded]);

  // Re-trigger resize when collapse state changes
  useEffect(() => {
    if (!isCollapsed && mapInstanceRef.current) {
      requestAnimationFrame(() => {
        mapInstanceRef.current?.resize();
      });
      const timer = setTimeout(() => {
        mapInstanceRef.current?.resize();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  // Recalculate Route Geometry (Day-aware)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('itinerary-route') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    // Filter by selectedDayNumber if active, otherwise whole trip
    const relevantActivities = trip.activities
      .filter((a) => (selectedDayNumber ? a.dayNumber === selectedDayNumber : true))
      .sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return a.order - b.order;
      });

    const routeCoordinates: [number, number][] = [];
    relevantActivities.forEach((act) => {
      if (act.place?.coordinates) {
        routeCoordinates.push([act.place.coordinates.lng, act.place.coordinates.lat]);
      } else {
        const found = places.find((p) => p.id === act.placeId);
        if (found) {
          routeCoordinates.push([found.coordinates.lng, found.coordinates.lat]);
        }
      }
    });

    if (routeCoordinates.length >= 2 && showRoutes) {
      source.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
            properties: {},
          },
        ],
      });
    } else {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [trip.activities, places, mapLoaded, showRoutes, selectedDayNumber]);

  // ==========================================
  // MARCADORES DIFERENCIADOS POR NIVEL VISUAL
  // 1) Actividades de Itinerario: Círculo Coral #E85B49 con número correlativo blanco
  // 2) Lugares Guardados (Wishlist): Círculo Azul #17243A con borde Ámbar #D97706 e icono 🔖
  // 3) Marcadores del Catálogo General: Pines sutiles con icono de categoría
  // ==========================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const isSaved = savedIds.has(place.id);

      // Check if place is in trip activities
      const activityIndex = trip.activities.findIndex((a) => a.placeId === place.id);
      const isItineraryItem = activityIndex !== -1;
      const activity = isItineraryItem ? trip.activities[activityIndex] : null;

      // Day filtering highlight
      const matchesActiveDay = selectedDayNumber
        ? activity?.dayNumber === selectedDayNumber
        : true;

      const categoryStyle = CATEGORY_STYLES[place.category] || {
        bg: '#17243A',
        icon: '📍',
        label: 'Lugar',
      };

      const el = document.createElement('div');
      el.className = `cursor-pointer transition-transform duration-200 select-none ${
        isSelected ? 'scale-125 z-50' : 'hover:scale-115 z-20'
      }`;

      if (isItineraryItem && activity) {
        // TIPO 1: ACTIVIDAD DE ITINERARIO (Máxima jerarquía)
        const dayOrderNumber = activity.order;
        const opacity = !matchesActiveDay && selectedDayNumber ? '0.45' : '1.0';

        el.innerHTML = `
          <div style="
            background: ${isSelected ? '#17243A' : '#E85B49'};
            color: #FFFFFF;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 13px;
            font-family: system-ui, -apple-system, sans-serif;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(232, 91, 73, 0.45);
            position: relative;
            opacity: ${opacity};
            transform: ${isSelected ? 'scale(1.15)' : 'none'};
          " title="${place.name} · Día ${activity.dayNumber} (#${dayOrderNumber})">
            ${dayOrderNumber}
            <span style="
              position: absolute;
              bottom: -4px;
              width: 8px;
              height: 8px;
              background: ${isSelected ? '#17243A' : '#E85B49'};
              transform: rotate(45deg);
              border-bottom: 2px solid #FFFFFF;
              border-right: 2px solid #FFFFFF;
            "></span>
          </div>
        `;
      } else if (isSaved) {
        // TIPO 2: LUGAR GUARDADO (WISHLIST) (Borde ámbar + fondo azul marino + bookmark)
        el.innerHTML = `
          <div style="
            background: #17243A;
            color: #FBBF24;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            border: 2.5px solid #D97706;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
            position: relative;
          " title="${place.name} (En tu lista para visitar)">
            🔖
          </div>
        `;
      } else {
        // TIPO 3: CATÁLOGO GENERAL (Sutil y no invasivo)
        el.innerHTML = `
          <div style="
            background: ${isSelected ? '#17243A' : '#FFFFFF'};
            color: ${isSelected ? '#FFFFFF' : '#17243A'};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            border: 2px solid ${categoryStyle.bg};
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          " title="${place.name} (${categoryStyle.label})">
            <span>${categoryStyle.icon}</span>
          </div>
        `;
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPlace(place);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [places, selectedPlace, trip.activities, savedIds, selectedDayNumber, mapLoaded, onSelectPlace]);

  // Centrado suave en el lugar seleccionado
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace) return;

    map.flyTo({
      center: [selectedPlace.coordinates.lng, selectedPlace.coordinates.lat],
      zoom: 15.4,
      essential: true,
      duration: 700,
    });
  }, [selectedPlace]);

  const handleFitAllMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map || places.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    places.forEach((p) => bounds.extend([p.coordinates.lng, p.coordinates.lat]));

    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 16,
      duration: 800,
    });
  };

  const handleResetCenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [centerLng, centerLat],
      zoom: initialZoom,
      duration: 600,
    });
  };

  const selectedPlaceActivity = useMemo(() => {
    if (!selectedPlace) return null;
    return trip.activities.find((a) => a.placeId === selectedPlace.id);
  }, [selectedPlace, trip.activities]);

  const isSelectedSaved = useMemo(() => {
    if (!selectedPlace) return false;
    return savedIds.has(selectedPlace.id);
  }, [selectedPlace, savedIds]);

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden flex select-none">
      {/* 
        Barra de Mapa Contraído (visible en Desktop cuando isCollapsed es true)
        Permite al usuario expandirlo rápidamente desde el borde
      */}
      {isCollapsed && (
        <div className="hidden lg:flex flex-col items-center justify-between py-4 px-2 w-12 bg-white border-l border-[#E9EEF4] h-full shrink-0 select-none">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 hover:bg-[#F7F8FA] text-[#17243A] rounded-xl border border-[#E9EEF4] transition-colors cursor-pointer"
            title="Expandir mapa"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="[writing-mode:vertical-rl] text-xs font-semibold text-[#64748B] tracking-wider uppercase rotate-180">
            Mapa de {trip.destinationName}
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#E85B49]" />
        </div>
      )}

      {/* Contenedor Cartográfico Persistente */}
      <div
        className={`relative flex-1 h-full min-h-0 bg-[#E9EEF4]/30 overflow-hidden ${
          isCollapsed ? 'hidden' : 'flex flex-col'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full relative" />

        {/* Error Banner si MapLibre no pudo renderizar */}
        {mapError && (
          <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-md z-30 bg-rose-50 border border-rose-200 rounded-xl p-3 shadow-md flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 flex-1">
              <span className="font-bold block">Error al cargar cartografía:</span>
              <span>{mapError}</span>
            </div>
            <button
              type="button"
              onClick={initMap}
              className="p-1 text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
              title="Reintentar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 
          Insignia Superior del Mapa:
          Diferencia con total claridad:
          1) Total de lugares en catálogo,
          2) Actividades en itinerario,
          3) Lugares guardados por visitar
        */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-xs border border-[#E9EEF4] rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E85B49] shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#17243A] block leading-tight">
                {trip.destinationName}
                {selectedDayNumber ? ` · Día ${selectedDayNumber}` : ''}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono">
                {places.length} en catálogo · <strong className="text-[#E85B49]">{trip.activities.length}</strong> en ruta · <strong className="text-[#D97706]">{trip.savedPlaceIds?.length || 0}</strong> por visitar
              </span>
            </div>
          </div>

          {/* Toggle de trazado de ruta */}
          <button
            type="button"
            onClick={() => setShowRoutes(!showRoutes)}
            className="px-2.5 py-1.5 bg-white/95 backdrop-blur-xs border border-[#E9EEF4] rounded-xl text-xs font-medium text-[#17243A] shadow-xs hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
            title={showRoutes ? 'Ocultar línea de ruta' : 'Mostrar línea de ruta'}
          >
            <Navigation className={`w-3.5 h-3.5 ${showRoutes ? 'text-[#E85B49]' : 'text-[#64748B]'}`} />
            <span className="hidden sm:inline">{showRoutes ? 'Ruta activa' : 'Ruta'}</span>
          </button>
        </div>

        {/* Leyenda Visual de Marcadores (esquina superior derecha, discreta) */}
        <div className="hidden xl:flex absolute top-3 right-14 z-10 bg-white/90 backdrop-blur-xs border border-[#E9EEF4] rounded-xl px-2.5 py-1 shadow-2xs items-center gap-3 text-[10px] text-[#64748B]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E85B49]" />
            <span>Itinerario</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#17243A] border border-[#D97706]" />
            <span>Por visitar</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
            <span>Catálogo</span>
          </div>
        </div>

        {/* 
          Tarjeta flotante inferior al seleccionar un marcador:
          Con PlaceImage auténtico y acciones directas
        */}
        {selectedPlace && (
          <div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:max-w-sm z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="bg-white rounded-2xl border border-[#E9EEF4] shadow-lg p-3.5 flex flex-col gap-2.5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <PlaceImage
                      src={selectedPlace.images[0]?.url}
                      alt={selectedPlace.name}
                      category={selectedPlace.category}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-[#64748B] uppercase font-semibold">
                      <span>{selectedPlace.category}</span>
                      {selectedPlaceActivity && (
                        <span className="text-[#E85B49] font-bold">
                          · Día {selectedPlaceActivity.dayNumber}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#17243A] truncate mt-0.5">
                      {selectedPlace.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {selectedPlace.address}
                    </p>
                    {selectedPlace.rating && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{selectedPlace.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlace(null as unknown as Place)}
                  className="p-1 text-[#64748B] hover:text-[#17243A] -mr-1 -mt-1 cursor-pointer"
                  title="Cerrar ficha flotante"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Acciones directas sobre el lugar seleccionado */}
              <div className="flex items-center justify-between pt-1.5 border-t border-[#E9EEF4]">
                {onToggleSavePlace && (
                  <button
                    type="button"
                    onClick={() => onToggleSavePlace(selectedPlace.id)}
                    className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#17243A] cursor-pointer"
                    title={isSelectedSaved ? 'Quitar de lista' : 'Guardar en Por visitar'}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isSelectedSaved ? 'fill-[#D97706] text-[#D97706]' : ''
                      }`}
                    />
                    <span>{isSelectedSaved ? 'Guardado' : 'Guardar'}</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  {selectedPlaceActivity ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onRemoveActivity) onRemoveActivity(selectedPlaceActivity.id);
                      }}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Quitar de Día {selectedPlaceActivity.dayNumber}</span>
                    </button>
                  ) : (
                    onAddPlaceToDay && (
                      <button
                        type="button"
                        onClick={() => onAddPlaceToDay(selectedPlace, selectedDayNumber || 1)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#D94C3A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Añadir a Día {selectedDayNumber || 1}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Herramientas de ajuste en la esquina inferior derecha */}
        <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleFitAllMarkers}
            className="p-2 bg-white hover:bg-[#F7F8FA] text-[#17243A] rounded-xl border border-[#E9EEF4] shadow-xs transition-colors cursor-pointer"
            title="Ajustar vista a todos los lugares"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetCenter}
            className="p-2 bg-white hover:bg-[#F7F8FA] text-[#17243A] rounded-xl border border-[#E9EEF4] shadow-xs transition-colors cursor-pointer"
            title={`Centrar en ${trip.destinationName}`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
