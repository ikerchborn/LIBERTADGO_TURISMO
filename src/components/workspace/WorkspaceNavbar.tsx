import React, { useState } from 'react';
import { Compass, Calendar, MapPin, Edit2, Share2, Plus, Check, X, Layers } from 'lucide-react';
import { TripItinerary } from '../../types/catalog.ts';
import { formatDateRange } from '../../utils/dateUtils.ts';

interface WorkspaceNavbarProps {
  trip: TripItinerary;
  onEditTrip: () => void;
  onNewTrip: () => void;
  onUpdateTripTitle: (newTitle: string) => void;
  onOpenArchitectureModal: () => void;
  onOpenDestinations: () => void;
  mobileTab: 'content' | 'map';
  setMobileTab: (tab: 'content' | 'map') => void;
}

export const WorkspaceNavbar: React.FC<WorkspaceNavbarProps> = ({
  trip,
  onEditTrip,
  onNewTrip,
  onUpdateTripTitle,
  onOpenArchitectureModal,
  onOpenDestinations,
  mobileTab,
  setMobileTab,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(trip.title);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const formattedDates = formatDateRange(trip.startDate, trip.endDate);

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
    <header className="h-14 bg-white border-b border-[#E9EEF4] px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Zona Izquierda: Logo y Datos del Viaje */}
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-[#E9EEF4]">
          <div className="w-7 h-7 rounded-lg bg-[#17243A] text-white flex items-center justify-center">
            <Compass className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-sm font-bold font-display text-[#17243A] tracking-tight hidden sm:inline">
            Libertad<span className="text-[#E85B49]">GO</span>
          </span>
        </div>

        {/* Título editable del viaje */}
        <div className="flex items-center gap-2 truncate">
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="px-2 py-0.5 text-xs font-bold text-[#17243A] border border-[#17243A] rounded-md focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 text-[#27856C] hover:bg-[#F7F8FA] rounded cursor-pointer"
                title="Guardar"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleInput(trip.title);
                  setIsEditingTitle(false);
                }}
                className="p-1 text-[#64748B] hover:bg-[#F7F8FA] rounded cursor-pointer"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 text-left group truncate cursor-pointer hover:bg-[#F7F8FA] px-1.5 py-0.5 rounded-md transition-colors"
              title="Clic para editar título"
            >
              <h1 className="text-xs sm:text-sm font-bold font-display text-[#17243A] truncate">
                {trip.title}
              </h1>
              <Edit2 className="w-3 h-3 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* Badges de destino y fechas */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#64748B]">
            <span>·</span>
            <button
              type="button"
              onClick={onEditTrip}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#F7F8FA] transition-colors cursor-pointer text-[#17243A] font-medium"
              title="Cambiar destino o fechas"
            >
              <MapPin className="w-3 h-3 text-[#E85B49]" />
              <span>{trip.destinationName}</span>
            </button>

            <span>·</span>
            <button
              type="button"
              onClick={onEditTrip}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#F7F8FA] transition-colors cursor-pointer text-[#64748B]"
              title="Editar fechas del viaje"
            >
              <Calendar className="w-3 h-3" />
              <span>{formattedDates}</span>
              <span className="font-mono text-[11px] text-[#17243A] font-semibold bg-[#F7F8FA] px-1.5 py-0.2 rounded border border-[#E9EEF4]">
                {trip.totalDays}d
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Switcher Móvil (< 1024px) */}
      <div className="flex lg:hidden items-center bg-[#F7F8FA] p-0.5 rounded-lg border border-[#E9EEF4]">
        <button
          type="button"
          onClick={() => setMobileTab('content')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            mobileTab === 'content'
              ? 'bg-white text-[#17243A] shadow-xs'
              : 'text-[#64748B]'
          }`}
        >
          Planificador
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            mobileTab === 'map'
              ? 'bg-white text-[#17243A] shadow-xs'
              : 'text-[#64748B]'
          }`}
        >
          Mapa ({trip.activities.length})
        </button>
      </div>

      {/* Zona Derecha: Acciones principales únicas */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenDestinations}
          className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#17243A] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
        >
          Destinos
        </button>

        <button
          type="button"
          onClick={onOpenArchitectureModal}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#17243A] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Arquitectura</span>
        </button>

        <div className="h-4 w-px bg-[#E9EEF4] mx-1" />

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#17243A] bg-[#F7F8FA] hover:bg-[#E9EEF4]/70 border border-[#E9EEF4] rounded-lg transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{copyFeedback ? '¡Copiado!' : 'Compartir'}</span>
        </button>

        {/* Único botón de Nuevo Viaje con Coral */}
        <button
          type="button"
          onClick={onNewTrip}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#D94C3A] rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo Viaje</span>
        </button>
      </div>
    </header>
  );
};
