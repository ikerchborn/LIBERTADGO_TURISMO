import React from 'react';
import { MapPin, Calendar, ArrowRight, Star, Compass } from 'lucide-react';
import { LA_LIBERTAD_LOCALITIES, Locality } from '../types/geo.ts';

interface DestinationsGalleryProps {
  onSelectDestinationForTrip: (localityId: string) => void;
}

export const DestinationsGallery: React.FC<DestinationsGalleryProps> = ({
  onSelectDestinationForTrip,
}) => {
  const priorityLocalities = LA_LIBERTAD_LOCALITIES.filter((l) => l.isPriority);
  const otherLocalities = LA_LIBERTAD_LOCALITIES.filter((l) => !l.isPriority);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Intro section */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E85B49]/10 text-[#E85B49] text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Región La Libertad · Perú</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-900 tracking-tight">
          Destinos Turísticos Oficiales
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Catálogo curado de 10 localidades en La Libertad. Desde las olas legendarias del Pacífico y ciudadelas prehispánicas de adobe hasta los valles vinícolas y fortalezas andinas.
        </p>
      </div>

      {/* Priority Destinations (Trujillo, Huanchaco, Moche, Víctor Larco) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              Localidades Prioritarias
            </h3>
          </div>
          <span className="text-xs text-slate-500">Cobertura detallada inicial</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityLocalities.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-lg border border-[#E9E7E1] overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={loc.heroImage}
                  alt={loc.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
                  Prov. {loc.province}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#263B35] group-hover:text-[#E85B49] transition-colors">
                    {loc.name}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    {loc.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {loc.highlights.slice(0, 2).map((h, i) => (
                      <span key={i} className="text-[10px] bg-[#F7F2E8] text-[#263B35] px-1.5 py-0.5 rounded border border-[#E9E7E1]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectDestinationForTrip(loc.id)}
                  className="mt-4 w-full py-2 px-3 bg-[#263B35] hover:bg-[#E85B49] text-white font-medium text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Planificar viaje aquí</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other 6 Localities */}
      <div>
        <h3 className="text-base font-bold text-slate-900 font-display mb-4">
          Otras Rutas y Localidades Liberteñas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {otherLocalities.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-lg border border-[#E9E7E1] p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#263B35] group-hover:text-[#E85B49] transition-colors">
                    {loc.name}
                  </h4>
                  <span className="text-[10px] text-[#64748B] bg-[#F7F2E8] px-2 py-0.5 rounded border border-[#E9E7E1]">
                    Prov. {loc.province}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2">
                  {loc.description}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {loc.highlights.slice(0, 3).map((h, i) => (
                    <span key={i} className="text-[10px] text-[#64748B]">
                      • {h}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectDestinationForTrip(loc.id)}
                className="mt-3.5 w-full py-1.5 px-3 bg-[#F7F2E8] hover:bg-[#E85B49] text-[#263B35] hover:text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Crear viaje a {loc.name}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
