import React, { useState } from 'react';
import {
  Compass,
  Plus,
  MapPin,
  Calendar,
  Layers,
  Share2,
  Check,
  Edit2,
  X,
  Map as MapIcon,
  ChevronRight,
} from 'lucide-react';
import { TripItinerary } from '../types/catalog.ts';
import { formatDateRange } from '../utils/dateUtils.ts';

interface HeaderProps {
  currentTrip: TripItinerary | null;
  activeView: 'workspace' | 'destinations';
  setActiveView: (view: 'workspace' | 'destinations') => void;
  onOpenCreateModal: () => void;
  onEditTrip?: () => void;
  onUpdateTripTitle?: (newTitle: string) => void;
  onOpenArchitectureModal: () => void;
  mobileTab?: 'content' | 'map';
  setMobileTab?: (tab: 'content' | 'map') => void;
  isMapCollapsed?: boolean;
  onToggleMapCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrip,
  activeView,
  setActiveView,
  onOpenCreateModal,
  onEditTrip,
  onUpdateTripTitle,
  onOpenArchitectureModal,
  mobileTab = 'content',
  setMobileTab,
  isMapCollapsed = false,
  onToggleMapCollapse,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentTrip?.title || '');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const formattedDates = currentTrip
    ? formatDateRange(currentTrip.startDate, currentTrip.endDate)
    : '';

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim() && onUpdateTripTitle) {
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

  const isInWorkspace = activeView === 'workspace' && currentTrip !== null;

  return (
    <header className="h-14 bg-white border-b border-[#E9EEF4] px-3 sm:px-4 lg:px-6 flex items-center justify-between shrink-0 select-none z-30 transition-all">
      {/* ============================================================ */}
      {/* ZONA IZQUIERDA: Marca + (Datos del viaje si está en workspace) */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Brand */}
        <button
          type="button"
          onClick={() => setActiveView('workspace')}
          className="flex items-center gap-2 shrink-0 group cursor-pointer text-left"
          title="Ir al planificador"
        >
          <div className="w-8 h-8 rounded-lg bg-[#17243A] text-white flex items-center justify-center group-hover:bg-[#1E293B] transition-colors shadow-2xs">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold font-display tracking-tight text-[#17243A] leading-none">
              Libertad<span className="text-[#E85B49]">GO</span>
            </span>
            <span className="text-[10px] text-[#64748B] tracking-wider uppercase mt-0.5 hidden xs:inline">
              La Libertad · Perú
            </span>
          </div>
        </button>

        {/* Separador y Contexto de Viaje Activo */}
        {isInWorkspace && currentTrip && (
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E9EEF4] min-w-0">
            {/* Título editable del viaje */}
            <div className="min-w-0 truncate">
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
                      setTitleInput(currentTrip.title);
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
                  onClick={() => {
                    setTitleInput(currentTrip.title);
                    setIsEditingTitle(true);
                  }}
                  className="flex items-center gap-1.5 text-left group truncate cursor-pointer hover:bg-[#F7F8FA] px-1.5 py-0.5 rounded-md transition-colors"
                  title="Clic para editar título del viaje"
                >
                  <h1 className="text-xs sm:text-sm font-bold font-display text-[#17243A] truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs">
                    {currentTrip.title}
                  </h1>
                  <Edit2 className="w-3 h-3 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
            </div>

            {/* Badges de Destino y Fechas (Clickables para editar) */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#64748B] shrink-0">
              <span>·</span>
              <button
                type="button"
                onClick={onEditTrip || onOpenCreateModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#F7F8FA] text-[#17243A] font-medium transition-colors cursor-pointer"
                title="Cambiar destino del viaje"
              >
                <MapPin className="w-3 h-3 text-[#E85B49]" />
                <span>{currentTrip.destinationName}</span>
              </button>

              <span>·</span>
              <button
                type="button"
                onClick={onEditTrip || onOpenCreateModal}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-[#F7F8FA] text-[#64748B] transition-colors cursor-pointer"
                title="Editar fechas del viaje"
              >
                <Calendar className="w-3 h-3" />
                <span>{formattedDates}</span>
                <span className="font-mono text-[10px] text-[#17243A] font-semibold bg-[#F7F8FA] px-1.5 py-0.2 rounded border border-[#E9EEF4]">
                  {currentTrip.totalDays}d / {currentTrip.totalNights}n
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ZONA CENTRAL: Enlaces Globales o Switcher Móvil (< 1024px)   */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3">
        {/* Switcher Móvil cuando hay viaje activo en workspace */}
        {isInWorkspace && currentTrip && setMobileTab && (
          <div className="flex lg:hidden items-center bg-[#F7F8FA] p-0.5 rounded-lg border border-[#E9EEF4]">
            <button
              type="button"
              onClick={() => setMobileTab('content')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mobileTab === 'content'
                  ? 'bg-white text-[#17243A] shadow-2xs font-bold'
                  : 'text-[#64748B]'
              }`}
            >
              Plan
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mobileTab === 'map'
                  ? 'bg-white text-[#17243A] shadow-2xs font-bold'
                  : 'text-[#64748B]'
              }`}
            >
              Mapa ({currentTrip.activities.length})
            </button>
          </div>
        )}

        {/* Navegación Global (Visible en Desktop) */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-[#64748B]">
          <button
            type="button"
            onClick={() => setActiveView('workspace')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-[#17243A] px-2 py-1 rounded-md ${
              activeView === 'workspace'
                ? 'text-[#17243A] font-semibold bg-[#F7F8FA]'
                : ''
            }`}
          >
            Planificador
          </button>
          <button
            type="button"
            onClick={() => setActiveView('destinations')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-[#17243A] px-2 py-1 rounded-md ${
              activeView === 'destinations'
                ? 'text-[#17243A] font-semibold bg-[#F7F8FA]'
                : ''
            }`}
          >
            Destinos Liberteños
          </button>
          <button
            type="button"
            onClick={onOpenArchitectureModal}
            className="flex items-center gap-1.5 text-[#64748B] hover:text-[#17243A] hover:bg-[#F7F8FA] px-2 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Arquitectura MVP</span>
          </button>
        </nav>
      </div>

      {/* ============================================================ */}
      {/* ZONA DERECHA: Acciones Unificadas (Mapa, Compartir, Nuevo)   */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle para Contraer / Expandir Mapa (Solo Desktop en Workspace) */}
        {isInWorkspace && onToggleMapCollapse && (
          <button
            type="button"
            onClick={onToggleMapCollapse}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#17243A] bg-[#F7F8FA] hover:bg-[#E9EEF4] rounded-lg border border-[#E9EEF4] transition-colors cursor-pointer"
            title={isMapCollapsed ? 'Ver mapa lateral' : 'Contraer mapa lateral'}
          >
            <MapIcon className="w-3.5 h-3.5 text-[#E85B49]" />
            <span>{isMapCollapsed ? 'Ver mapa' : 'Ocultar mapa'}</span>
          </button>
        )}

        {/* Compartir viaje */}
        {isInWorkspace && (
          <button
            type="button"
            onClick={handleShare}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#17243A] bg-[#F7F8FA] hover:bg-[#E9EEF4]/70 border border-[#E9EEF4] rounded-lg transition-colors cursor-pointer"
            title="Copiar enlace del viaje"
          >
            <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>{copyFeedback ? '¡Copiado!' : 'Compartir'}</span>
          </button>
        )}

        {/* Enlace a Destinos en móvil si no hay espacio */}
        {activeView === 'workspace' && (
          <button
            type="button"
            onClick={() => setActiveView('destinations')}
            className="lg:hidden p-1.5 text-xs text-[#64748B] hover:text-[#17243A] hover:bg-[#F7F8FA] rounded-md transition-colors cursor-pointer"
            title="Ver destinos"
          >
            <MapPin className="w-4 h-4" />
          </button>
        )}

        {/* ÚNICO Botón Primario de Nuevo / Crear Viaje */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#D94C3A] active:scale-[0.98] rounded-lg transition-all cursor-pointer shadow-2xs whitespace-nowrap"
          aria-label="Nuevo viaje"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{currentTrip ? 'Nuevo Viaje' : 'Crear Viaje'}</span>
        </button>
      </div>
    </header>
  );
};
