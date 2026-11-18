import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { LA_LIBERTAD_LOCALITIES, Locality } from '../types/geo.ts';
import { calculateOptionalTripDates, formatDateRange } from '../utils/dateUtils.ts';
import { TripItinerary } from '../types/catalog.ts';
import { RiyMoLogo } from './common/RiyMoLogo.tsx';

export interface PublicTopHeaderProps {
  activeNav: 'plan' | 'destinations';
  onNavigatePlan: () => void;
  onNavigateDestinations: () => void;
}

export const PublicTopHeader: React.FC<PublicTopHeaderProps> = ({
  activeNav,
  onNavigatePlan,
  onNavigateDestinations,
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#E9E7E1] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 select-none z-30">
      {/* Izquierda: Logo RiyMo */}
      <button
        type="button"
        onClick={onNavigatePlan}
        className="flex items-center shrink-0 group cursor-pointer text-left focus:outline-none"
        title="RiyMo — Planifica un nuevo viaje"
      >
        <RiyMoLogo variant="full" size="md" showSubtitle={false} />
      </button>

      {/* Navegación sencilla: Planificar viaje y Destinos */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={onNavigatePlan}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeNav === 'plan'
              ? 'text-[#263B35] font-semibold bg-[#F7F2E8]'
              : 'text-[#64748B] hover:text-[#263B35] hover:bg-[#F7F2E8]/60'
          }`}
        >
          Planificar viaje
        </button>
        <button
          type="button"
          onClick={onNavigateDestinations}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeNav === 'destinations'
              ? 'text-[#263B35] font-semibold bg-[#F7F2E8]'
              : 'text-[#64748B] hover:text-[#263B35] hover:bg-[#F7F2E8]/60'
          }`}
        >
          Destinos
        </button>
      </nav>
    </header>
  );
};

interface TripCreationScreenProps {
  onTripCreated: (trip: TripItinerary) => void;
  initialDestinationId?: string | null;
  onNavigateDestinations: () => void;
}

export const TripCreationScreen: React.FC<TripCreationScreenProps> = ({
  onTripCreated,
  initialDestinationId = null,
  onNavigateDestinations,
}) => {
  const initialLocality = useMemo(() => {
    if (!initialDestinationId) return null;
    return LA_LIBERTAD_LOCALITIES.find((l) => l.id === initialDestinationId) || null;
  }, [initialDestinationId]);

  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(
    initialLocality?.id || ''
  );
  const [destinationInput, setDestinationInput] = useState<string>(
    initialLocality?.name || ''
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Fechas estrictamente opcionales: inician vacías
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialLocality) {
      setSelectedDestinationId(initialLocality.id);
      setDestinationInput(initialLocality.name);
      setErrorMsg(null);
    }
  }, [initialLocality]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLocality: Locality | null = useMemo(() => {
    if (!selectedDestinationId) return null;
    return LA_LIBERTAD_LOCALITIES.find((l) => l.id === selectedDestinationId) || null;
  }, [selectedDestinationId]);

  const filteredLocalities = useMemo(() => {
    const q = destinationInput.trim().toLowerCase();
    if (!q) return LA_LIBERTAD_LOCALITIES;
    if (selectedLocality && selectedLocality.name.toLowerCase() === q) {
      return LA_LIBERTAD_LOCALITIES;
    }
    return LA_LIBERTAD_LOCALITIES.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.province.toLowerCase().includes(q)
    );
  }, [destinationInput, selectedLocality]);

  const optionalDates = useMemo(() => {
    return calculateOptionalTripDates(startDate, endDate);
  }, [startDate, endDate]);

  const dateRangeFormatted = useMemo(() => {
    if (!optionalDates.hasDates) return '';
    return formatDateRange(optionalDates.startDate, optionalDates.endDate);
  }, [optionalDates]);

  const handleSelectLocality = (loc: Locality) => {
    setSelectedDestinationId(loc.id);
    setDestinationInput(loc.name);
    setIsDropdownOpen(false);
    setErrorMsg(null);
  };

  const resolveChosenLocality = (): Locality | null => {
    if (selectedLocality) return selectedLocality;
    const typed = destinationInput.trim().toLowerCase();
    if (!typed) return null;
    const exactMatch = LA_LIBERTAD_LOCALITIES.find(
      (l) => l.name.toLowerCase() === typed || l.id.toLowerCase() === typed
    );
    if (exactMatch) return exactMatch;
    if (filteredLocalities.length === 1) return filteredLocalities[0];
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const chosenLocality = resolveChosenLocality();
    if (!chosenLocality) {
      setErrorMsg('Selecciona un destino válido en La Libertad para comenzar.');
      setIsDropdownOpen(true);
      return;
    }

    if (!optionalDates.isValid) {
      setErrorMsg(optionalDates.error || 'Verifica las fechas seleccionadas.');
      return;
    }

    setIsSubmitting(true);
    const title = `Viaje a ${chosenLocality.name}`;

    const tripPayload = {
      destinationId: chosenLocality.id,
      startDate: optionalDates.startDate,
      endDate: optionalDates.endDate,
      title,
    };

    try {
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripPayload),
      });

      const json = await response.json();
      if (response.ok && json.success && json.data) {
        onTripCreated(json.data);
      } else {
        createLocalTrip(chosenLocality, title);
      }
    } catch {
      createLocalTrip(chosenLocality, title);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createLocalTrip = (locality: Locality, title: string) => {
    const newTrip: TripItinerary = {
      id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      destinationId: locality.id,
      destinationName: locality.name,
      startDate: optionalDates.startDate,
      endDate: optionalDates.endDate,
      totalDays: optionalDates.days,
      totalNights: optionalDates.nights,
      coverImage: locality.heroImage,
      notes: '',
      savedPlaceIds: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onTripCreated(newTrip);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white text-[#263B35]">
      <PublicTopHeader
        activeNav="plan"
        onNavigatePlan={() => {}}
        onNavigateDestinations={onNavigateDestinations}
      />

      {/* Área principal centrada, limpia y espaciosa */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#263B35] tracking-tight">
              Planifica un nuevo viaje
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] mt-2.5">
              Elige tu próximo destino en La Libertad y comienza a armar tu ruta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Campo principal de destino */}
            <div ref={dropdownContainerRef} className="space-y-2">
              <label
                htmlFor="destination-combobox"
                className="block text-sm font-semibold text-[#263B35]"
              >
                ¿A dónde quieres viajar?
              </label>

              <div className="relative">
                <MapPin className="w-4 h-4 text-[#E85B49] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="destination-combobox"
                  type="text"
                  value={destinationInput}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDestinationInput(val);
                    setIsDropdownOpen(true);
                    setErrorMsg(null);
                    const exact = LA_LIBERTAD_LOCALITIES.find(
                      (l) => l.name.toLowerCase() === val.trim().toLowerCase()
                    );
                    setSelectedDestinationId(exact ? exact.id : '');
                  }}
                  placeholder="Ej. Trujillo, Huanchaco, Moche..."
                  autoComplete="off"
                  className="w-full h-12 pl-10 pr-10 text-sm sm:text-base bg-white border border-[#E9E7E1] hover:border-[#263B35]/40 focus:border-[#E85B49] focus:ring-2 focus:ring-[#E85B49]/15 rounded-xl text-[#263B35] placeholder:text-[#64748B]/70 focus:outline-none transition-all"
                />
                {destinationInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestinationInput('');
                      setSelectedDestinationId('');
                      setIsDropdownOpen(true);
                    }}
                    aria-label="Limpiar destino"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#263B35] rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white border border-[#E9E7E1] rounded-xl shadow-lg py-1.5 max-h-60 overflow-y-auto">
                    {filteredLocalities.length > 0 ? (
                      filteredLocalities.map((loc) => {
                        const isSelected = selectedDestinationId === loc.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => handleSelectLocality(loc)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#F7F2E8] text-[#263B35] font-semibold'
                                : 'text-[#263B35] hover:bg-[#F7F2E8]/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <MapPin className="w-3.5 h-3.5 text-[#E85B49] shrink-0" />
                              <span>{loc.name}</span>
                              <span className="text-xs text-[#64748B]">
                                · Prov. {loc.province}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#E85B49] shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-xs text-[#64748B]">
                        No encontramos esa localidad en La Libertad. Prueba con Trujillo, Huanchaco o Moche.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sugerencias rápidas discretas */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-[#64748B] mr-1">Populares:</span>
                {LA_LIBERTAD_LOCALITIES.slice(0, 4).map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectLocality(loc)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      selectedDestinationId === loc.id
                        ? 'bg-[#263B35] text-white border-[#263B35] font-medium'
                        : 'bg-[#F7F2E8]/60 text-[#263B35] border-[#E9E7E1] hover:bg-[#F7F2E8]'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selectores de fechas opcionales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#263B35]">
                  Fechas{' '}
                  <span className="text-xs font-normal text-[#64748B]">(opcional)</span>
                </span>
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setErrorMsg(null);
                    }}
                    className="text-xs font-medium text-[#64748B] hover:text-[#E85B49] transition-colors cursor-pointer"
                  >
                    Limpiar fechas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="trip-start-date"
                    className="block text-xs text-[#64748B] mb-1"
                  >
                    Fecha de inicio
                  </label>
                  <div className="relative">
                    <input
                      id="trip-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="w-full h-11 px-3 text-sm bg-white border border-[#E9E7E1] hover:border-[#263B35]/40 focus:border-[#E85B49] focus:ring-2 focus:ring-[#E85B49]/15 rounded-xl text-[#263B35] font-mono focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="trip-end-date"
                    className="block text-xs text-[#64748B] mb-1"
                  >
                    Fecha de fin
                  </label>
                  <div className="relative">
                    <input
                      id="trip-end-date"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="w-full h-11 px-3 text-sm bg-white border border-[#E9E7E1] hover:border-[#263B35]/40 focus:border-[#E85B49] focus:ring-2 focus:ring-[#E85B49]/15 rounded-xl text-[#263B35] font-mono focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {optionalDates.hasDates && dateRangeFormatted && (
                <div className="flex items-center gap-2 text-xs text-[#263B35] bg-[#F7F2E8] border border-[#E9E7E1] rounded-lg px-3 py-2">
                  <Calendar className="w-3.5 h-3.5 text-[#E85B49] shrink-0" />
                  <span className="font-medium">{dateRangeFormatted}</span>
                  <span className="text-[#64748B]">·</span>
                  <span className="text-[#64748B]">
                    {optionalDates.days} {optionalDates.days === 1 ? 'día' : 'días'}
                    {optionalDates.nights > 0 ? ` · ${optionalDates.nights} ${optionalDates.nights === 1 ? 'noche' : 'noches'}` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Botón principal coral */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 px-6 bg-[#E85B49] hover:bg-[#D94C3C] active:scale-[0.99] disabled:opacity-60 text-white font-semibold text-sm sm:text-base rounded-full transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Creando viaje...' : 'Comienza a planificar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 px-6 border-t border-[#E9E7E1] bg-white text-center text-xs text-[#64748B] shrink-0">
        RIYMO · Exploración y planificación turística en La Libertad, Perú
      </footer>
    </div>
  );
};
