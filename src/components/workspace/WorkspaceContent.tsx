import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Bookmark,
  Calendar,
  Clock,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  MapPin,
  Star,
  ShieldCheck,
  ChevronRight,
  Phone,
  X,
  Compass,
  FileText
} from 'lucide-react';
import { Place, PlaceCategory, TripItinerary, TripActivity } from '../../types/catalog.ts';
import { generateDayList, TripDayItem } from '../../utils/dateUtils.ts';
import { WorkspaceSection } from './WorkspaceSidebar.tsx';

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
}

const CATEGORIES: { id: PlaceCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todo' },
  { id: 'restaurantes', label: 'Restaurantes' },
  { id: 'arqueologia', label: 'Arqueología' },
  { id: 'playas', label: 'Playas' },
  { id: 'atractivos', label: 'Atractivos' },
  { id: 'hoteles', label: 'Hoteles' },
  { id: 'museos', label: 'Museos' },
];

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
}) => {
  // Búsqueda y categoría para Explorar
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [activeDayPickerPlaceId, setActiveDayPickerPlaceId] = useState<string | null>(null);

  // Formulario de actividad manual
  const [manualFormDay, setManualFormDay] = useState<number | null>(null);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  const dayItems: TripDayItem[] = useMemo(() => {
    return generateDayList(trip.startDate, trip.totalDays);
  }, [trip.startDate, trip.totalDays]);

  // Filtrado de lugares
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchesCat = selectedCategory === 'todas' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
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
    onAddManualActivity(dayNum, manualTitle.trim(), manualTime.trim() || undefined, manualNotes.trim() || undefined);
    setManualTitle('');
    setManualTime('');
    setManualNotes('');
    setManualFormDay(null);
  };

  // ==========================================
  // SECCIÓN 1: RESUMEN (OVERVIEW)
  // ==========================================
  if (activeSection === 'overview') {
    return (
      <div className="w-full md:w-[460px] lg:w-[480px] xl:w-[520px] flex-1 h-full bg-white border-r border-[#E9EEF4] flex flex-col p-6 overflow-y-auto select-none">
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Resumen del viaje
          </span>
          <h2 className="text-xl font-bold font-display text-[#17243A]">
            {trip.title}
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Destino: <strong className="text-[#17243A]">{trip.destinationName}</strong>, Región La Libertad · {trip.totalDays} días ({trip.totalNights} noches)
          </p>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] text-center">
            <span className="text-lg font-bold font-mono text-[#17243A] block">
              {trip.activities.length}
            </span>
            <span className="text-[11px] text-[#64748B]">Actividades</span>
          </div>
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] text-center">
            <span className="text-lg font-bold font-mono text-[#17243A] block">
              {savedPlaces.length}
            </span>
            <span className="text-[11px] text-[#64748B]">Por visitar</span>
          </div>
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] text-center">
            <span className="text-lg font-bold font-mono text-[#17243A] block">
              {trip.totalDays}
            </span>
            <span className="text-[11px] text-[#64748B]">Días</span>
          </div>
        </div>

        {/* Cobertura del destino */}
        <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] mb-6">
          <h3 className="text-xs font-bold text-[#17243A] mb-1">
            Información de {trip.destinationName}
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Destino emblemático del norte peruano. Para maximizar tu experiencia, añade atractivos arqueológicos en las mañanas y gastronomía criolla tradicional hacia el mediodía.
          </p>
        </div>

        {/* Desglose rápido por días */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#17243A] uppercase tracking-wider mb-2">
            Plan diario
          </h3>
          {dayItems.map((day) => {
            const count = trip.activities.filter((a) => a.dayNumber === day.dayNumber).length;
            return (
              <div
                key={day.dayNumber}
                className="flex items-center justify-between p-3 bg-white border border-[#E9EEF4] rounded-xl"
              >
                <div>
                  <div className="text-xs font-semibold text-[#17243A]">{day.label}</div>
                  <div className="text-[11px] text-[#64748B]">{day.formattedDate}</div>
                </div>
                <span className="text-xs font-mono font-medium text-[#17243A]">
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
      <div className="w-full md:w-[460px] lg:w-[480px] xl:w-[520px] flex-1 h-full bg-white border-r border-[#E9EEF4] flex flex-col overflow-hidden select-none">
        {/* Cabecera de búsqueda y filtros */}
        <div className="p-4 border-b border-[#E9EEF4] space-y-3 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-display text-[#17243A]">
              Explorar {trip.destinationName}
            </h2>
            <span className="text-xs font-mono text-[#64748B]">
              {filteredPlaces.length} lugares
            </span>
          </div>

          {/* Buscador limpio */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar ceviche, huacas, surf en ${trip.destinationName}...`}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] border border-[#E9EEF4] rounded-xl text-[#17243A] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#17243A]"
            />
          </div>

          {/* Chips de Categorías */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#17243A] text-white font-medium'
                    : 'bg-[#F7F8FA] text-[#64748B] hover:text-[#17243A]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vista Detallada de un Lugar (cuando está seleccionado) */}
        {selectedPlace ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F8FA]/50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectPlace(null)}
                className="text-xs text-[#64748B] hover:text-[#17243A] font-medium cursor-pointer"
              >
                ← Volver a la lista
              </button>
              {selectedPlace.verification.isVerified && (
                <span className="text-[10px] text-[#27856C] bg-[#27856C]/10 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  MINCETUR Oficial
                </span>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E9EEF4] overflow-hidden shadow-xs">
              <div className="relative h-44 bg-slate-100">
                <img
                  src={selectedPlace.images[0]?.url || ''}
                  alt={selectedPlace.name}
                  referrerPolicy="no-referrer"
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

                <div className="pt-2 border-t border-[#E9EEF4] space-y-1 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedPlace.address}</span>
                  </div>
                  {selectedPlace.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedPlace.phone}</span>
                    </div>
                  )}
                </div>

                {/* Acciones de la Ficha */}
                <div className="pt-3 border-t border-[#E9EEF4] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSavePlace(selectedPlace.id)}
                    className="p-2 border border-[#E9EEF4] rounded-lg text-[#17243A] hover:bg-[#F7F8FA] cursor-pointer"
                    title="Guardar en lugares para visitar"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        trip.savedPlaceIds?.includes(selectedPlace.id)
                          ? 'fill-[#17243A] text-[#17243A]'
                          : 'text-[#64748B]'
                      }`}
                    />
                  </button>

                  <div className="flex-1 flex items-center gap-1.5">
                    <span className="text-xs text-[#64748B]">Añadir a:</span>
                    {dayItems.map((d) => (
                      <button
                        key={d.dayNumber}
                        type="button"
                        onClick={() => onAddPlaceToDay(selectedPlace, d.dayNumber)}
                        className="px-2.5 py-1.5 text-xs bg-[#17243A] text-white hover:bg-slate-800 rounded-lg font-mono font-medium cursor-pointer"
                      >
                        Día {d.dayNumber}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Lista de Tarjetas de Lugares */
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredPlaces.map((place) => {
              const isSaved = trip.savedPlaceIds?.includes(place.id);
              const activity = trip.activities.find((a) => a.placeId === place.id);
              const isDayPickerOpen = activeDayPickerPlaceId === place.id;

              return (
                <div
                  key={place.id}
                  onClick={() => onSelectPlace(place)}
                  className="bg-white rounded-xl border border-[#E9EEF4] hover:border-slate-300 p-3 transition-colors cursor-pointer group"
                >
                  <div className="flex gap-3">
                    <img
                      src={place.images[0]?.url || ''}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#17243A] group-hover:text-[#E85B49] transition-colors truncate">
                            {place.name}
                          </h4>
                          {activity && (
                            <span className="text-[10px] font-medium text-[#27856C] bg-[#27856C]/10 px-1.5 py-0.2 rounded shrink-0">
                              Día {activity.dayNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-0.5">
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

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-[#64748B] truncate">
                          {place.address.split(',')[0]}
                        </span>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onToggleSavePlace(place.id)}
                            className="p-1 text-[#64748B] hover:text-[#17243A] cursor-pointer"
                            title="Guardar en lista"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isSaved ? 'fill-[#17243A] text-[#17243A]' : ''
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveDayPickerPlaceId(isDayPickerOpen ? null : place.id)}
                            className="text-xs font-semibold text-[#17243A] hover:text-[#E85B49] flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>+ Añadir</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selector emergente de día */}
                  {isDayPickerOpen && (
                    <div
                      className="mt-2 pt-2 border-t border-[#E9EEF4] flex items-center justify-between text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[#64748B]">Asignar a:</span>
                      <div className="flex items-center gap-1">
                        {dayItems.map((d) => (
                          <button
                            key={d.dayNumber}
                            type="button"
                            onClick={() => {
                              onAddPlaceToDay(place, d.dayNumber);
                              setActiveDayPickerPlaceId(null);
                            }}
                            className="px-2 py-0.5 bg-[#F7F8FA] hover:bg-[#17243A] hover:text-white border border-[#E9EEF4] text-[#17243A] font-mono text-[11px] rounded cursor-pointer transition-colors"
                          >
                            Día {d.dayNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPlaces.length === 0 && (
              <div className="text-center py-10 px-4 border border-dashed border-[#E9EEF4] rounded-xl text-xs text-[#64748B]">
                No se encontraron lugares en {trip.destinationName} para este filtro.
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
    // Si se seleccionó un día específico en el sidebar, solo mostramos ese día; si no, todos
    const daysToShow = selectedDayNumber
      ? dayItems.filter((d) => d.dayNumber === selectedDayNumber)
      : dayItems;

    return (
      <div className="w-full md:w-[460px] lg:w-[480px] xl:w-[520px] flex-1 h-full bg-white border-r border-[#E9EEF4] flex flex-col p-4 overflow-y-auto select-none">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E9EEF4]">
          <div>
            <h2 className="text-sm font-bold font-display text-[#17243A]">
              {selectedDayNumber ? `Día ${selectedDayNumber}` : 'Itinerario de viaje'}
            </h2>
            <span className="text-xs text-[#64748B]">
              {trip.activities.length} actividades organizadas
            </span>
          </div>

          {selectedDayNumber && (
            <button
              type="button"
              onClick={() => onSelectDayNumber(null)}
              className="text-xs text-[#64748B] hover:text-[#17243A] cursor-pointer"
            >
              Ver todos los días
            </button>
          )}
        </div>

        <div className="space-y-4">
          {daysToShow.map((day) => {
            const dayActs = trip.activities
              .filter((a) => a.dayNumber === day.dayNumber)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={day.dayNumber} className="border border-[#E9EEF4] rounded-xl overflow-hidden bg-white">
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
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#17243A] bg-white border border-[#E9EEF4] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Actividad</span>
                  </button>
                </div>

                {/* Formulario de Actividad Manual */}
                {manualFormDay === day.dayNumber && (
                  <form
                    onSubmit={(e) => handleCreateManual(e, day.dayNumber)}
                    className="p-3 bg-[#F7F8FA] border-b border-[#E9EEF4] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#17243A]">Nueva actividad</span>
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
                      placeholder="Ej. Caminata por el malecón, Almuerzo"
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
                      Sin actividades planificadas para este día.
                    </div>
                  ) : (
                    dayActs.map((act, idx) => (
                      <div
                        key={act.id}
                        className="flex items-start justify-between p-2.5 rounded-lg border border-[#E9EEF4] hover:bg-[#F7F8FA] transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-full bg-[#17243A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                            title="Subir"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === dayActs.length - 1}
                            onClick={() => onReorderActivity(act.id, 'down')}
                            className="p-1 text-[#64748B] hover:text-[#17243A] disabled:opacity-20 cursor-pointer"
                            title="Bajar"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveActivity(act.id)}
                            className="p-1 text-[#64748B] hover:text-rose-600 cursor-pointer"
                            title="Quitar"
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
      <div className="w-full md:w-[460px] lg:w-[480px] xl:w-[520px] flex-1 h-full bg-white border-r border-[#E9EEF4] flex flex-col p-4 overflow-y-auto select-none">
        <div className="pb-3 mb-3 border-b border-[#E9EEF4]">
          <h2 className="text-sm font-bold font-display text-[#17243A]">
            Lugares para visitar
          </h2>
          <span className="text-xs text-[#64748B]">
            Lista de deseos sin día asignado ({savedPlaces.length})
          </span>
        </div>

        {savedPlaces.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[#E9EEF4] rounded-xl text-xs text-[#64748B]">
            No tienes lugares guardados todavía. Explora {trip.destinationName} y presiona el icono de marcador para guardarlos aquí.
          </div>
        ) : (
          <div className="space-y-2">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="p-3 bg-white border border-[#E9EEF4] rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={place.images[0]?.url || ''}
                    alt={place.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-[#17243A] truncate">{place.name}</div>
                    <div className="text-[11px] text-[#64748B] capitalize">{place.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#64748B]">Añadir a:</span>
                    {dayItems.map((d) => (
                      <button
                        key={d.dayNumber}
                        type="button"
                        onClick={() => onAddPlaceToDay(place, d.dayNumber)}
                        className="px-2 py-0.5 bg-[#F7F8FA] hover:bg-[#17243A] hover:text-white border border-[#E9EEF4] text-[#17243A] text-[10px] font-mono rounded cursor-pointer transition-colors"
                      >
                        D{d.dayNumber}
                      </button>
                    ))}
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
    <div className="w-full md:w-[460px] lg:w-[480px] xl:w-[520px] flex-1 h-full bg-white border-r border-[#E9EEF4] flex flex-col p-6 select-none">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9EEF4]">
        <div>
          <h2 className="text-sm font-bold font-display text-[#17243A]">
            Notas y recordatorios
          </h2>
          <span className="text-xs text-[#64748B]">
            Apunta datos importantes de reservas, contactos y consejos
          </span>
        </div>
        <span className="text-[10px] text-[#64748B] font-medium bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#E9EEF4]">
          Autoguardado
        </span>
      </div>

      <textarea
        value={trip.notes || ''}
        onChange={(e) => onUpdateNotes(e.target.value)}
        placeholder="Escribe consejos, contactos de choferes locales, reservas de hotel o recomendaciones gastronómicas en La Libertad..."
        className="w-full flex-1 p-4 text-xs bg-[#F7F8FA] border border-[#E9EEF4] rounded-xl resize-none text-[#17243A] leading-relaxed focus:outline-none focus:border-[#17243A]"
      />
    </div>
  );
};
