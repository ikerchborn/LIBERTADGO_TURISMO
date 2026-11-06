import React, { useState } from 'react';
import { Calendar, MapPin, Edit3, Plus, Share2, Layers, PanelLeft, PanelRight, Check, X } from 'lucide-react';
import { TripItinerary } from '../../types/catalog.ts';
import { formatDateRange } from '../../utils/dateUtils.ts';

interface WorkspaceHeaderProps {
  trip: TripItinerary;
  onEditTrip: () => void;
  onNewTrip: () => void;
  onUpdateTripTitle: (newTitle: string) => void;
  // Responsive mode for mobile
  mobileTab: 'itinerary' | 'map' | 'discovery';
  setMobileTab: (tab: 'itinerary' | 'map' | 'discovery') => void;
  // Desktop panel collapse toggles
  showLeftPanel: boolean;
  setShowLeftPanel: (show: boolean) => void;
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  trip,
  onEditTrip,
  onNewTrip,
  onUpdateTripTitle,
  mobileTab,
  setMobileTab,
  showLeftPanel,
  setShowLeftPanel,
  showRightPanel,
  setShowRightPanel,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(trip.title);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const formattedDateRange = formatDateRange(trip.startDate, trip.endDate);

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim()) {
      onUpdateTripTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/90 px-3 md:px-5 py-2.5 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
      {/* Left zone: Destination, Title, Dates & Duration */}
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Toggle left panel button (desktop) */}
        <button
          type="button"
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          title={showLeftPanel ? 'Ocultar panel de itinerario' : 'Mostrar panel de itinerario'}
          className={`hidden lg:flex p-1.5 rounded-lg border transition-colors cursor-pointer ${
            showLeftPanel
              ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-800'
          }`}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Destination Chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E05A47]/10 text-[#E05A47] text-xs font-semibold shrink-0">
          <MapPin className="w-3.5 h-3.5" />
          <span>{trip.destinationName}</span>
        </div>

        {/* Title (Inline editable) */}
        <div className="truncate flex items-center gap-2">
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="px-2 py-0.5 text-sm font-bold border border-[#E05A47] rounded-md focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                title="Guardar nombre"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleInput(trip.title);
                  setIsEditingTitle(false);
                }}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h2 className="text-sm md:text-base font-bold font-display text-slate-900 truncate">
                {trip.title}
              </h2>
              <Edit3 className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}

          {/* Dates & duration */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0 ml-1">
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formattedDateRange}</span>
            </div>
            <span className="text-slate-300">·</span>
            <span className="font-mono tabular-nums text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
              {trip.totalDays}d / {trip.totalNights}n
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[#E05A47] font-semibold">
              {trip.activities.length} {trip.activities.length === 1 ? 'lugar' : 'lugares'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher (< 1024px) */}
      <div className="flex lg:hidden items-center justify-between border-t border-slate-100 pt-2 md:pt-0 md:border-t-0">
        <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMobileTab('itinerary')}
            className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mobileTab === 'itinerary'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Itinerario ({trip.activities.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mapa
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('discovery')}
            className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mobileTab === 'discovery'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Descubrir
          </button>
        </div>

        <div className="flex sm:hidden items-center gap-1.5 ml-2">
          <button
            type="button"
            onClick={onEditTrip}
            className="p-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Editar fechas o destino"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right zone: Actions */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEditTrip}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Editar fechas</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{copyFeedback ? '¡Enlace copiado!' : 'Compartir'}</span>
        </button>

        <button
          type="button"
          onClick={onNewTrip}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#E05A47] hover:bg-[#CB4B39] rounded-lg transition-colors cursor-pointer shadow-xs shadow-[#E05A47]/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo Viaje</span>
        </button>

        {/* Toggle right panel button (desktop) */}
        <button
          type="button"
          onClick={() => setShowRightPanel(!showRightPanel)}
          title={showRightPanel ? 'Ocultar panel de descubrimiento' : 'Mostrar panel de descubrimiento'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            showRightPanel
              ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-800'
          }`}
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
