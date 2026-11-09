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
  Check
} from 'lucide-react';
import { Place, PlaceCategory, TripItinerary } from '../../types/catalog.ts';
import { generateDayList, TripDayItem } from '../../utils/dateUtils.ts';
import { WorkspaceSection } from './WorkspaceSidebar.tsx';
import { PlaceImage } from '../common/PlaceImage.tsx';
import {
  FILTER_CATEGORIES,
  matchesCategory,
  matchesSearchQuery,
} from '../../utils/filterUtils.ts';

interface WorkspaceContentProps {
  trip: TripItinerary;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  activeSection: WorkspaceSection;
  selectedDayNumber: number | null;
  onSelectDayNumber: (day: number | null) => void;
  onAddPlaceToDay: (place: Place, dayNumber: number) => void;
  onToggleSavePlace: (placeId: string) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveActivityToDay: (activityId: string, targetDayNumber: number) => void;
  onReorderActivity: (activityId: string, direction: 'up' | 'down') => void;
  onAddManualActivity: (dayNumber: number, title: string, timeSlot?: string, notes?: string) => void;
  onUpdateNotes: (notes: string) => void;
  isMapCollapsed?: boolean;
  previousSection?: WorkspaceSection | null;
  onReturnToPreviousSection?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const WorkspaceContent: React.FC<WorkspaceContentProps> = ({
  trip,
  places,
  selectedPlace,
  onSelectPlace,
  activeSection,
  selectedDayNumber,
  onSelectDayNumber,
  onAddPlaceToDay,
  onToggleSavePlace,
  onRemoveActivity,
  onMoveActivityToDay,
  onReorderActivity,
  onAddManualActivity,
  onUpdateNotes,
  isMapCollapsed = false,
  previousSection,
  onReturnToPreviousSection,
  selectedCategory = 'todas',
  onCategoryChange,
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

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeSection, trip.id]);

  const dayItems: TripDayItem[] = useMemo(() => {
    return generateDayList(trip.startDate, trip.totalDays);
  }, [trip.startDate, trip.totalDays]);

  // Alternar (toggle) asignación de un lugar a un día específico
  const handleToggleDay = (place: Place, dayNumber: number) => {
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

  // Filtrado de lugares sincronizado con catálogo y mapa
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      return matchesCategory(p.category, selectedCategory) && matchesSearchQuery(p, searchQuery);
    });
  }, [places, selectedCategory, searchQuery]);

  // Lugares guardados en la wishlist
  const savedPlaces = useMemo(() => {
    const savedIds = new Set(trip.savedPlaceIds || []);
    return places.filter((p) => savedIds.has(p.id));
  }, [places, trip.savedPlaceIds]);

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
  if (activeSection === 'overview') {
    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9EEF4] flex flex-col p-5 md:p-6 overflow-y-auto select-none`}
      >
        <div className="flex items-start justify-between mb-5 pb-4 border-b border-[#E9EEF4]">
          <div>
            <span className="text-[10px] font-bold text-[#E85B49] uppercase tracking-wider block mb-1">
              Resumen del viaje
            </span>
            <h2 className="text-xl font-bold font-display text-[#17243A]">
              {trip.title}
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Destino: <strong className="text-[#17243A]">{trip.destinationName}</strong>, La Libertad · {trip.totalDays} días ({trip.totalNights} noches)
            </p>
          </div>
        </div>

        {/* Indicadores claros y diferenciados */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] text-center">
            <span className="text-lg font-bold font-mono text-[#E85B49] block">
              {trip.activities.length}
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">Actividades</span>
          </div>
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] text-center">
            <span className="text-lg font-bold font-mono text-[#D97706] block">
              {savedPlaces.length}
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">Por visitar</span>
          </div>
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] text-center">
            <span className="text-lg font-bold font-mono text-[#17243A] block">
              {places.length}
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">Disponibles</span>
          </div>
        </div>

        {/* Guía del destino */}
        <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] mb-5">
          <h3 className="text-xs font-bold text-[#17243A] mb-1">
            Planificación en {trip.destinationName}
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Organiza tus visitas por zonas geográficas para optimizar traslados. Explora el catálogo, guarda los lugares que te interesen en «Por visitar» o asígnalos directamente a un día.
          </p>
        </div>

        {/* Fuentes Oficiales Verificadas */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-xl mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Datos Certificados de La Libertad</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Lugares verificados con inventarios de <strong>MINCETUR</strong> y cartografía georreferenciada de <strong>OpenStreetMap</strong>.
          </p>
        </div>

        {/* Desglose por días */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#17243A] uppercase tracking-wider mb-2">
            Desglose del Itinerario
          </h3>
          {dayItems.map((day) => {
            const count = trip.activities.filter((a) => a.dayNumber === day.dayNumber).length;
            return (
              <div
                key={day.dayNumber}
                className="flex items-center justify-between p-3 bg-white border border-[#E9EEF4] rounded-xl hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-[#17243A]">{day.label}</div>
                  <div className="text-[11px] text-[#64748B]">{day.formattedDate}</div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#17243A] bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#E9EEF4]">
                  {count} {count === 1 ? 'actividad' : 'actividades'}
                </span>
              </div>
            );
          })}
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
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9EEF4] flex flex-col overflow-hidden select-none`}
      >
        {/* Cabecera de búsqueda con jerarquía turística premium */}
        <div className="p-3.5 sm:p-4 border-b border-[#E9EEF4] space-y-3 bg-white shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-[#17243A] tracking-tight leading-snug">
                Explorar {trip.destinationName}
              </h2>
              {/* Contador real de resultados */}
              <p className="text-xs text-[#64748B] mt-0.5">
                Mostrando {filteredPlaces.length} de {places.length} lugares disponibles
              </p>
            </div>

            {/* Indicador de lugares guardados más discreto */}
            {savedPlaces.length > 0 && (
              <button
                type="button"
                onClick={() => {}}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg shrink-0"
              >
                <Bookmark className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                <span>{savedPlaces.length} guardados</span>
              </button>
            )}
          </div>

          {/* Buscador de ancho completo con altura táctil cómoda */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={`Buscar en ${trip.destinationName} (ceviche, huacas, surf, museos)...`}
              className="w-full h-11 sm:h-10 pl-10 pr-9 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#17243A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#E85B49] focus:ring-2 focus:ring-[#E85B49]/15 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Separación visual y Chips de Categorías deslizables */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pt-0.5 pb-0.5">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange?.(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 font-medium flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#17243A] text-white shadow-xs font-semibold'
                    : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vista Detallada de un Lugar (cuando está seleccionado) */}
        {selectedPlace ? (
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPlace(null)}
                  className="text-xs text-[#64748B] hover:text-[#17243A] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Volver al catálogo
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
              {selectedPlace.verification.isVerified && (
                <span className="text-[10px] text-[#27856C] bg-[#27856C]/10 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {selectedPlace.verification.verificationLevel === 'official_mincetur'
                    ? 'MINCETUR Oficial'
                    : 'Verificado'}
                </span>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E9EEF4] overflow-hidden shadow-xs">
              {/* Fotografía de alta calidad con PlaceImage y fallback editorial */}
              <div className="relative h-44 sm:h-52 bg-slate-100">
                <PlaceImage
                  src={selectedPlace.images[0]?.url}
                  alt={selectedPlace.name}
                  category={selectedPlace.category}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-base font-bold font-display text-[#17243A]">
                    {selectedPlace.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B]">
                    {selectedPlace.rating && (
                      <div className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{selectedPlace.rating}</span>
                      </div>
                    )}
                    <span>·</span>
                    <span className="capitalize">{selectedPlace.category}</span>
                    <span>·</span>
                    <span>{selectedPlace.localityName}</span>
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  {selectedPlace.fullDescription || selectedPlace.shortDescription}
                </p>

                <div className="pt-2 border-t border-[#E9EEF4] space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#E85B49]" />
                    <span>{selectedPlace.address}</span>
                  </div>
                  {selectedPlace.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedPlace.phone}</span>
                    </div>
                  )}
                  {selectedPlace.sources?.[0] && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <Info className="w-3 h-3 text-slate-400" />
                      <span>Fuente: {selectedPlace.sources[0].sourceId.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* Acciones de la Ficha adaptadas para mobile */}
                <div className="pt-3 border-t border-[#E9EEF4] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSavePlace(selectedPlace.id)}
                    className="p-2.5 border border-[#E2E8F0] rounded-xl text-[#17243A] hover:bg-[#F8FAFC] active:scale-95 transition-all cursor-pointer"
                    title={
                      trip.savedPlaceIds?.includes(selectedPlace.id)
                        ? 'Quitar de lugares para visitar'
                        : 'Guardar en lugares para visitar'
                    }
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        trip.savedPlaceIds?.includes(selectedPlace.id)
                          ? 'fill-[#D97706] text-[#D97706]'
                          : 'text-[#64748B]'
                      }`}
                    />
                  </button>

                  <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                    <span className="text-xs text-[#64748B] shrink-0 font-medium">Añadir a:</span>
                    {dayItems.map((d) => {
                      const isAlreadyInDay = trip.activities.some(
                        (a) => a.placeId === selectedPlace.id && a.dayNumber === d.dayNumber
                      );
                      return (
                        <button
                          key={d.dayNumber}
                          type="button"
                          onClick={() => handleToggleDay(selectedPlace, d.dayNumber)}
                          className={`px-3 py-1.5 text-xs rounded-lg font-mono font-semibold shrink-0 transition-all cursor-pointer ${
                            isAlreadyInDay
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                              : 'bg-[#17243A] text-white hover:bg-[#E85B49] active:scale-95 shadow-2xs'
                          }`}
                          title={isAlreadyInDay ? `Día ${d.dayNumber} asignado (Pulsar para desasignar)` : `Añadir a Día ${d.dayNumber}`}
                        >
                          {isAlreadyInDay ? `✓ Día ${d.dayNumber}` : `Día ${d.dayNumber}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Lista de Tarjetas de Lugares adaptadas al ancho móvil */
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <div className={`grid grid-cols-1 ${isMapCollapsed ? 'md:grid-cols-2 xl:grid-cols-3' : ''} gap-3`}>
              {filteredPlaces.map((place) => {
                const isSaved = trip.savedPlaceIds?.includes(place.id);
                const placeActivities = trip.activities.filter((a) => a.placeId === place.id);
                const isDayPickerOpen = activeDayPickerPlaceId === place.id;

                return (
                  <div
                    key={place.id}
                    onClick={() => onSelectPlace(place)}
                    className="bg-white rounded-xl border border-[#E9EEF4] hover:border-[#CBD5E1] p-3 sm:p-3.5 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-xs"
                  >
                    <div>
                      <div className="flex gap-3">
                        {/* Thumbnail equilibrado para pantallas móviles */}
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                          <PlaceImage
                            src={place.images[0]?.url}
                            alt={place.name}
                            category={place.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="text-xs sm:text-sm font-bold text-[#17243A] group-hover:text-[#E85B49] transition-colors leading-snug line-clamp-1">
                                {place.name}
                              </h4>
                              {placeActivities.length > 0 && (
                                <span className="text-[10px] font-semibold text-white bg-[#E85B49] px-1.5 py-0.2 rounded shrink-0 leading-tight">
                                  {placeActivities.map((a) => `Día ${a.dayNumber}`).join(', ')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-1">
                              {place.rating && (
                                <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{place.rating}</span>
                                </span>
                              )}
                              <span>·</span>
                              <span className="capitalize">{place.subcategory || place.category}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#64748B] truncate mt-1">
                            {place.address.split(',')[0]}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra inferior de acciones con touch target cómodo */}
                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#F1F5F9] text-xs">
                      <span className="text-[10px] text-[#27856C] bg-[#27856C]/8 px-2 py-0.5 rounded-md font-medium">
                        {place.verification.verificationLevel === 'official_mincetur'
                          ? 'MINCETUR'
                          : 'Verificado'}
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleSavePlace(place.id)}
                          className="p-1.5 text-[#64748B] hover:text-[#17243A] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
                          title={isSaved ? 'Quitar de guardados' : 'Guardar en Por visitar'}
                          aria-label={isSaved ? 'Quitar de guardados' : 'Guardar en Por visitar'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isSaved ? 'fill-[#D97706] text-[#D97706]' : ''
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveDayPickerPlaceId(isDayPickerOpen ? null : place.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                            placeActivities.length > 0
                              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                              : 'text-[#17243A] hover:text-white hover:bg-[#17243A] bg-[#F8FAFC] border border-[#E2E8F0]'
                          }`}
                        >
                          <span>{placeActivities.length > 0 ? 'Días' : '+ Añadir'}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </button>
                      </div>
                    </div>

                    {/* Selector emergente de día asignable (con toggle independiente) */}
                    {isDayPickerOpen && (
                      <div
                        className="mt-2.5 pt-2.5 border-t border-[#E9EEF4] flex items-center justify-between text-xs animate-in fade-in duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[#64748B] text-[11px] font-medium">Asignar a:</span>
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                          {dayItems.map((d) => {
                            const isAlreadyInDay = trip.activities.some(
                              (a) => a.placeId === place.id && a.dayNumber === d.dayNumber
                            );
                            return (
                              <button
                                key={d.dayNumber}
                                type="button"
                                onClick={() => handleToggleDay(place, d.dayNumber)}
                                className={`px-2.5 py-1 font-mono font-medium text-[11px] rounded-lg cursor-pointer transition-colors ${
                                  isAlreadyInDay
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                                    : 'bg-[#17243A] text-white hover:bg-[#E85B49] border border-[#17243A]'
                                }`}
                                title={isAlreadyInDay ? `Día ${d.dayNumber} asignado (Pulsar para desasignar)` : `Añadir a Día ${d.dayNumber}`}
                              >
                                {isAlreadyInDay ? `✓ D${d.dayNumber}` : `D${d.dayNumber}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredPlaces.length === 0 && (
              <div className="text-center py-12 px-4 border border-dashed border-[#E9EEF4] rounded-xl text-xs text-[#64748B] bg-white flex flex-col items-center justify-center gap-2.5">
                <Compass className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <div>
                  <p className="font-semibold text-slate-700 text-sm">No se encontraron lugares</p>
                  <p className="text-[#64748B] mt-0.5">
                    No hay resultados en {trip.destinationName} para los filtros seleccionados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange?.('todas');
                    onSearchChange?.('');
                  }}
                  className="mt-1 px-3.5 py-1.5 bg-[#17243A] text-white text-xs font-semibold rounded-lg hover:bg-[#E85B49] transition-colors cursor-pointer"
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
  // SECCIÓN 3: ITINERARIO POR DÍAS
  // ==========================================
  if (activeSection === 'itinerary') {
    const daysToShow = selectedDayNumber
      ? dayItems.filter((d) => d.dayNumber === selectedDayNumber)
      : dayItems;

    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9EEF4] flex flex-col p-4 overflow-y-auto select-none`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E9EEF4]">
          <div>
            <h2 className="text-sm font-bold font-display text-[#17243A]">
              {selectedDayNumber ? `Día ${selectedDayNumber}` : 'Itinerario de viaje'}
            </h2>
            <span className="text-xs text-[#64748B]">
              <strong className="text-[#17243A]">{trip.activities.length}</strong> actividades en <strong className="text-[#17243A]">{trip.totalDays}</strong> días
            </span>
          </div>

          {selectedDayNumber && (
            <button
              type="button"
              onClick={() => onSelectDayNumber(null)}
              className="text-xs font-semibold text-[#E85B49] hover:underline cursor-pointer"
            >
              Ver todos los días
            </button>
          )}
        </div>

        <div className={`space-y-4 ${isMapCollapsed ? 'max-w-4xl' : ''}`}>
          {daysToShow.map((day) => {
            const dayActs = trip.activities
              .filter((a) => a.dayNumber === day.dayNumber)
              .sort((a, b) => a.order - b.order);

            return (
              <div
                key={day.dayNumber}
                className="border border-[#E9EEF4] rounded-xl overflow-hidden bg-white shadow-2xs"
              >
                {/* Cabecera del día */}
                <div className="flex items-center justify-between p-3 bg-[#F7F8FA] border-b border-[#E9EEF4]">
                  <div>
                    <span className="text-xs font-bold text-[#17243A] block">
                      {day.label} · {day.formattedDate}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {dayActs.length} {dayActs.length === 1 ? 'actividad' : 'actividades'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setManualFormDay(manualFormDay === day.dayNumber ? null : day.dayNumber)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#17243A] bg-white border border-[#E9EEF4] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Actividad</span>
                  </button>
                </div>

                {/* Formulario de Actividad Manual */}
                {manualFormDay === day.dayNumber && (
                  <form
                    onSubmit={(e) => handleCreateManual(e, day.dayNumber)}
                    className="p-3 bg-[#F7F8FA] border-b border-[#E9EEF4] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#17243A]">Nueva actividad manual</span>
                      <button
                        type="button"
                        onClick={() => setManualFormDay(null)}
                        className="text-[#64748B] hover:text-[#17243A]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Ej. Desayuno en Plaza Mayor, Paseo en caballitos de totora"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E9EEF4] rounded-lg text-[#17243A] focus:outline-none focus:border-[#17243A]"
                      autoFocus
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Hora (ej. 10:00)"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-[#E9EEF4] rounded-lg text-[#17243A] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Notas breves"
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-[#E9EEF4] rounded-lg text-[#17243A] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setManualFormDay(null)}
                        className="px-2.5 py-1 text-xs text-[#64748B] hover:text-[#17243A] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-medium text-white bg-[#17243A] hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de actividades */}
                <div className="p-2 space-y-1.5">
                  {dayActs.length === 0 ? (
                    <div className="text-center py-4 text-xs text-[#64748B]">
                      Sin actividades para este día. Añade lugares desde Explorar o pulsa + Actividad.
                    </div>
                  ) : (
                    dayActs.map((act, idx) => (
                      <div
                        key={act.id}
                        className="flex items-start justify-between p-2.5 rounded-lg border border-[#E9EEF4] hover:bg-[#F7F8FA] transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {/* Badge de orden correlativo numerado Wanderlog */}
                          <span className="w-5 h-5 rounded-full bg-[#E85B49] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (act.place) onSelectPlace(act.place);
                              }}
                              className="text-xs font-bold text-[#17243A] hover:text-[#E85B49] text-left truncate block cursor-pointer"
                            >
                              {act.customTitle || act.place?.name || 'Actividad'}
                            </button>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                              <span>{act.timeSlot || 'Horario flexible'}</span>
                              {act.place && (
                                <>
                                  <span>·</span>
                                  <span className="capitalize">{act.place.category}</span>
                                </>
                              )}
                            </div>
                            {act.notes && (
                              <p className="text-[11px] text-[#475569] mt-1 bg-white p-1 rounded border border-[#E9EEF4]">
                                {act.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controles de orden y eliminación */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <select
                            value={act.dayNumber}
                            onChange={(e) => onMoveActivityToDay(act.id, Number(e.target.value))}
                            aria-label="Mover a otro día"
                            className="text-[11px] bg-white border border-[#E9EEF4] rounded px-1 py-0.5 text-[#64748B] outline-none"
                          >
                            {dayItems.map((d) => (
                              <option key={d.dayNumber} value={d.dayNumber}>
                                {d.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => onReorderActivity(act.id, 'up')}
                            className="p-1 text-[#64748B] hover:text-[#17243A] disabled:opacity-20 cursor-pointer"
                            title="Subir orden"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === dayActs.length - 1}
                            onClick={() => onReorderActivity(act.id, 'down')}
                            className="p-1 text-[#64748B] hover:text-[#17243A] disabled:opacity-20 cursor-pointer"
                            title="Bajar orden"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveActivity(act.id)}
                            className="p-1 text-[#64748B] hover:text-rose-600 cursor-pointer"
                            title="Quitar actividad"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // SECCIÓN 4: LUGARES PARA VISITAR (WISHLIST)
  // ==========================================
  if (activeSection === 'saved') {
    return (
      <div
        ref={scrollContainerRef}
        className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9EEF4] flex flex-col p-4 overflow-y-auto select-none`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E9EEF4]">
          <div>
            <h2 className="text-sm font-bold font-display text-[#17243A]">
              Lugares para visitar
            </h2>
            <span className="text-xs text-[#64748B]">
              Lista de deseos sin día asignado (<strong className="text-[#D97706]">{savedPlaces.length}</strong> lugares)
            </span>
          </div>
        </div>

        {savedPlaces.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[#E9EEF4] rounded-xl text-xs text-[#64748B]">
            No tienes lugares guardados todavía. Explora {trip.destinationName} y presiona el icono de marcador para guardarlos aquí.
          </div>
        ) : (
          <div className={`space-y-2 ${isMapCollapsed ? 'grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0' : ''}`}>
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="p-3 bg-white border border-[#E9EEF4] rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div
                  className="flex items-center gap-2.5 truncate cursor-pointer flex-1"
                  onClick={() => onSelectPlace(place)}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    <PlaceImage
                      src={place.images[0]?.url}
                      alt={place.name}
                      category={place.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-[#17243A] truncate hover:text-[#E85B49]">
                      {place.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] capitalize">{place.category}</div>
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
                          className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                            isAlreadyInDay
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                              : 'bg-[#17243A] text-white hover:bg-[#E85B49] border border-[#17243A]'
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
                    className="p-1 text-[#64748B] hover:text-rose-600 cursor-pointer"
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
  return (
    <div
      ref={scrollContainerRef}
      className={`${containerWidthClass} h-full min-h-0 bg-white border-r border-[#E9EEF4] flex flex-col p-6 select-none`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9EEF4]">
        <div>
          <h2 className="text-sm font-bold font-display text-[#17243A]">
            Notas y recordatorios
          </h2>
          <span className="text-xs text-[#64748B]">
            Apunta datos de reservas, contactos y consejos para tu estadía en {trip.destinationName}
          </span>
        </div>
        <span className="text-[10px] text-[#64748B] font-medium bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#E9EEF4]">
          Autoguardado
        </span>
      </div>

      <textarea
        value={trip.notes || ''}
        onChange={(e) => onUpdateNotes(e.target.value)}
        placeholder={`Escribe consejos, contactos locales, números de reserva o detalles de transporte en ${trip.destinationName}...`}
        className="w-full flex-1 p-4 text-xs bg-[#F7F8FA] border border-[#E9EEF4] rounded-xl resize-none text-[#17243A] leading-relaxed focus:outline-none focus:border-[#17243A]"
      />
    </div>
  );
};
