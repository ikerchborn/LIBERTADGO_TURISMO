import React from 'react';
import {
  Compass,
  Search,
  FileText,
  Bookmark,
  Calendar
} from 'lucide-react';
import { TripItinerary } from '../../types/catalog.ts';
import { generateDayList } from '../../utils/dateUtils.ts';

export type WorkspaceSection = 'overview' | 'explore' | 'notes' | 'saved' | 'itinerary';

interface WorkspaceSidebarProps {
  trip: TripItinerary;
  activeSection: WorkspaceSection;
  onSelectSection: (section: WorkspaceSection) => void;
  selectedDayNumber: number | null;
  onSelectDayNumber: (day: number | null) => void;
  totalPlacesCount?: number;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  trip,
  activeSection,
  onSelectSection,
  selectedDayNumber,
  onSelectDayNumber,
  totalPlacesCount,
}) => {
  const dayItems = generateDayList(trip.startDate, trip.totalDays);
  const savedCount = trip.savedPlaceIds?.length || 0;
  const totalActivities = trip.activities.length;

  return (
    <>
      {/* 
        VISTA MÓVIL (< md):
        Barra horizontal limpia de pestañas optimizada para smartphones
      */}
      <div className="flex md:hidden flex-col w-full bg-white border-b border-[#E9EEF4] shrink-0 select-none">
        {/* Pestañas de sección con scroll táctil fluido sin barra nativa */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 no-scrollbar border-b border-[#E9EEF4]/60 scroll-smooth">
          <button
            type="button"
            onClick={() => {
              onSelectSection('itinerary');
              onSelectDayNumber(null);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'itinerary'
                ? 'bg-[#17243A] text-white font-semibold shadow-xs'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]/70 font-medium'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${activeSection === 'itinerary' ? 'text-[#E85B49]' : 'text-[#64748B]'}`} />
            <span>Itinerario</span>
            {totalActivities > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full leading-none font-semibold ${
                  activeSection === 'itinerary'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E2E8F0] text-[#475569]'
                }`}
              >
                {totalActivities}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('explore');
              onSelectDayNumber(null);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'explore'
                ? 'bg-[#17243A] text-white font-semibold shadow-xs'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]/70 font-medium'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${activeSection === 'explore' ? 'text-[#E85B49]' : 'text-[#64748B]'}`} />
            <span>Explorar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('saved');
              onSelectDayNumber(null);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'saved'
                ? 'bg-[#17243A] text-white font-semibold shadow-xs'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]/70 font-medium'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${activeSection === 'saved' ? 'text-[#E85B49] fill-[#E85B49]' : 'text-[#64748B]'}`} />
            <span>Por visitar</span>
            {savedCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full leading-none font-semibold ${
                  activeSection === 'saved'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E2E8F0] text-[#475569]'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('notes');
              onSelectDayNumber(null);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'notes'
                ? 'bg-[#17243A] text-white font-semibold shadow-xs'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]/70 font-medium'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${activeSection === 'notes' ? 'text-[#E85B49]' : 'text-[#64748B]'}`} />
            <span>Notas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('overview');
              onSelectDayNumber(null);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'overview'
                ? 'bg-[#17243A] text-white font-semibold shadow-xs'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]/70 font-medium'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${activeSection === 'overview' ? 'text-[#E85B49]' : 'text-[#64748B]'}`} />
            <span>Resumen</span>
          </button>
        </div>

        {/* Sub-selector de días si está en itinerario */}
        {activeSection === 'itinerary' && (
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 bg-[#F8FAFC] no-scrollbar border-b border-[#E9EEF4]/70 scroll-smooth">
            <button
              type="button"
              onClick={() => onSelectDayNumber(null)}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono shrink-0 cursor-pointer transition-colors ${
                selectedDayNumber === null
                  ? 'bg-[#17243A] text-white font-bold shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#17243A] border border-[#E2E8F0]'
              }`}
            >
              Todos los días
            </button>
            {dayItems.map((d) => (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => onSelectDayNumber(d.dayNumber)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono shrink-0 cursor-pointer transition-colors ${
                  selectedDayNumber === d.dayNumber
                    ? 'bg-[#17243A] text-white font-bold shadow-xs'
                    : 'bg-white text-[#64748B] hover:text-[#17243A] border border-[#E2E8F0]'
                }`}
              >
                Día {d.dayNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 
        VISTA ESCRITORIO (≥ md):
        Barra lateral vertical fija SaaS
      */}
      <aside className="hidden md:flex w-52 h-full min-h-0 bg-white border-r border-[#E9EEF4] flex-col py-3 select-none shrink-0 overflow-y-auto">
        <div className="px-3 space-y-0.5">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-2 block mb-1">
            Navegación
          </span>

          <button
            type="button"
            onClick={() => {
              onSelectSection('overview');
              onSelectDayNumber(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
              activeSection === 'overview'
                ? 'bg-[#17243A] text-white'
                : 'text-[#17243A] hover:bg-[#F7F8FA]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 opacity-80" />
              <span>Resumen</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('explore');
              onSelectDayNumber(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
              activeSection === 'explore'
                ? 'bg-[#17243A] text-white'
                : 'text-[#17243A] hover:bg-[#F7F8FA]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 opacity-80" />
              <span>Explorar</span>
            </div>
            {totalPlacesCount !== undefined && totalPlacesCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeSection === 'explore'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F7F8FA] text-[#64748B] border border-[#E9EEF4]'
                }`}
              >
                {totalPlacesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('notes');
              onSelectDayNumber(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
              activeSection === 'notes'
                ? 'bg-[#17243A] text-white'
                : 'text-[#17243A] hover:bg-[#F7F8FA]'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 opacity-80" />
              <span>Notas</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('saved');
              onSelectDayNumber(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
              activeSection === 'saved'
                ? 'bg-[#17243A] text-white'
                : 'text-[#17243A] hover:bg-[#F7F8FA]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 opacity-80" />
              <span>Lugares para visitar</span>
            </div>
            {savedCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeSection === 'saved'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F7F8FA] text-[#64748B] border border-[#E9EEF4]'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>

        <div className="h-px bg-[#E9EEF4] my-3 mx-3" />

        <div className="px-3 flex-1">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Itinerario
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">
              {totalActivities} act.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectSection('itinerary');
              onSelectDayNumber(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left mb-1 ${
              activeSection === 'itinerary' && selectedDayNumber === null
                ? 'bg-[#17243A] text-white font-medium'
                : 'text-[#17243A] hover:bg-[#F7F8FA]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 opacity-80" />
              <span>Todos los días</span>
            </div>
          </button>

          <div className="space-y-0.5 ml-1 pl-2 border-l border-[#E9EEF4]">
            {dayItems.map((day) => {
              const dayCount = trip.activities.filter((a) => a.dayNumber === day.dayNumber).length;
              const isSelected = activeSection === 'itinerary' && selectedDayNumber === day.dayNumber;

              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => {
                    onSelectSection('itinerary');
                    onSelectDayNumber(day.dayNumber);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#17243A] text-white font-medium'
                      : 'text-[#475569] hover:bg-[#F7F8FA] hover:text-[#17243A]'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-medium">{day.label}</span>
                    <span className="text-[10px] opacity-70 ml-1.5">
                      {day.formattedDate.split(',')[0]}
                    </span>
                  </div>
                  {dayCount > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F7F8FA] text-[#64748B] border border-[#E9EEF4]'
                      }`}
                    >
                      {dayCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
