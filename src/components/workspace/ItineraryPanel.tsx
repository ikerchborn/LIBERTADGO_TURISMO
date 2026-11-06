import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Bookmark,
  ArrowUp,
  ArrowDown,
  FileText,
  Sparkles,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { TripItinerary, Place, TripActivity } from '../../types/catalog.ts';
import { generateDayList, TripDayItem } from '../../utils/dateUtils.ts';

interface ItineraryPanelProps {
  trip: TripItinerary;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onAddPlaceQuick: (place: Place, dayNumber: number) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveActivityToDay: (activityId: string, targetDayNumber: number) => void;
  onReorderActivity: (activityId: string, direction: 'up' | 'down') => void;
  onAddManualActivity: (dayNumber: number, title: string, timeSlot?: string, notes?: string) => void;
  onUpdateNotes: (notes: string) => void;
}

export const ItineraryPanel: React.FC<ItineraryPanelProps> = ({
  trip,
  places,
  selectedPlace,
  onSelectPlace,
  onAddPlaceQuick,
  onRemoveActivity,
  onMoveActivityToDay,
  onReorderActivity,
  onAddManualActivity,
  onUpdateNotes,
}) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'saved' | 'notes'>('itinerary');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    // Expand day 1 and day 2 by default
    return { 1: true, 2: true };
  });

  // Manual activity form state
  const [isAddingManualForDay, setIsAddingManualForDay] = useState<number | null>(null);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Drag and drop state
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const dayItems: TripDayItem[] = generateDayList(trip.startDate, trip.totalDays);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleCreateManualActivity = (e: React.FormEvent, dayNumber: number) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    onAddManualActivity(dayNumber, manualTitle.trim(), manualTime.trim() || undefined, manualNotes.trim() || undefined);
    setManualTitle('');
    setManualTime('');
    setManualNotes('');
    setIsAddingManualForDay(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    e.dataTransfer.setData('text/plain', activityId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedActivityId(activityId);
  };

  const handleDragOverDay = (e: React.DragEvent, dayNumber: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(dayNumber);
  };

  const handleDragLeaveDay = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnDay = (e: React.DragEvent, targetDayNumber: number) => {
    e.preventDefault();
    const activityId = e.dataTransfer.getData('text/plain') || draggedActivityId;
    if (activityId) {
      onMoveActivityToDay(activityId, targetDayNumber);
    }
    setDraggedActivityId(null);
    setDragOverDay(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden select-none">
      {/* Panel Top Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 px-3 pt-2 bg-slate-50/70 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('itinerary')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'itinerary'
              ? 'border-[#E05A47] text-[#E05A47]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Itinerario por días</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-full">
            {trip.activities.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'saved'
              ? 'border-[#E05A47] text-[#E05A47]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Lugares guardados</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-[#E05A47] text-[#E05A47]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notas</span>
        </button>
      </div>

      {/* Tab 1: Itinerario por Días */}
      {activeTab === 'itinerary' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* Quick suggestions strip */}
          <div className="bg-[#FAF7F2] border border-amber-200/60 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                Destacados en {trip.destinationName}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">Sugerencias</span>
            </div>
            <div className="space-y-1.5">
              {places.slice(0, 3).map((place) => {
                const isAlreadyAdded = trip.activities.some((a) => a.placeId === place.id);
                return (
                  <div
                    key={place.id}
                    className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200/60 hover:border-[#E05A47]/40 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPlace(place)}
                      className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
                    >
                      <img
                        src={place.images[0]?.url || ''}
                        alt={place.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded object-cover shrink-0 bg-slate-100"
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {place.name}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {place.category} · {place.localityName}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAddPlaceQuick(place, 1)}
                      className={`p-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        isAlreadyAdded
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-[#E05A47] hover:bg-[#E05A47]/10'
                      }`}
                      title={isAlreadyAdded ? 'Ya agregado (clic para sumar al Día 1)' : 'Agregar al Día 1'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Día 1</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Days Accordion */}
          <div className="space-y-3">
            {dayItems.map((day) => {
              const isExpanded = expandedDays[day.dayNumber] !== false;
              const dayActivities = trip.activities
                .filter((a) => a.dayNumber === day.dayNumber)
                .sort((a, b) => a.order - b.order);

              const isDropTarget = dragOverDay === day.dayNumber;

              return (
                <div
                  key={day.dayNumber}
                  onDragOver={(e) => handleDragOverDay(e, day.dayNumber)}
                  onDragLeave={handleDragLeaveDay}
                  onDrop={(e) => handleDropOnDay(e, day.dayNumber)}
                  className={`border rounded-xl overflow-hidden bg-white shadow-xs transition-all ${
                    isDropTarget ? 'border-[#E05A47] ring-2 ring-[#E05A47]/20 bg-rose-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Day Header Accordion Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 hover:bg-slate-100/70 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleDay(day.dayNumber)}
                      className="flex items-center gap-2 text-left cursor-pointer flex-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {day.formattedDate}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {day.label} · <strong className="text-slate-700">{dayActivities.length}</strong>{' '}
                          {dayActivities.length === 1 ? 'actividad' : 'actividades'}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingManualForDay(isAddingManualForDay === day.dayNumber ? null : day.dayNumber);
                          setExpandedDays((prev) => ({ ...prev, [day.dayNumber]: true }));
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-[#E05A47] bg-white hover:bg-[#E05A47]/10 border border-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                        title="Agregar actividad manual o nota"
                      >
                        <Plus className="w-3 h-3 text-[#E05A47]" />
                        <span>Actividad</span>
                      </button>
                    </div>
                  </div>

                  {/* Day Content */}
                  {isExpanded && (
                    <div className="p-2.5 space-y-2 border-t border-slate-100">
                      {/* Inline Manual Form if active */}
                      {isAddingManualForDay === day.dayNumber && (
                        <form
                          onSubmit={(e) => handleCreateManualActivity(e, day.dayNumber)}
                          className="p-3 bg-[#FAF7F2] border border-amber-200/80 rounded-xl space-y-2.5 animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 uppercase">
                              Nueva Actividad en {day.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsAddingManualForDay(null)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Nombre de la actividad (ej. Almuerzo marino, Paseo en bote)"
                            value={manualTitle}
                            onChange={(e) => setManualTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E05A47]"
                            autoFocus
                            required
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Hora (ej. 10:30)"
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                className="w-full text-xs outline-none"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Notas breves"
                              value={manualNotes}
                              onChange={(e) => setManualNotes(e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                            />
                          </div>

                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsAddingManualForDay(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs font-semibold text-white bg-[#E05A47] hover:bg-[#CB4B39] rounded-md cursor-pointer"
                            >
                              Guardar
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Activities List */}
                      {dayActivities.length === 0 && isAddingManualForDay !== day.dayNumber ? (
                        <div className="text-center py-4 px-2 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                          <p className="text-xs text-slate-400">
                            Sin actividades en {day.label}.
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Arrastra lugares aquí o agrégalos desde el panel derecho.
                          </p>
                        </div>
                      ) : (
                        dayActivities.map((act, index) => {
                          const isSelected = selectedPlace?.id === act.placeId;

                          return (
                            <div
                              key={act.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, act.id)}
                              className={`group flex items-start gap-2 p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                                isSelected
                                  ? 'bg-rose-50/50 border-[#E05A47] shadow-xs'
                                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                              }`}
                            >
                              {/* Drag handle & Sequence number */}
                              <div className="flex flex-col items-center justify-center shrink-0 pt-0.5">
                                <span className="w-5 h-5 rounded-full bg-[#E05A47] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                                  {index + 1}
                                </span>
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 mt-1" />
                              </div>

                              {/* Activity info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (act.place) onSelectPlace(act.place);
                                    }}
                                    className="text-xs font-bold text-slate-900 hover:text-[#E05A47] text-left truncate cursor-pointer"
                                  >
                                    {act.customTitle || act.place?.name || 'Actividad'}
                                  </button>
                                  {act.place && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectPlace(act.place!)}
                                      className="text-slate-400 hover:text-[#E05A47] p-0.5"
                                      title="Ver en el mapa"
                                    >
                                      <MapPin className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                  {act.timeSlot ? (
                                    <span className="flex items-center gap-0.5 text-slate-700 font-mono font-medium">
                                      <Clock className="w-2.5 h-2.5" />
                                      {act.timeSlot}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">Horario flexible</span>
                                  )}
                                  {act.place?.subcategory && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate">{act.place.subcategory}</span>
                                    </>
                                  )}
                                </div>

                                {act.notes && (
                                  <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100 italic">
                                    «{act.notes}»
                                  </p>
                                )}

                                {/* Action controls: Reorder, Move Day, Delete */}
                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                                  {/* Day switcher dropdown */}
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400">Mover:</span>
                                    <select
                                      value={act.dayNumber}
                                      onChange={(e) => onMoveActivityToDay(act.id, Number(e.target.value))}
                                      aria-label="Mover actividad a otro día"
                                      className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 outline-none"
                                    >
                                      {dayItems.map((d) => (
                                        <option key={d.dayNumber} value={d.dayNumber}>
                                          {d.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Reorder and Delete buttons */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={index === 0}
                                      onClick={() => onReorderActivity(act.id, 'up')}
                                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      title="Subir orden"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={index === dayActivities.length - 1}
                                      onClick={() => onReorderActivity(act.id, 'down')}
                                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                      title="Bajar orden"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onRemoveActivity(act.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                                      title="Eliminar actividad"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Lugares Guardados */}
      {activeTab === 'saved' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-amber-200/60 mb-2">
            <h4 className="text-xs font-bold text-slate-900">Lista de Deseos</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Lugares de La Libertad que te interesan antes de asignarlos a un día específico.
            </p>
          </div>

          <div className="space-y-2">
            {places.map((place) => {
              const isAlreadyAdded = trip.activities.some((a) => a.placeId === place.id);

              return (
                <div
                  key={place.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-colors flex items-center justify-between gap-2"
                >
                  <div className="truncate flex items-center gap-2">
                    <img
                      src={place.images[0]?.url || ''}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover shrink-0 bg-slate-200"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">{place.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{place.category} · {place.localityName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectPlace(place)}
                      className="text-xs px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:text-[#E05A47] rounded-lg font-medium cursor-pointer"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddPlaceQuick(place, 1)}
                      className="text-xs px-2 py-1 bg-[#E05A47] text-white hover:bg-[#CB4B39] rounded-lg font-medium cursor-pointer"
                      title="Agregar al Día 1"
                    >
                      + Día 1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Notas de Viaje */}
      {activeTab === 'notes' && (
        <div className="flex-1 flex flex-col p-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="itinerary-notes-textarea" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Notas y Recordatorios
            </label>
            <span className="text-[10px] text-slate-400">Guardado automático</span>
          </div>
          <textarea
            id="itinerary-notes-textarea"
            value={trip.notes || ''}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Escribe consejos, reservas de vuelo, contactos de hoteles, o recomendaciones gastronómicas (ej. 'Comer shambar el día lunes en El Rincón de Vallejo')..."
            className="w-full flex-1 p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E05A47]/20 focus:border-[#E05A47] leading-relaxed text-slate-800"
          />
        </div>
      )}
    </div>
  );
};
