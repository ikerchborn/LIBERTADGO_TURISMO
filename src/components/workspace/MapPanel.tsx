import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);
import { Place, TripItinerary } from '../../types/catalog.ts';
import { Locality } from '../../types/geo.ts';
import { getLocality } from '../../utils/geoBoundary.ts';
import { generateDayList, TripDayItem } from '../../utils/dateUtils.ts';
import {
  Search,
  SlidersHorizontal,
  Navigation,
  MapPin,
  Star,
  Bookmark,
  Plus,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Check,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ShieldCheck,
  Phone,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { PlaceImage } from '../common/PlaceImage.tsx';

interface MapPanelProps {
  trip: TripItinerary;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  onAddPlaceToDay?: (place: Place, dayNumber: number) => void;
  onRemoveActivity?: (activityId: string) => void;
  onToggleSavePlace?: (placeId: string) => void;
  selectedDayNumber?: number | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileTab?: 'content' | 'map';
  onSwitchToContent?: () => void;
}

// Categorías del catálogo con iconos y colores representativos
const CATEGORY_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  restaurantes: { bg: '#D97706', icon: '🍴', label: 'Gastronomía' },
  gastronomia: { bg: '#D97706', icon: '🍴', label: 'Gastronomía' },
  arqueologia: { bg: '#9A3412', icon: '🏛️', label: 'Arqueología' },
  playas: { bg: '#0284C7', icon: '🌊', label: 'Playas' },
  museos: { bg: '#7C3AED', icon: '🎨', label: 'Museos' },
  atractivos: { bg: '#059669', icon: '⭐', label: 'Atractivos' },
  hoteles: { bg: '#4338CA', icon: '🏨', label: 'Hoteles' },
};

const FILTER_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'todas', label: 'Todos', icon: '✨' },
  { id: 'restaurantes', label: 'Restaurantes', icon: '🍴' },
  { id: 'atractivos', label: 'Atracciones', icon: '⭐' },
  { id: 'arqueologia', label: 'Arqueología', icon: '🏛️' },
  { id: 'playas', label: 'Playas', icon: '🌊' },
  { id: 'museos', label: 'Museos', icon: '🎨' },
  { id: 'hoteles', label: 'Hoteles', icon: '🏨' },
];

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
  mobileTab = 'content',
  onSwitchToContent,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  // Estados de Búsqueda y Filtros tipo Google Maps
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);
  const [onlySavedFilter, setOnlySavedFilter] = useState<boolean>(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [onlyMinceturFilter, setOnlyMinceturFilter] = useState<boolean>(false);

  // Filtro geográfico "Buscar en esta zona"
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState<boolean>(false);
  const [isAreaFilterActive, setIsAreaFilterActive] = useState<boolean>(false);
  const lastCenterRef = useRef<[number, number] | null>(null);

  // Geolocalización del usuario
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [userLocationMessage, setUserLocationMessage] = useState<string | null>(null);

  // Estado de Ficha Inferior (Bottom Sheet expandible)
  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(false);
  const [quickDayPickerOpen, setQuickDayPickerOpen] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const destinationLocality: Locality | undefined = getLocality(trip.destinationId);
  const centerLat = destinationLocality?.coordinates.lat || -8.1118;
  const centerLng = destinationLocality?.coordinates.lng || -79.0287;
  const initialZoom = destinationLocality?.defaultZoom || 14;

  const savedIds = useMemo(() => new Set(trip.savedPlaceIds || []), [trip.savedPlaceIds]);

  const dayItems: TripDayItem[] = useMemo(() => {
    return generateDayList(trip.startDate, trip.totalDays);
  }, [trip.startDate, trip.totalDays]);

  // Lugares filtrados reactivamente
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      // 1. Filtro por categoría principal
      if (selectedCategory !== 'todas' && p.category !== selectedCategory) {
        return false;
      }

      // 2. Filtro de búsqueda por texto (nombre, dirección, tags, subcategoría)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesSubcat = p.subcategory?.toLowerCase().includes(q);
        const matchesAddress = p.address.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesName && !matchesCategory && !matchesSubcat && !matchesAddress && !matchesTags) {
          return false;
        }
      }

      // 3. Filtros avanzados
      if (onlySavedFilter && !savedIds.has(p.id)) {
        return false;
      }

      if (minRatingFilter > 0 && (!p.rating || p.rating < minRatingFilter)) {
        return false;
      }

      if (onlyMinceturFilter && p.verification.verificationLevel !== 'official_mincetur') {
        return false;
      }

      // 4. Filtro por límites geográficos ("Buscar en esta zona")
      if (isAreaFilterActive && mapInstanceRef.current) {
        const bounds = mapInstanceRef.current.getBounds();
        if (!bounds.contains([p.coordinates.lng, p.coordinates.lat])) {
          return false;
        }
      }

      return true;
    });
  }, [
    places,
    selectedCategory,
    searchQuery,
    onlySavedFilter,
    savedIds,
    minRatingFilter,
    onlyMinceturFilter,
    isAreaFilterActive,
  ]);

  // Sugerencias de búsqueda en tiempo real (Top 5)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !isSearchFocused) return [];
    const q = searchQuery.toLowerCase().trim();
    return places
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [places, searchQuery, isSearchFocused]);

  // Inicializar MapLibre GL JS
  const initMap = useCallback(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
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

      map.on('error', (e) => {
        if (e && e.error) {
          const err = e.error as { status?: number; message?: string };
          if (err.status === 403) {
            console.warn('[MapLibre] Tile access warning:', err.message);
          }
        }
      });

      // Detección de desplazamiento del mapa para "Buscar en esta zona"
      map.on('moveend', () => {
        const center = map.getCenter();
        if (lastCenterRef.current) {
          const [lastLng, lastLat] = lastCenterRef.current;
          const dist = Math.hypot(center.lng - lastLng, center.lat - lastLat);
          if (dist > 0.0035) {
            setShowSearchAreaBtn(true);
          }
        } else {
          lastCenterRef.current = [center.lng, center.lat];
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
      const msg = err instanceof Error ? err.message : 'Error al inicializar el mapa';
      console.error('[MapLibre] Error:', msg);
      setMapError(msg);
    }
  }, [centerLat, centerLng, initialZoom]);

  useEffect(() => {
    initMap();
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  // ResizeObserver para redimensionar el canvas cuando cambia el tamaño del contenedor
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    });

    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Redimensionar el mapa cuando se activa la pestaña en móvil
  useEffect(() => {
    if (mobileTab === 'map' && mapInstanceRef.current) {
      requestAnimationFrame(() => {
        mapInstanceRef.current?.resize();
      });
      const timer = setTimeout(() => {
        mapInstanceRef.current?.resize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileTab]);

  // Redimensionar cuando cambia el estado de colapso en escritorio
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

  // Actualizar trazado de ruta del itinerario
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('itinerary-route') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

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
  // RENDERIZADO REACTIVO DE MARCADORES (FILTRADOS)
  // ==========================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const isSaved = savedIds.has(place.id);

      const activityIndex = trip.activities.findIndex((a) => a.placeId === place.id);
      const isItineraryItem = activityIndex !== -1;
      const activity = isItineraryItem ? trip.activities[activityIndex] : null;

      const matchesActiveDay = selectedDayNumber
        ? activity?.dayNumber === selectedDayNumber
        : true;

      const categoryStyle = CATEGORY_STYLES[place.category] || {
        bg: '#17243A',
        icon: '📍',
        label: 'Lugar',
      };

      const el = document.createElement('div');
      el.className = 'libertadgo-map-marker-hitbox';
      el.style.width = '44px';
      el.style.height = '44px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.userSelect = 'none';
      el.style.pointerEvents = 'auto';
      el.style.zIndex = isSelected ? '50' : '20';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `${place.name} · ${place.category}`);

      const inner = document.createElement('div');
      inner.className = 'libertadgo-map-marker-badge';
      inner.style.transition = 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1), filter 160ms ease';
      inner.style.display = 'flex';
      inner.style.alignItems = 'center';
      inner.style.justifyContent = 'center';
      inner.style.pointerEvents = 'none';

      if (isItineraryItem && activity) {
        // TIPO 1: ACTIVIDAD DE ITINERARIO (Coral #E85B49 con número de orden)
        const dayOrderNumber = activity.order;
        const opacity = !matchesActiveDay && selectedDayNumber ? '0.45' : '1.0';
        const bg = isSelected ? '#17243A' : '#E85B49';

        inner.innerHTML = `
          <div style="
            background: ${bg};
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
            box-shadow: ${
              isSelected
                ? '0 0 0 4px rgba(232, 91, 73, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 4px 10px rgba(232, 91, 73, 0.45)'
            };
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
              background: ${bg};
              transform: rotate(45deg);
              border-bottom: 2px solid #FFFFFF;
              border-right: 2px solid #FFFFFF;
            "></span>
          </div>
        `;
      } else if (isSaved) {
        // TIPO 2: LUGAR GUARDADO (Azul marino con borde ámbar e icono 🔖)
        inner.innerHTML = `
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
            box-shadow: ${
              isSelected
                ? '0 0 0 4px rgba(217, 119, 6, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 3px 8px rgba(0, 0, 0, 0.25)'
            };
            position: relative;
            transform: ${isSelected ? 'scale(1.15)' : 'none'};
          " title="${place.name} (En tu lista para visitar)">
            🔖
          </div>
        `;
      } else {
        // TIPO 3: CATÁLOGO GENERAL (Blanco con icono de categoría)
        inner.innerHTML = `
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
            box-shadow: ${
              isSelected
                ? '0 0 0 4px rgba(232, 91, 73, 0.35), 0 3px 8px rgba(0, 0, 0, 0.25)'
                : '0 2px 6px rgba(0, 0, 0, 0.15)'
            };
            transform: ${isSelected ? 'scale(1.15)' : 'none'};
          " title="${place.name} (${categoryStyle.label})">
            <span>${categoryStyle.icon}</span>
          </div>
        `;
      }

      el.appendChild(inner);

      // Prevenir que DragPan de MapLibre intercepte el clic
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('mousedown', (e) => e.stopPropagation());

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPlace(place);
        setIsCardExpanded(false);
      });

      el.addEventListener('mouseenter', () => {
        if (!isSelected) {
          inner.style.transform = 'scale(1.18)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (!isSelected) {
          inner.style.transform = 'none';
        }
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: isItineraryItem ? 'bottom' : 'center',
      })
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filteredPlaces, selectedPlace, savedIds, trip.activities, selectedDayNumber, onSelectPlace, mapLoaded]);

  // Si hay un lugar seleccionado, asegurar que el mapa lo enfoque suavemente
  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current || !mapLoaded) return;
    mapInstanceRef.current.easeTo({
      center: [selectedPlace.coordinates.lng, selectedPlace.coordinates.lat],
      zoom: Math.max(mapInstanceRef.current.getZoom(), 15),
      duration: 500,
    });
  }, [selectedPlace, mapLoaded]);

  // Geolocalización del usuario en tiempo real
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setUserLocationMessage('Tu navegador no soporta geolocalización.');
      setTimeout(() => setUserLocationMessage(null), 3000);
      return;
    }

    setIsLocatingUser(true);
    setUserLocationMessage('Obteniendo ubicación...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingUser(false);
        const { latitude, longitude } = position.coords;

        const map = mapInstanceRef.current;
        if (map) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const el = document.createElement('div');
          el.className = 'libertadgo-user-pulse-marker';
          el.innerHTML = `
            <div style="position: relative; width: 22px; height: 22px; pointer-events: none;">
              <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; inset: 0; border-radius: 50%; background: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
            </div>
          `;

          userMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);

          map.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 800,
          });

          setUserLocationMessage('Ubicación localizada con éxito');
          setTimeout(() => setUserLocationMessage(null), 2500);
        }
      },
      (err) => {
        setIsLocatingUser(false);
        const msg =
          err.code === 1
            ? 'Permiso de ubicación denegado.'
            : 'No fue posible obtener tu ubicación.';
        setUserLocationMessage(msg);
        setTimeout(() => setUserLocationMessage(null), 3500);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Controles de zoom
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut({ duration: 300 });
  };

  // Ajustar vista a todos los marcadores visibles
  const handleFitAllMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map || filteredPlaces.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    filteredPlaces.forEach((p) => {
      bounds.extend([p.coordinates.lng, p.coordinates.lat]);
    });

    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 60, right: 60 },
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
    setIsAreaFilterActive(false);
    setShowSearchAreaBtn(false);
  };

  // Ejecutar búsqueda por límites del mapa ("Buscar en esta zona")
  const handleSearchInCurrentArea = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const center = map.getCenter();
    lastCenterRef.current = [center.lng, center.lat];
    setIsAreaFilterActive(true);
    setShowSearchAreaBtn(false);
  };

  // Añadir lugar a un día específico con feedback visual
  const handleAddPlaceWithFeedback = (place: Place, dayNumber: number) => {
    if (onAddPlaceToDay) {
      onAddPlaceToDay(place, dayNumber);
      setFeedbackNotice(`✓ Añadido al Día ${dayNumber}`);
      setTimeout(() => setFeedbackNotice(null), 2500);
    }
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
      {/* Barra de Mapa Contraído (visible en Desktop cuando isCollapsed es true) */}
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
          <div className="absolute top-16 left-3 right-3 sm:right-auto sm:max-w-md z-30 bg-rose-50 border border-rose-200 rounded-xl p-3 shadow-md flex items-start gap-2.5">
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

        {/* ============================================================ */}
        {/* BUSCADOR FLOTANTE TIPO GOOGLE MAPS + FILTROS DE CATEGORÍA    */}
        {/* ============================================================ */}
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 max-w-lg pointer-events-none">
          {/* Barra de Búsqueda Flotante */}
          <div className="relative pointer-events-auto">
            <div className="flex items-center bg-white rounded-2xl shadow-md border border-[#E2E8F0] px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#E85B49]/20 focus-within:border-[#E85B49]">
              <Search className="w-4 h-4 text-[#64748B] shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Buscar restaurantes, playas, museos..."
                className="w-full text-xs sm:text-sm text-[#17243A] placeholder:text-[#94A3B8] bg-transparent outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-[#94A3B8] hover:text-[#17243A] cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="h-4 w-px bg-[#E2E8F0] mx-2" />

              {/* Botón de Filtros Avanzados (Sliders) */}
              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                  onlySavedFilter || minRatingFilter > 0 || onlyMinceturFilter
                    ? 'bg-[#E85B49] text-white'
                    : 'text-[#64748B] hover:text-[#17243A] hover:bg-[#F1F5F9]'
                }`}
                title="Filtros avanzados"
                aria-label="Filtros avanzados"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(onlySavedFilter || minRatingFilter > 0 || onlyMinceturFilter) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#17243A] border-2 border-white" />
                )}
              </button>
            </div>

            {/* Menú de Sugerencias en tiempo real */}
            {searchSuggestions.length > 0 && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1.5 space-y-0.5">
                  {searchSuggestions.map((sug) => {
                    const style = CATEGORY_STYLES[sug.category];
                    const inTrip = trip.activities.find((a) => a.placeId === sug.id);
                    return (
                      <div
                        key={sug.id}
                        onMouseDown={() => {
                          onSelectPlace(sug);
                          setSearchQuery(sug.name);
                          setIsSearchFocused(false);
                          mapInstanceRef.current?.flyTo({
                            center: [sug.coordinates.lng, sug.coordinates.lat],
                            zoom: 16,
                            duration: 700,
                          });
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-sm shrink-0">{style?.icon || '📍'}</span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-[#17243A] block truncate">
                              {sug.name}
                            </span>
                            <span className="text-[11px] text-[#64748B] block truncate">
                              {sug.address.split(',')[0]} · {sug.localityName}
                            </span>
                          </div>
                        </div>

                        {inTrip && (
                          <span className="text-[10px] font-semibold text-white bg-[#E85B49] px-1.5 py-0.5 rounded shrink-0 ml-2">
                            Día {inTrip.dayNumber}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Carrusel Desplazable de Filtros por Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 pointer-events-auto">
            {FILTER_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#17243A] text-white ring-2 ring-[#17243A]/20'
                      : 'bg-white/95 text-[#475569] hover:bg-white hover:text-[#0F172A] border border-[#E2E8F0]/80'
                  }`}
                >
                  <span className="text-[11px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Estado de Filtro de Zona Activo */}
          {isAreaFilterActive && (
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="px-2.5 py-1 text-[11px] font-medium bg-[#17243A] text-white rounded-lg shadow-xs flex items-center gap-1.5">
                <span>Filtro de zona activo ({filteredPlaces.length} lugares)</span>
                <button
                  type="button"
                  onClick={() => setIsAreaFilterActive(false)}
                  className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
                  title="Ver todos los lugares"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Botón Flotante "Buscar en esta zona" (Aparece cuando el usuario desplaza el mapa) */}
        {showSearchAreaBtn && !isAreaFilterActive && (
          <div className="absolute top-28 sm:top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={handleSearchInCurrentArea}
              className="px-3.5 py-1.5 bg-white text-[#17243A] hover:bg-[#F8FAFC] active:scale-95 text-xs font-bold rounded-full shadow-md border border-[#E2E8F0] flex items-center gap-1.5 transition-transform cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#E85B49]" />
              <span>Buscar en esta zona</span>
            </button>
          </div>
        )}

        {/* Notificación flotante de ubicación del usuario */}
        {userLocationMessage && (
          <div className="absolute top-28 sm:top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in duration-150">
            <div className="px-3 py-1.5 bg-[#17243A] text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E85B49]" />
              <span>{userLocationMessage}</span>
            </div>
          </div>
        )}

        {/* Indicador de estado vacío si no hay resultados */}
        {filteredPlaces.length === 0 && mapLoaded && (
          <div className="absolute top-36 left-1/2 -translate-x-1/2 z-10 pointer-events-auto animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xs border border-[#E2E8F0] rounded-xl px-3.5 py-2 shadow-md text-xs text-[#64748B] flex items-center gap-2">
              <span>No hay lugares que coincidan con los filtros.</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todas');
                  setSearchQuery('');
                  setOnlySavedFilter(false);
                  setMinRatingFilter(0);
                  setOnlyMinceturFilter(false);
                  setIsAreaFilterActive(false);
                }}
                className="font-bold text-[#E85B49] hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FICHA INFERIOR DE LUGARES (EXPANDIBLE / COMPACTA)            */}
        {/* ============================================================ */}
        {selectedPlace && (
          <div
            className={`absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-30 transition-all duration-300 ease-in-out ${
              isCardExpanded ? 'max-h-[80vh]' : 'max-h-56'
            }`}
          >
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden flex flex-col">
              {/* Barra de agarre para arrastrar o alternar estado expandido */}
              <div
                onClick={() => setIsCardExpanded(!isCardExpanded)}
                className="w-full py-1.5 flex items-center justify-center cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                title={isCardExpanded ? 'Contraer ficha' : 'Expandir ficha'}
              >
                <div className="w-9 h-1 rounded-full bg-slate-300" />
              </div>

              {/* Mensaje de confirmación visual */}
              {feedbackNotice && (
                <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 border-b border-emerald-100 flex items-center justify-between font-semibold animate-in fade-in duration-150">
                  <span>{feedbackNotice}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              )}

              {/* MODO EXPANDIDO */}
              {isCardExpanded ? (
                <div className="p-4 space-y-3.5 overflow-y-auto max-h-[72vh]">
                  {/* Cabecera expandida */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#E85B49] uppercase tracking-wider block">
                        {selectedPlace.category} · {selectedPlace.localityName}
                      </span>
                      <h3 className="text-base font-bold font-display text-[#17243A] leading-snug">
                        {selectedPlace.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsCardExpanded(false)}
                        className="p-1 text-[#64748B] hover:text-[#17243A] rounded cursor-pointer"
                        title="Contraer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectPlace(null)}
                        className="p-1 text-[#64748B] hover:text-[#17243A] rounded cursor-pointer"
                        title="Cerrar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Imagen completa */}
                  <div className="relative h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <PlaceImage
                      src={selectedPlace.images[0]?.url}
                      alt={selectedPlace.name}
                      category={selectedPlace.category}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Metadatos (Calificación y MINCETUR) */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {selectedPlace.rating && (
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{selectedPlace.rating}</span>
                          {selectedPlace.reviewsCount && (
                            <span className="text-[#64748B] font-normal">
                              ({selectedPlace.reviewsCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-[#27856C] bg-[#27856C]/10 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {selectedPlace.verification.verificationLevel === 'official_mincetur'
                        ? 'MINCETUR Oficial'
                        : 'Verificado'}
                    </span>
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {selectedPlace.fullDescription || selectedPlace.shortDescription}
                  </p>

                  {/* Dirección y Teléfono */}
                  <div className="pt-2 border-t border-[#E9EEF4] space-y-1.5 text-xs text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#E85B49] shrink-0" />
                      <span>{selectedPlace.address}</span>
                    </div>
                    {selectedPlace.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                        <span>{selectedPlace.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Asignación directa a días del viaje */}
                  <div className="pt-3 border-t border-[#E9EEF4] space-y-2">
                    <span className="text-xs font-bold text-[#17243A] block">
                      Organizar en el Itinerario:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {dayItems.map((d) => {
                        const inThisDay = trip.activities.some(
                          (a) => a.placeId === selectedPlace.id && a.dayNumber === d.dayNumber
                        );
                        return (
                          <button
                            key={d.dayNumber}
                            type="button"
                            onClick={() => {
                              if (inThisDay) {
                                const act = trip.activities.find(
                                  (a) => a.placeId === selectedPlace.id && a.dayNumber === d.dayNumber
                                );
                                if (act && onRemoveActivity) {
                                  onRemoveActivity(act.id);
                                  setFeedbackNotice(`Eliminado del Día ${d.dayNumber}`);
                                  setTimeout(() => setFeedbackNotice(null), 2000);
                                }
                              } else {
                                handleAddPlaceWithFeedback(selectedPlace, d.dayNumber);
                              }
                            }}
                            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                              inThisDay
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-[#F8FAFC] text-[#17243A] hover:bg-[#E85B49] hover:text-white border border-[#E2E8F0]'
                            }`}
                          >
                            <span>Día {d.dayNumber}</span>
                            <span className="text-[10px] font-normal opacity-80">{d.weekdayShort}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Botón para ver ficha completa en Plan */}
                  {onSwitchToContent && (
                    <button
                      type="button"
                      onClick={() => onSwitchToContent()}
                      className="w-full py-2 text-xs font-semibold text-[#17243A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Abrir ficha completa en el Planificador →
                    </button>
                  )}
                </div>
              ) : (
                /* MODO COMPACTO (Default) */
                <div className="p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setIsCardExpanded(true)}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                        <PlaceImage
                          src={selectedPlace.images[0]?.url}
                          alt={selectedPlace.name}
                          category={selectedPlace.category}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] uppercase font-semibold">
                          <span>{selectedPlace.category}</span>
                          {selectedPlaceActivity && (
                            <span className="text-[#E85B49] font-bold">
                              · Día {selectedPlaceActivity.dayNumber}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-[#17243A] truncate mt-0.5 leading-snug">
                          {selectedPlace.name}
                        </h4>

                        <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                          {selectedPlace.address.split(',')[0]}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          {selectedPlace.rating && (
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{selectedPlace.rating}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-[#27856C] bg-[#27856C]/10 px-1.5 py-0.2 rounded font-medium">
                            {selectedPlace.verification.verificationLevel === 'official_mincetur'
                              ? 'MINCETUR'
                              : 'Verificado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 -mt-1">
                      <button
                        type="button"
                        onClick={() => setIsCardExpanded(true)}
                        className="p-1 text-[#64748B] hover:text-[#17243A] cursor-pointer"
                        title="Ver detalles completos"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectPlace(null)}
                        className="p-1 text-[#64748B] hover:text-[#17243A] cursor-pointer"
                        title="Cerrar ficha"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Acciones directas sobre el lugar seleccionado */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs">
                    {/* Botón Guardar en Wishlist */}
                    {onToggleSavePlace && (
                      <button
                        type="button"
                        onClick={() => onToggleSavePlace(selectedPlace.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          isSelectedSaved
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#17243A]'
                        }`}
                        title={isSelectedSaved ? 'Quitar de guardados' : 'Guardar en Por visitar'}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isSelectedSaved ? 'fill-[#D97706] text-[#D97706]' : ''
                          }`}
                        />
                        <span>{isSelectedSaved ? 'Guardado' : 'Guardar'}</span>
                      </button>
                    )}

                    {/* Botón Añadir a mi viaje / Selector rápido de día */}
                    <div className="flex items-center gap-1.5">
                      {selectedPlaceActivity ? (
                        <div className="flex items-center gap-1">
                          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                            ✓ En Día {selectedPlaceActivity.dayNumber}
                          </span>
                          {onRemoveActivity && (
                            <button
                              type="button"
                              onClick={() => onRemoveActivity(selectedPlaceActivity.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Quitar del itinerario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setQuickDayPickerOpen(!quickDayPickerOpen)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#D94C3A] active:scale-95 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Añadir a mi viaje</span>
                          </button>

                          {/* Popover selector de día */}
                          {quickDayPickerOpen && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-2 z-40 w-44 animate-in fade-in zoom-in-95 duration-100">
                              <span className="text-[11px] font-bold text-[#17243A] block mb-1.5">
                                Selecciona el día:
                              </span>
                              <div className="space-y-1">
                                {dayItems.map((d) => (
                                  <button
                                    key={d.dayNumber}
                                    type="button"
                                    onClick={() => {
                                      handleAddPlaceWithFeedback(selectedPlace, d.dayNumber);
                                      setQuickDayPickerOpen(false);
                                    }}
                                    className="w-full text-left px-2 py-1 text-xs text-[#17243A] hover:bg-[#F8FAFC] rounded-md font-mono flex items-center justify-between cursor-pointer"
                                  >
                                    <span>{d.label}</span>
                                    <span className="text-[10px] text-[#64748B]">{d.weekdayShort}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* HERRAMIENTAS FLOTANTES DE CONTROL (INFERIOR DERECHA)         */}
        {/* ============================================================ */}
        <div className="absolute bottom-4 right-3 z-20 flex flex-col gap-1.5">
          {/* Botón de Geolocalización Actual */}
          <button
            type="button"
            onClick={handleLocateUser}
            className={`p-2.5 bg-white hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] shadow-md transition-all cursor-pointer ${
              isLocatingUser ? 'animate-pulse text-[#E85B49]' : 'text-[#17243A]'
            }`}
            title="Mi ubicación actual"
            aria-label="Mi ubicación actual"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Controles de Zoom */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-md overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 text-[#17243A] hover:bg-[#F8FAFC] transition-colors cursor-pointer border-b border-[#F1F5F9]"
              title="Acercar mapa"
              aria-label="Acercar mapa"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 text-[#17243A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              title="Alejar mapa"
              aria-label="Alejar mapa"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Ajustar a todos los marcadores */}
          <button
            type="button"
            onClick={handleFitAllMarkers}
            className="p-2.5 bg-white hover:bg-[#F8FAFC] text-[#17243A] rounded-xl border border-[#E2E8F0] shadow-md transition-colors cursor-pointer"
            title="Ajustar vista a los lugares visibles"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Centrar en destino original */}
          <button
            type="button"
            onClick={handleResetCenter}
            className="p-2.5 bg-white hover:bg-[#F8FAFC] text-[#17243A] rounded-xl border border-[#E2E8F0] shadow-md transition-colors cursor-pointer"
            title={`Centrar en ${trip.destinationName}`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL / BOTTOM SHEET DE FILTROS AVANZADOS                    */}
      {/* ============================================================ */}
      {isAdvancedFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-[#E2E8F0] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EEF4]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E85B49]" />
                <h3 className="text-sm font-bold font-display text-[#17243A]">
                  Filtros avanzados de mapa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#17243A] rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categorías */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#17243A] block">Categoría:</span>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-[#17243A] text-white font-semibold'
                        : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
                    }`}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solo Guardados */}
            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#17243A] block">
                  Solo lugares guardados
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Muestra únicamente lugares en tu lista Por visitar
                </span>
              </div>
              <input
                type="checkbox"
                checked={onlySavedFilter}
                onChange={(e) => setOnlySavedFilter(e.target.checked)}
                className="w-4 h-4 text-[#E85B49] rounded border-[#E2E8F0] cursor-pointer accent-[#E85B49]"
              />
            </div>

            {/* Calificación mínima */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5">
              <span className="text-xs font-bold text-[#17243A] block">
                Calificación mínima:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 0, label: 'Todas' },
                  { val: 4.0, label: '★ 4.0 o más' },
                  { val: 4.5, label: '★ 4.5 o más' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setMinRatingFilter(item.val)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      minRatingFilter === item.val
                        ? 'bg-[#17243A] text-white border-[#17243A]'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Certificación MINCETUR */}
            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#17243A] block">
                  Solo certificados oficiales
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Filtra por inventario oficial MINCETUR
                </span>
              </div>
              <input
                type="checkbox"
                checked={onlyMinceturFilter}
                onChange={(e) => setOnlyMinceturFilter(e.target.checked)}
                className="w-4 h-4 text-[#E85B49] rounded border-[#E2E8F0] cursor-pointer accent-[#E85B49]"
              />
            </div>

            {/* Botones de acción */}
            <div className="pt-3 border-t border-[#E9EEF4] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todas');
                  setOnlySavedFilter(false);
                  setMinRatingFilter(0);
                  setOnlyMinceturFilter(false);
                }}
                className="px-3 py-2 text-xs font-semibold text-[#64748B] hover:text-[#17243A] cursor-pointer"
              >
                Limpiar filtros
              </button>

              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#D94C3A] rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Aplicar filtros ({filteredPlaces.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
