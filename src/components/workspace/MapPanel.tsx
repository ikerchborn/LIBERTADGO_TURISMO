import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Place, TripItinerary } from '../../types/catalog.ts';
import { Locality } from '../../types/geo.ts';
import { getLocality } from '../../utils/geoBoundary.ts';
import { RotateCcw, Plus, Trash2, Star, Layers, Navigation } from 'lucide-react';

interface MapPanelProps {
  trip: TripItinerary;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onAddPlaceToDay?: (place: Place, dayNumber: number) => void;
  onRemoveActivity?: (activityId: string) => void;
}

// Category color map for visual differentiation
const CATEGORY_STYLES: Record<string, { bg: string; icon: string }> = {
  restaurantes: { bg: '#D97706', icon: '🍴' },
  gastronomia: { bg: '#D97706', icon: '🍴' },
  arqueologia: { bg: '#9A3412', icon: '🏛️' },
  playas: { bg: '#0284C7', icon: '🌊' },
  museos: { bg: '#7C3AED', icon: '🎨' },
  atractivos: { bg: '#059669', icon: '⭐' },
  hoteles: { bg: '#4338CA', icon: '🏨' },
};

export const MapPanel: React.FC<MapPanelProps> = ({
  trip,
  places,
  selectedPlace,
  onSelectPlace,
  onAddPlaceToDay,
  onRemoveActivity,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  if (typeof window !== 'undefined' && maplibregl.config) {
    maplibregl.config.WORKER_URL = '/maplibre-gl-worker.mjs';
  }

  const destinationLocality: Locality | undefined = getLocality(trip.destinationId);
  const centerLat = destinationLocality?.coordinates.lat || -8.1118;
  const centerLng = destinationLocality?.coordinates.lng || -79.0287;
  const initialZoom = destinationLocality?.defaultZoom || 14;

  // Initialize MapLibre GL JS
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
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
              'line-width': 5,
              'line-opacity': 0.9,
            },
          });

          // Route main line (Coral #E85B49)
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
              'line-width': 3,
            },
          });
        }

        setMapLoaded(true);
      });

      mapInstanceRef.current = map;

      return () => {
        if (popupRef.current) popupRef.current.remove();
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
      };
    } catch (e) {
      console.warn('MapLibre GL failed to initialize:', e);
    }
  }, [centerLat, centerLng, initialZoom]);

  // Recalculate Route Geometry
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('itinerary-route') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const sortedActivities = [...trip.activities].sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.order - b.order;
    });

    const routeCoordinates: [number, number][] = [];
    sortedActivities.forEach((act) => {
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
  }, [trip.activities, places, mapLoaded, showRoutes]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const activityIndex = trip.activities.findIndex((a) => a.placeId === place.id);
      const isItineraryItem = activityIndex !== -1;
      const activityNumber = isItineraryItem ? activityIndex + 1 : null;

      const categoryStyle = CATEGORY_STYLES[place.category] || {
        bg: '#17243A',
        icon: '📍',
      };

      const el = document.createElement('div');
      el.className = `cursor-pointer transition-transform duration-200 ${
        isSelected ? 'scale-125 z-40' : 'hover:scale-110 z-20'
      }`;

      if (isItineraryItem) {
        // Pin con número de orden coral
        el.innerHTML = `
          <div style="
            background-color: ${isSelected ? '#17243A' : '#E85B49'};
            color: #FFFFFF;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            font-family: var(--font-sans);
            border: 2px solid #FFFFFF;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
            position: relative;
          ">
            ${activityNumber}
            <span style="
              position: absolute;
              bottom: -3px;
              width: 6px;
              height: 6px;
              background-color: ${isSelected ? '#17243A' : '#E85B49'};
              transform: rotate(45deg);
            "></span>
          </div>
        `;
      } else {
        // Pin de catálogo
        el.innerHTML = `
          <div style="
            background-color: ${isSelected ? '#17243A' : categoryStyle.bg};
            color: #FFFFFF;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          ">
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
  }, [places, selectedPlace, trip.activities, mapLoaded, onSelectPlace]);

  // Centrado en el lugar seleccionado
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace) return;

    map.flyTo({
      center: [selectedPlace.coordinates.lng, selectedPlace.coordinates.lat],
      zoom: 15.2,
      essential: true,
      duration: 800,
    });
  }, [selectedPlace]);

  const handleFitAllMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map || places.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    places.forEach((p) => bounds.extend([p.coordinates.lng, p.coordinates.lat]));

    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
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

  return (
    <div className="relative flex-1 h-full min-h-[360px] bg-[#F7F8FA] overflow-hidden flex flex-col select-none">
      <div ref={mapContainerRef} className="w-full h-full relative" />

      {/* Insignia de localidad y botón de ruta */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-xs border border-[#E9EEF4] rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E85B49]" />
          <div>
            <span className="text-xs font-bold text-[#17243A] block leading-tight">
              {trip.destinationName}
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">
              {places.length} lugares · {trip.activities.length} en itinerario
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRoutes(!showRoutes)}
          className="px-2.5 py-1.5 bg-white/95 backdrop-blur-xs border border-[#E9EEF4] rounded-xl text-xs font-medium text-[#17243A] shadow-xs hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
          title={showRoutes ? 'Ocultar ruta' : 'Ver ruta'}
        >
          <Navigation className={`w-3.5 h-3.5 ${showRoutes ? 'text-[#E85B49]' : 'text-[#64748B]'}`} />
          <span className="hidden sm:inline">{showRoutes ? 'Ruta activa' : 'Ruta'}</span>
        </button>
      </div>

      {/* Tarjeta flotante inferior al tocar marcador */}
      {selectedPlace && (
        <div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:max-w-sm z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-white rounded-2xl border border-[#E9EEF4] shadow-lg p-3.5 flex flex-col gap-2.5">
            <div className="flex gap-3">
              <img
                src={selectedPlace.images[0]?.url || ''}
                alt={selectedPlace.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
              />
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

            {/* Acción rápida */}
            <div className="flex items-center justify-between pt-1 border-t border-[#E9EEF4]">
              <button
                type="button"
                onClick={() => onSelectPlace(selectedPlace)}
                className="text-xs text-[#64748B] hover:text-[#17243A] font-medium cursor-pointer"
              >
                Ver ficha completa
              </button>

              {selectedPlaceActivity ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onRemoveActivity) onRemoveActivity(selectedPlaceActivity.id);
                  }}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar</span>
                </button>
              ) : (
                onAddPlaceToDay && (
                  <button
                    type="button"
                    onClick={() => onAddPlaceToDay(selectedPlace, 1)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#D94C3A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Añadir a Día 1</span>
                  </button>
                )
              )}
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
  );
};
