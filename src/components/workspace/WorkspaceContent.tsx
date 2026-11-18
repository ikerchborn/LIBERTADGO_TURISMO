import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bookmark,
  Calendar,
  Trash2,
  ArrowUp,
  ArrowDown,
  MapPin,
  Star,
  ShieldCheck,
  ChevronRight,
  Phone,
  X,
  Compass,
  FileText,
  Info,
  Check,
  ArrowRight
} from 'lucide-react';
import { Place, PlaceCategory, TripItinerary } from '../../types/catalog.ts';
import { generateDayList, formatDateRange, TripDayItem } from '../../utils/dateUtils.ts';
import { WorkspaceSection } from './WorkspaceSidebar.tsx';
import { PlaceImage } from '../common/PlaceImage.tsx';
import {
  FILTER_CATEGORIES,
  LOCALITY_FILTER_OPTIONS,
  matchesCategory,
  matchesSearchQuery,
  matchesLocality,
} from '../../utils/filterUtils.ts';
import { ItineraryView } from './ItineraryView.tsx';
import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer.tsx';
import { PlaceVideosSection } from '../common/PlaceVideosSection.tsx';
import { TikTokRankingPanel } from './TikTokRankingPanel';



interface WorkspaceContentProps {
  trip: TripItinerary | null;
  savedTrips?: TripItinerary[];
  onSelectSavedTrip?: (trip: TripItinerary) => void;
  onOpenCreateModal?: () => void;
  onClearActiveTrip?: () => void;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  activeSection: WorkspaceSection;
  onSelectSection?: (section: WorkspaceSection) => void;
  selectedDayNumber: number | null;
  onSelectDayNumber: (day: number | null) => void;
  onAddPlaceToDay: (place: Place, dayNumber: number) => void;
  onToggleSavePlace: (placeId: string) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveActivityToDay: (activityId: string, targetDayNumber: number) => void;
  onMoveActivityPosition?: (activityId: string, targetDayNumber: number, targetIndex: number) => void;
  onReorderActivitiesForDay?: (dayNumber: number, orderedActivityIds: string[]) => void;
  onReorderActivity: (activityId: string, direction: 'up' | 'down') => void;
  onAddManualActivity: (dayNumber: number, title: string, timeSlot?: string, notes?: string) => void;
  onUpdateNotes: (notes: string) => void;
  isMapCollapsed?: boolean;
  previousSection?: WorkspaceSection | null;
  onReturnToPreviousSection?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedLocality?: string;
  onLocalityChange?: (locality: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const WorkspaceContent: React.FC<WorkspaceContentProps> = ({
  trip,
  savedTrips = [],
  onSelectSavedTrip,
  onOpenCreateModal,
  onClearActiveTrip,
  places,
  selectedPlace,
  onSelectPlace,
  activeSection,
  onSelectSection,
  selectedDayNumber,
  onSelectDayNumber,
  onAddPlaceToDay,
  onToggleSavePlace,
  onRemoveActivity,
  onMoveActivityToDay,
  onMoveActivityPosition,
  onReorderActivitiesForDay,
  onReorderActivity,
  onAddManualActivity,
  onUpdateNotes,
  isMapCollapsed = false,
  previousSection,
  onReturnToPreviousSection,
  selectedCategory = 'todas',
  onCategoryChange,
  selectedLocality = 'todas',
  onLocalityChange,
  searchQuery = '',
  onSearchChange,
}) => {
  // Selector de día en ficha de tarjeta
  const [activeDayPickerPlaceId, setActiveDayPickerPlaceId] = useState<string | null>(null);

  // Formulario de actividad manual
  const [manualFormDay, setManualFormDay] = useState<number | null>(null);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Ref para garantizar que cada sección comience desde arriba
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const categoryButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const localityContainerRef = useRef<HTMLDivElement>(null);
  const localityButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeSection, trip?.id]);

  // Mantener visible el filtro de categoría seleccionado al desplazarse
  useEffect(() => {
    if (selectedCategory === 'todas') {
      categoryContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const activeChip = categoryButtonsRef.current.get(selectedCategory);
      if (activeChip && categoryContainerRef.current) {
        activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [selectedCategory]);

  // Mantener visible la localidad seleccionada al desplazarse
  useEffect(() => {
    if (selectedLocality === 'todas') {
      localityContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const activeChip = localityButtonsRef.current.get(selectedLocality);
      if (activeChip && localityContainerRef.current) {
        activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [selectedLocality]);

  const dayItems: TripDayItem[] = useMemo(() => {
    if (!trip) return [];
    return generateDayList(trip.startDate, trip.totalDays);
  }, [trip?.startDate, trip?.totalDays]);

  // Opciones de localidad con conteos dinámicos en tiempo real
  const localityOptionsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of places) {
      const locId = p.localityId.toLowerCase();
      counts[locId] = (counts[locId] || 0) + 1;
    }
    return LOCALITY_FILTER_OPTIONS.map((loc) => ({
      ...loc,
      count: loc.id === 'todas' ? places.length : (counts[loc.id] || 0),
    }));
  }, [places]);

  const activeLocalityLabel = useMemo(() => {
    if (!selectedLocality || selectedLocality === 'todas') {
      return 'La Libertad';
    }
    const found = LOCALITY_FILTER_OPTIONS.find((l) => l.id === selectedLocality);
    return found ? found.name : trip?.destinationName || 'La Libertad';
  }, [selectedLocality, trip?.destinationName]);

  // Alternar (toggle) asignación de un lugar a un día específico
  const handleToggleDay = (place: Place, dayNumber: number) => {
    if (!trip) return;
    const existingActivity = trip.activities.find(
      (a) => a.placeId === place.id && a.dayNumber === dayNumber
    );

    if (existingActivity) {
      if (onRemoveActivity) {
        onRemoveActivity(existingActivity.id);
      }
    } else {
      onAddPlaceToDay(place, dayNumber);
    }
  };

  // Filtrado de lugares sincronizado con catálogo y mapa (categoría + búsqueda + localidad)
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      return (
        matchesCategory(p.category, selectedCategory) &&
        matchesSearchQuery(p, searchQuery) &&
        matchesLocality(p.localityId, selectedLocality)
      );
    });
  }, [places, selectedCategory, searchQuery, selectedLocality]);

  // Lugares guardados en la wishlist
  const savedPlaces = useMemo(() => {
    if (!trip) return [];
    const savedIds = new Set(trip.savedPlaceIds || []);
    return places.filter((p) => savedIds.has(p.id));
  }, [places, trip]);

  const handleCreateManual = (e: React.FormEvent, dayNum: number) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    onAddManualActivity(
      dayNum,
      manualTitle.trim(),
      manualTime.trim() || undefined,
      manualNotes.trim() || undefined
    );
    setManualTitle('');
    setManualTime('');
    setManualNotes('');
    setManualFormDay(null);
  };

  const containerWidthClass = isMapCollapsed
    ? 'w-full flex-1 min-w-0 max-w-full'
    : 'w-full md:w-[460px] lg:w-[480px] xl:w-[520px] flex-1 min-w-0';

  // ==========================================
  // SECCIÓN 1: RESUMEN (OVERVIEW)
  // ==========================================

  // ==========================================
  // SECCIÓN 1: RESUMEN (PORTADA DEL VIAJE / ESTADO VACÍO)
  // ==========================================
  if (activeSection === 'overview') {
    if (!trip) {
      return (
        <div
          ref={scrollContainerRef}
          className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col overflow-y-auto`}
        >
          <div className="p-5 sm:p-6 space-y-5 my-auto">
            {/* Estado vacío inicial atractivo */}
            <div className="rounded-xl border border-[#E9E7E1] bg-[#F7F2E8]/40 p-5 sm:p-6 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E9E7E1] shadow-2xs flex items-center justify-center text-[#E85B49]">
                <Compass className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E85B49]">
                  Espacio de viaje
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#263B35] leading-snug">
                  Planifica tu próximo viaje por La Libertad
                </h2>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  No hay ningún viaje seleccionado en este momento. Crea un nuevo itinerario o elige uno guardado para organizar tus días, rutas y lugares por visitar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {onOpenCreateModal && (
                  <button
                    type="button"
                    onClick={onOpenCreateModal}
                    className="flex-1 py-2.5 px-4 bg-[#E85B49] hover:bg-[#D94C3C] active:scale-[0.99] text-white text-xs font-semibold rounded-md shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.2]" />
                    <span>Crear nuevo viaje</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSelectSection?.('explore')}
                  className="py-2.5 px-3.5 bg-white hover:bg-[#F7F2E8] border border-[#E9E7E1] text-[#263B35] text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Explorar lugares</span>
                </button>
              </div>
            </div>

            {/* Viajes guardados para selección manual */}
            {savedTrips.length > 0 && onSelectSavedTrip ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#263B35]">
                    Tus viajes guardados ({savedTrips.length})
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    Selecciona uno para continuar
                  </span>
                </div>

                <div className="space-y-2">
                  {savedTrips.map((savedTrip) => {
                    const savedDateRange = formatDateRange(savedTrip.startDate, savedTrip.endDate);
                    const activitiesCount = savedTrip.activities?.length || 0;

                    return (
                      <button
                        key={savedTrip.id}
                        type="button"
                        onClick={() => onSelectSavedTrip(savedTrip)}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-[#E9E7E1] bg-white hover:border-[#263B35] hover:bg-[#F7F2E8]/40 transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-md bg-[#F7F2E8] border border-[#E9E7E1] flex items-center justify-center shrink-0 text-[#E85B49]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#263B35] group-hover:text-[#E85B49] truncate transition-colors">
                              {savedTrip.title}
                            </p>
                            <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                              {savedTrip.destinationName} · {savedDateRange || 'Fechas flexibles'} · {savedTrip.totalDays}{' '}
                              {savedTrip.totalDays === 1 ? 'día' : 'días'}
                              {activitiesCount > 0 ? ` · ${activitiesCount} act.` : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#263B35] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#E9E7E1] p-4 text-center text-xs text-[#64748B]">
                Todavía no tienes viajes guardados. Cuando crees un itinerario aparecerá aquí para abrirlo cuando quieras.
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col overflow-y-auto`}
      >
        <div className="p-5 sm:p-6 space-y-5">

          {/* Encabezado del destino */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E85B49]">
                Tu viaje
              </span>
              {onClearActiveTrip && (
                <button
                  type="button"
                  onClick={onClearActiveTrip}
                  className="text-[11px] font-medium text-[#64748B] hover:text-[#263B35] hover:underline cursor-pointer"
                >
                  Cambiar viaje
                </button>
              )}
            </div>

            <h2 className="text-xl font-bold text-[#263B35]">
              {trip.destinationName}
            </h2>

            <p className="text-xs text-[#64748B]">
              Explora, descubre y organiza tu viaje a tu propio ritmo.
            </p>
          </div>

          {/* Información del viaje */}
          <div className="rounded-lg bg-[#263B35] p-4 text-white space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D9B66F]" />
              <span className="text-sm font-semibold">
                {trip.totalDays} días de viaje
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] text-white/70">Llegada</p>
                <p className="text-xs font-medium">
                  {trip.startDate ? (dayItems[0]?.formattedDate ?? 'Por definir') : 'Por definir'}
                </p>
              </div>

              <div className="h-6 w-px bg-white/20" />

              <div>
                <p className="text-[10px] text-white/70">Salida</p>
                <p className="text-xs font-medium">
                  {trip.endDate ? (dayItems[dayItems.length - 1]?.formattedDate ?? 'Por definir') : 'Por definir'}
                </p>
              </div>

              <div className="h-6 w-px bg-white/20" />

              <div>
                <p className="text-[10px] text-white/70">
                  {trip.startDate && trip.endDate ? 'Estancia' : 'Duración'}
                </p>
                <p className="text-xs font-medium">
                  {trip.startDate && trip.endDate
                    ? `${trip.totalNights} noches`
                    : `${trip.totalDays} días`}
                </p>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#263B35]">
              Acceso rápido
            </h3>

            <button
              type="button"
              onClick={() => onSelectSection?.('explore')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E9E7E1] bg-white hover:bg-[#F7F2E8] transition-colors text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-[#F7F2E8] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-[#E85B49]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#263B35]">
                  Explorar lugares
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  Playas, gastronomía, arqueología y cultura.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </button>

            <button
              type="button"
              onClick={() => onSelectSection?.('itinerary')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E9E7E1] bg-white hover:bg-[#F7F2E8] transition-colors text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-[#F7F2E8] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#263B35]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#263B35]">
                  Itinerario por días
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  Organiza tus actividades y visitas día a día.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </button>

            <button
              type="button"
              onClick={() => onSelectSection?.('ranking')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E9E7E1] bg-white hover:bg-[#F7F2E8] transition-colors text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-[#F7F2E8] flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-[#D9B66F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#263B35]">
                  Ranking de videos
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  Videos de creadores locales en TikTok.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </button>

            <button
              type="button"
              onClick={() => onSelectSection?.('saved')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E9E7E1] bg-white hover:bg-[#F7F2E8] transition-colors text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-[#F7F2E8] flex items-center justify-center shrink-0">
                <Bookmark className="w-4 h-4 text-[#71958B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#263B35]">
                  Lugares para visitar
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  Sitios pendientes por programar en el mapa.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </button>
          </div>

          {/* Mensaje breve */}
          <div className="rounded-lg bg-[#F7F2E8] border border-[#E9E7E1] p-3 text-xs text-[#263B35]">
            <p className="font-semibold text-[#263B35]">
              Tu viaje en La Libertad
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
              Selecciona experiencias en el mapa y agrégalas directamente a tus días de viaje.
            </p>
          </div>

        </div>
      </div>
    );
  }


  // ==========================================
  // SECCIÓN 2: EXPLORAR (CATÁLOGO DE EXPERIENCIAS)
  // ==========================================
  if (activeSection === 'explore') {
    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col overflow-hidden`}
      >
        {/* Cabecera de búsqueda con jerarquía clara y directa */}
        <div className="p-3.5 sm:p-4 border-b border-[#E9E7E1] space-y-2.5 bg-white shrink-0">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#263B35] tracking-tight">
                Explorar {activeLocalityLabel}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {filteredPlaces.length} {filteredPlaces.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
              </p>
            </div>

            {savedPlaces.length > 0 && (
              <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-[#D9B66F] fill-[#D9B66F]" />
                <span>{savedPlaces.length} guardados</span>
              </span>
            )}
          </div>

          {/* Buscador de estilo Google Maps */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={`Buscar en ${activeLocalityLabel} (ceviche, huacas, playas, museos)...`}
              className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-[#E9E7E1] rounded-md text-[#263B35] placeholder:text-slate-400 focus:outline-none focus:border-[#E85B49] focus:ring-1 focus:ring-[#E85B49]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selector de Localidades */}
          <HorizontalScrollContainer
            innerRef={localityContainerRef}
            containerClassName="w-full"
            className="gap-1.5 py-0.5"
            gradientTheme="white"
            ariaLabel="Filtros de localidad"
          >
            {localityOptionsWithCounts.map((loc) => {
              const isLocActive = (selectedLocality || 'todas') === loc.id;
              return (
                <button
                  ref={(el) => {
                    if (el) localityButtonsRef.current.set(loc.id, el);
                    else localityButtonsRef.current.delete(loc.id);
                  }}
                  key={loc.id}
                  type="button"
                  onClick={() => onLocalityChange?.(loc.id)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer shrink-0 flex-shrink-0 font-medium flex items-center gap-1 ${
                    isLocActive
                      ? 'bg-[#E85B49] text-white'
                      : 'bg-white text-[#475569] hover:bg-slate-50 border border-[#E9E7E1]'
                  }`}
                  title={`Filtrar por ${loc.name} (${loc.count} lugares)`}
                >
                  <MapPin className={`w-3 h-3 ${isLocActive ? 'text-white' : 'text-[#E85B49]'}`} />
                  <span>{loc.name}</span>
                  <span className={`text-[10px] tabular-nums font-mono ${isLocActive ? 'text-white/80' : 'text-[#64748B]'}`}>
                    {loc.count}
                  </span>
                </button>
              );
            })}
          </HorizontalScrollContainer>

          {/* Selector de Categorías */}
          <HorizontalScrollContainer
            innerRef={categoryContainerRef}
            containerClassName="w-full"
            className="gap-1.5 py-0.5"
            gradientTheme="white"
            ariaLabel="Filtros de categoría"
          >
            {FILTER_CATEGORIES.map((cat) => (
              <button
                ref={(el) => {
                  if (el) categoryButtonsRef.current.set(cat.id, el);
                  else categoryButtonsRef.current.delete(cat.id);
                }}
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange?.(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer shrink-0 flex-shrink-0 font-medium flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-[#263B35] text-white'
                    : 'bg-white text-[#475569] hover:bg-slate-50 border border-[#E9E7E1]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </HorizontalScrollContainer>
        </div>

        {/* Vista Detallada de un Lugar (cuando está seleccionado) */}
        {selectedPlace ? (
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPlace(null)}
                  className="text-xs text-[#263B35] hover:text-[#E85B49] font-medium flex items-center gap-1 cursor-pointer"
                >
                  ← Volver a resultados
                </button>
                {previousSection && previousSection !== 'explore' && onReturnToPreviousSection && (
                  <>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={onReturnToPreviousSection}
                      className="text-xs text-[#E85B49] hover:underline font-medium cursor-pointer"
                    >
                      Volver a {previousSection === 'overview' ? 'Resumen' : previousSection === 'itinerary' ? 'Itinerario' : previousSection === 'saved' ? 'Por visitar' : 'Notas'}
                    </button>
                  </>
                )}
              </div>
              {selectedPlace.verification?.isVerified === true && (
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verificado por RiyMo</span>
                </span>
              )}
            </div>

            <div className="bg-white rounded-lg border border-[#E9E7E1] overflow-hidden">
              {/* Fotografía de alta calidad con PlaceImage */}
              <div className="relative h-48 sm:h-56 bg-slate-100">
                <PlaceImage
                  src={selectedPlace.images[0]?.url}
                  alt={selectedPlace.name}
                  category={selectedPlace.category}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#263B35] leading-snug">
                    {selectedPlace.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B]">
                    {selectedPlace.rating && (
                      <div className="flex items-center gap-1 text-amber-600 font-medium">
                        <span>★ {selectedPlace.rating}</span>
                        {selectedPlace.reviewsCount ? (
                          <span className="text-slate-500 font-normal">
                            · {selectedPlace.reviewsCount} opiniones
                          </span>
                        ) : null}
                      </div>
                    )}
                    <span>·</span>
                    <span className="capitalize">{selectedPlace.subcategory || selectedPlace.category}</span>
                    <span>·</span>
                    <span>{selectedPlace.localityName}, La Libertad</span>
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  {selectedPlace.fullDescription || selectedPlace.shortDescription}
                </p>

                <div className="pt-2 border-t border-[#E9E7E1] space-y-1 text-xs text-[#64748B]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#E85B49] mt-0.5" />
                    <span>{selectedPlace.address}</span>
                  </div>
                  {selectedPlace.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedPlace.phone}</span>
                    </div>
                  )}
                </div>

                {/* Acciones principales directas */}
                {trip ? (
                  <div className="pt-3 border-t border-[#E9E7E1] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleSavePlace(selectedPlace.id)}
                      className="px-3 py-1.5 border border-[#E9E7E1] rounded-md text-xs text-[#263B35] hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title={
                        trip.savedPlaceIds?.includes(selectedPlace.id)
                          ? 'Quitar de lugares para visitar'
                          : 'Guardar en Por visitar'
                      }
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          trip.savedPlaceIds?.includes(selectedPlace.id)
                            ? 'fill-[#D9B66F] text-[#D9B66F]'
                            : 'text-[#64748B]'
                        }`}
                      />
                      <span>{trip.savedPlaceIds?.includes(selectedPlace.id) ? 'Guardado' : 'Guardar'}</span>
                    </button>

                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <span className="text-xs text-[#64748B] shrink-0 font-medium">Asignar al día:</span>
                      <HorizontalScrollContainer
                        containerClassName="flex-1 min-w-0"
                        className="gap-1 py-0.5"
                        gradientTheme="slate"
                        arrowSize="sm"
                        ariaLabel="Asignar lugar a día"
                      >
                        {dayItems.map((d) => {
                          const isAlreadyInDay = trip.activities.some(
                            (a) => a.placeId === selectedPlace.id && a.dayNumber === d.dayNumber
                          );
                          return (
                            <button
                              key={d.dayNumber}
                              type="button"
                              onClick={() => handleToggleDay(selectedPlace, d.dayNumber)}
                              className={`px-2.5 py-1 text-xs rounded-md font-mono font-medium shrink-0 flex-shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
                                isAlreadyInDay
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-[#263B35] text-white hover:bg-[#E85B49]'
                              }`}
                              title={isAlreadyInDay ? `Día ${d.dayNumber} asignado (Pulsar para quitar)` : `Asignar al Día ${d.dayNumber}`}
                            >
                              {isAlreadyInDay ? `✓ D${d.dayNumber}` : `D${d.dayNumber}`}
                            </button>
                          );
                        })}
                      </HorizontalScrollContainer>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-[#E9E7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F7F2E8]/60 -mx-4 -mb-4 px-4 py-3 mt-2">
                    <span className="text-[11px] text-[#64748B]">
                      Crea o selecciona un viaje para guardar este lugar o añadirlo a un día.
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {savedTrips.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onSelectSection?.('overview')}
                          className="px-2.5 py-1.5 bg-white border border-[#E9E7E1] hover:bg-slate-50 text-[#263B35] text-xs font-medium rounded-md transition-colors cursor-pointer"
                        >
                          Elegir viaje
                        </button>
                      )}
                      {onOpenCreateModal && (
                        <button
                          type="button"
                          onClick={onOpenCreateModal}
                          className="px-2.5 py-1.5 bg-[#E85B49] hover:bg-[#D94C3C] text-white text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Crear viaje</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Galería de videos reales del lugar seleccionado */}
            <div className="mt-3">
              <PlaceVideosSection
                placeId={selectedPlace.id}
                placeName={selectedPlace.name}
                compact={true}
              />
            </div>
          </div>
        ) : (
          /* Lista de Tarjetas de Lugares estilo Google Maps (limpio y directo) */
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <div className={`grid grid-cols-1 ${isMapCollapsed ? 'md:grid-cols-2 xl:grid-cols-3' : ''} gap-2.5`}>
              {filteredPlaces.map((place) => {
                const isSaved = trip ? trip.savedPlaceIds?.includes(place.id) : false;
                const placeActivities = trip ? trip.activities.filter((a) => a.placeId === place.id) : [];
                const isRealVerified = place.verification?.isVerified === true;
                const categoryLabel = place.subcategory || place.category;

                return (
                  <div
                    key={place.id}
                    onClick={() => onSelectPlace(place)}
                    className="bg-white rounded-lg border border-[#E9E7E1] hover:border-slate-300 p-3 transition-colors cursor-pointer group flex gap-3 select-none"
                  >
                    {/* Fotografía protagonista */}
                    <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 bg-slate-100">
                      <PlaceImage
                        src={place.images[0]?.url}
                        alt={place.name}
                        category={place.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Información concisa y directa */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#263B35] group-hover:text-[#E85B49] transition-colors leading-snug truncate">
                          {place.name}
                        </h4>

                        <p className="text-xs text-[#64748B] mt-0.5 truncate capitalize">
                          {categoryLabel} · {place.localityName}, La Libertad
                        </p>

                        {/* Valoración real */}
                        {place.rating && (
                          <div className="flex items-center gap-1 text-xs text-[#64748B] mt-1">
                            <span className="text-amber-600 font-medium">★ {place.rating}</span>
                            {place.reviewsCount ? (
                              <span>· {place.reviewsCount} opiniones</span>
                            ) : null}
                          </div>
                        )}

                        {/* Verificado real */}
                        {isRealVerified && (
                          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verificado por RiyMo</span>
                          </div>
                        )}
                      </div>

                      {/* Acción principal directa */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E9E7E1]/60 mt-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectPlace(place)}
                          className="text-xs font-medium text-[#E85B49] hover:text-[#D94C3C] cursor-pointer"
                        >
                          Ver lugar
                        </button>

                        <div className="flex items-center gap-1.5">
                          {placeActivities.length > 0 && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              {placeActivities.map((a) => `Día ${a.dayNumber}`).join(', ')}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (!trip) {
                                onOpenCreateModal?.();
                                return;
                              }
                              onToggleSavePlace(place.id);
                            }}
                            className="p-1 text-[#64748B] hover:text-[#263B35] rounded transition-colors cursor-pointer"
                            title={
                              !trip
                                ? 'Crea un viaje para guardar lugares'
                                : isSaved
                                ? 'Quitar de guardados'
                                : 'Guardar en Por visitar'
                            }
                            aria-label={
                              !trip
                                ? 'Crea un viaje para guardar lugares'
                                : isSaved
                                ? 'Quitar de guardados'
                                : 'Guardar en Por visitar'
                            }
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isSaved ? 'fill-[#D9B66F] text-[#D9B66F]' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPlaces.length === 0 && (
              <div className="text-center py-12 px-4 border border-dashed border-[#E9E7E1] rounded-lg text-xs text-[#64748B] bg-white flex flex-col items-center justify-center gap-2">
                <Compass className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                <div>
                  <p className="font-semibold text-slate-700 text-sm">No se encontraron lugares</p>
                  <p className="text-[#64748B] mt-0.5">
                    No hay resultados en {activeLocalityLabel} para los filtros seleccionados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange?.('todas');
                    onLocalityChange?.('todas');
                    onSearchChange?.('');
                  }}
                  className="mt-1 px-3 py-1.5 bg-[#263B35] text-white text-xs font-medium rounded-md hover:bg-[#E85B49] transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

    // ==========================================
  // SECCIÓN 3: RANKING DE VIDEOS
  // ==========================================
  if (activeSection === 'ranking') {
    return (
      <div className={`${containerWidthClass} h-full min-h-0 flex flex-col overflow-hidden`}>
        <TikTokRankingPanel />
      </div>
    );
  }

  // ==========================================
  // SECCIÓN 3: ITINERARIO POR DÍAS (PHASE 3)
  // ==========================================
  if (activeSection === 'itinerary') {
    if (!trip) {
      return (
        <div
          ref={scrollContainerRef}
          className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col items-center justify-center p-6 text-center`}
        >
          <div className="max-w-sm space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#F7F2E8] border border-[#E9E7E1] flex items-center justify-center mx-auto text-[#E85B49]">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#263B35]">
              No hay un itinerario activo
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Crea un nuevo viaje o selecciona uno guardado para organizar tus actividades día a día y ver la ruta en el mapa.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {onOpenCreateModal && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="px-4 py-2 bg-[#E85B49] hover:bg-[#D94C3C] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear nuevo viaje</span>
                </button>
              )}
              {savedTrips.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectSection?.('overview')}
                  className="px-3.5 py-2 bg-white hover:bg-[#F7F2E8] border border-[#E9E7E1] text-[#263B35] text-xs font-medium rounded-md transition-colors cursor-pointer"
                >
                  Ver viajes guardados ({savedTrips.length})
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col overflow-hidden select-none`}
      >
        <ItineraryView
          trip={trip}
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={onSelectPlace}
          selectedDayNumber={selectedDayNumber}
          onSelectDayNumber={onSelectDayNumber}
          onRemoveActivity={onRemoveActivity}
          onMoveActivityToDay={onMoveActivityToDay}
          onMoveActivityPosition={onMoveActivityPosition}
          onReorderActivitiesForDay={onReorderActivitiesForDay}
          onReorderActivity={onReorderActivity}
          onAddManualActivity={onAddManualActivity}
          onNavigateToExplore={() => onSelectSection?.('explore')}
          isMapCollapsed={isMapCollapsed}
        />
      </div>
    );
  }

  // ==========================================
  // SECCIÓN 4: LUGARES PARA VISITAR (WISHLIST)
  // ==========================================
  if (activeSection === 'saved') {
    if (!trip) {
      return (
        <div
          ref={scrollContainerRef}
          className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col items-center justify-center p-6 text-center`}
        >
          <div className="max-w-sm space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#F7F2E8] border border-[#E9E7E1] flex items-center justify-center mx-auto text-[#71958B]">
              <Bookmark className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#263B35]">
              Lugares para visitar
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Crea o selecciona un viaje para guardar aquí tus lugares pendientes por visitar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {onOpenCreateModal && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="px-4 py-2 bg-[#E85B49] hover:bg-[#D94C3C] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear nuevo viaje</span>
                </button>
              )}
              {savedTrips.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectSection?.('overview')}
                  className="px-3.5 py-2 bg-white hover:bg-[#F7F2E8] border border-[#E9E7E1] text-[#263B35] text-xs font-medium rounded-md transition-colors cursor-pointer"
                >
                  Ver viajes guardados ({savedTrips.length})
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col p-4 overflow-y-auto select-none`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E9E7E1]">
          <div>
            <h2 className="text-sm font-semibold text-[#263B35]">
              Lugares para visitar
            </h2>
            <span className="text-xs text-[#64748B]">
              Lista de deseos sin día asignado ({savedPlaces.length} {savedPlaces.length === 1 ? 'lugar' : 'lugares'})
            </span>
          </div>
        </div>

        {savedPlaces.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[#E9E7E1] rounded-md text-xs text-[#64748B]">
            No tienes lugares guardados todavía. Explora {trip.destinationName} y presiona Guardar para tenerlos aquí.
          </div>
        ) : (
          <div className={`space-y-2 ${isMapCollapsed ? 'grid grid-cols-1 md:grid-cols-2 gap-2 space-y-0' : ''}`}>
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="p-2.5 bg-white border border-[#E9E7E1] rounded-md flex items-center justify-between gap-3 hover:border-[#263B35] transition-colors"
              >
                <div
                  className="flex items-center gap-2.5 truncate cursor-pointer flex-1"
                  onClick={() => onSelectPlace(place)}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-slate-100 border border-[#E9E7E1]">
                    <PlaceImage
                      src={place.images[0]?.url}
                      alt={place.name}
                      category={place.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[#263B35] truncate hover:text-[#E85B49]">
                      {place.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] capitalize">{place.category} · {place.localityName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#64748B]">Añadir:</span>
                    {dayItems.map((d) => {
                      const isAlreadyInDay = trip.activities.some(
                        (a) => a.placeId === place.id && a.dayNumber === d.dayNumber
                      );
                      return (
                        <button
                          key={d.dayNumber}
                          type="button"
                          onClick={() => handleToggleDay(place, d.dayNumber)}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer transition-colors ${
                            isAlreadyInDay
                              ? 'bg-[#263B35] text-white'
                              : 'bg-[#F7F2E8] text-[#263B35] hover:bg-[#E85B49] hover:text-white border border-[#E9E7E1]'
                          }`}
                          title={isAlreadyInDay ? `Día ${d.dayNumber} asignado (Pulsar para desasignar)` : `Añadir a Día ${d.dayNumber}`}
                        >
                          {isAlreadyInDay ? `✓ D${d.dayNumber}` : `D${d.dayNumber}`}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleSavePlace(place.id)}
                    className="p-1 text-[#64748B] hover:text-[#E85B49] cursor-pointer"
                    title="Quitar de la lista"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // SECCIÓN 5: NOTAS
  // ==========================================
  if (!trip) {
    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col items-center justify-center p-6 text-center`}
      >
        <div className="max-w-sm space-y-3">
          <div className="w-11 h-11 rounded-xl bg-[#F7F2E8] border border-[#E9E7E1] flex items-center justify-center mx-auto text-[#263B35]">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#263B35]">
            Notas y recordatorios
          </h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Crea o selecciona un viaje para guardar notas, contactos locales y números de reserva.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="px-4 py-2 bg-[#E85B49] hover:bg-[#D94C3C] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear nuevo viaje</span>
              </button>
            )}
            {savedTrips.length > 0 && (
              <button
                type="button"
                onClick={() => onSelectSection?.('overview')}
                className="px-3.5 py-2 bg-white hover:bg-[#F7F2E8] border border-[#E9E7E1] text-[#263B35] text-xs font-medium rounded-md transition-colors cursor-pointer"
              >
                Ver viajes guardados ({savedTrips.length})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9E7E1] flex flex-col p-5 select-none`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E9E7E1]">
        <div>
          <h2 className="text-sm font-semibold text-[#263B35]">
            Notas y recordatorios
          </h2>
          <span className="text-xs text-[#64748B]">
            Apunta datos de reservas, contactos y consejos para tu estadía en {trip.destinationName}
          </span>
        </div>
        <span className="text-[10px] text-[#263B35] font-medium bg-[#F7F2E8] px-2 py-0.5 rounded border border-[#E9E7E1]">
          Autoguardado
        </span>
      </div>

      <textarea
        value={trip.notes || ''}
        onChange={(e) => onUpdateNotes(e.target.value)}
        placeholder={`Escribe consejos, contactos locales, números de reserva o detalles de transporte en ${trip.destinationName}...`}
        className="w-full flex-1 p-3 text-xs bg-[#F7F2E8]/40 border border-[#E9E7E1] rounded-md resize-none text-[#263B35] leading-relaxed focus:outline-none focus:border-[#263B35]"
      />
    </div>
  );
};
