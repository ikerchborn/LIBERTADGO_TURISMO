import React from 'react';
import { Compass, Plus, MapPin, Layers } from 'lucide-react';
import { TripItinerary } from '../types/catalog.ts';

interface HeaderProps {
  currentTrip: TripItinerary | null;
  onOpenCreateModal: () => void;
  onOpenArchitectureModal: () => void;
  activeView: 'workspace' | 'destinations';
  setActiveView: (view: 'workspace' | 'destinations') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrip,
  onOpenCreateModal,
  onOpenArchitectureModal,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E9EEF4] px-4 lg:px-6 h-14 flex items-center transition-all">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#17243A] text-white flex items-center justify-center">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold font-display tracking-tight text-[#17243A] leading-none">
              Libertad<span className="text-[#E85B49]">GO</span>
            </span>
            <span className="text-[10px] text-[#64748B] tracking-wider uppercase mt-0.5">
              La Libertad · Perú
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#64748B]">
          <button
            onClick={() => setActiveView('workspace')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-[#17243A] ${
              activeView === 'workspace' ? 'text-[#17243A] font-semibold' : ''
            }`}
          >
            Planificador
          </button>
          <button
            onClick={() => setActiveView('destinations')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-[#17243A] ${
              activeView === 'destinations' ? 'text-[#17243A] font-semibold' : ''
            }`}
          >
            Destinos Liberteños
          </button>
          <button
            onClick={onOpenArchitectureModal}
            className="flex items-center gap-1.5 text-[#64748B] hover:text-[#17243A] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Arquitectura MVP</span>
          </button>
        </nav>

        {/* Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentTrip && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B] bg-[#F7F8FA] border border-[#E9EEF4] rounded-lg px-2.5 py-1">
              <MapPin className="w-3 h-3 text-[#E85B49]" />
              <span className="font-semibold text-[#17243A]">{currentTrip.destinationName}</span>
              <span>·</span>
              <span className="font-mono">{currentTrip.totalDays}d / {currentTrip.totalNights}n</span>
            </div>
          )}

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#D94C3A] rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            aria-label="Crear viaje"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{currentTrip ? 'Nuevo Viaje' : 'Crear Viaje'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
