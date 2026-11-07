import React from 'react';
import { Calendar, MapPin, Edit3, Share2, Compass, Sparkles, Utensils, Landmark, Bed } from 'lucide-react';
import { TripItinerary } from '../types/catalog.ts';
import { formatDateRange } from '../utils/dateUtils.ts';

interface TripBannerProps {
  trip: TripItinerary;
  onEditTrip: () => void;
  onSelectCategoryFilter: (category: string) => void;
  onOpenAIQuickPrompt?: (prompt: string) => void;
}

export const TripBanner: React.FC<TripBannerProps> = ({
  trip,
  onEditTrip,
  onSelectCategoryFilter,
}) => {
  const formattedDates = formatDateRange(trip.startDate, trip.endDate);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-sm mb-6">
      {/* Cover Image with measured scrim */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&w=1200&q=80'}
          alt={`Destino ${trip.destinationName}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-black/20" />

        {/* Top actions */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
          <button
            onClick={onEditTrip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg transition-colors cursor-pointer"
            title="Editar fechas o destino"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar viaje</span>
          </button>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg transition-colors cursor-pointer"
            title="Compartir enlace de viaje"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>

        {/* Overlaid Card matching user screenshot attachment 11 */}
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/60">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E05A47] uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.destinationName} · Región La Libertad</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight leading-tight">
              {trip.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedDates}</span>
              </div>
              <span className="text-slate-300">·</span>
              <span className="font-mono tabular-nums text-slate-500">
                {trip.totalDays} días · {trip.totalNights} noches
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Explore Row (matches user screenshot attachment 11) */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#E05A47]/10 flex items-center justify-center text-[#E05A47]">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Explorar {trip.destinationName}
          </span>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <button
            onClick={() => onSelectCategoryFilter('restaurantes')}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 hover:border-[#E05A47]/40 hover:bg-[#FAF7F2] transition-colors text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 group-hover:text-[#E05A47]">
                Mejores restaurantes
              </div>
              <div className="text-[10px] text-slate-500">Comida trujillana y criolla</div>
            </div>
          </button>

          <button
            onClick={() => onSelectCategoryFilter('arqueologia')}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 hover:border-[#E05A47]/40 hover:bg-[#FAF7F2] transition-colors text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 group-hover:text-[#E05A47]">
                Chan Chan & Huacas
              </div>
              <div className="text-[10px] text-slate-500">Patrimonio Moche y Chimú</div>
            </div>
          </button>

          <button
            onClick={() => onSelectCategoryFilter('playas')}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 hover:border-[#E05A47]/40 hover:bg-[#FAF7F2] transition-colors text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 group-hover:text-[#E05A47]">
                Playas y Balnearios
              </div>
              <div className="text-[10px] text-slate-500">Huanchaco, Pacasmayo, Chicama</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
