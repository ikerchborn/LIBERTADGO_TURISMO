import React, { useState, useMemo } from 'react';
import { MapPin, Calendar, ArrowRight, X, AlertCircle, Check } from 'lucide-react';
import { LA_LIBERTAD_LOCALITIES } from '../types/geo.ts';
import { calculateTripDuration, formatDateRange } from '../utils/dateUtils.ts';
import { TripItinerary } from '../types/catalog.ts';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (trip: TripItinerary) => void;
  initialDestinationId?: string;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onTripCreated,
  initialDestinationId = 'trujillo',
}) => {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(initialDestinationId);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const defaultDates = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const end = new Date(d);
    end.setDate(end.getDate() + 4);
    return {
      start: d.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);
  const [tripName, setTripName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedLocality = useMemo(() => {
    return LA_LIBERTAD_LOCALITIES.find((l) => l.id === selectedDestinationId) || LA_LIBERTAD_LOCALITIES[0];
  }, [selectedDestinationId]);

  const filteredLocalities = useMemo(() => {
    if (!searchQuery.trim()) return LA_LIBERTAD_LOCALITIES;
    const q = searchQuery.toLowerCase().trim();
    return LA_LIBERTAD_LOCALITIES.filter((loc) =>
      loc.name.toLowerCase().includes(q) || loc.province.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const duration = useMemo(() => {
    return calculateTripDuration(startDate, endDate);
  }, [startDate, endDate]);

  const dateRangeFormatted = useMemo(() => {
    return formatDateRange(startDate, endDate);
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!duration.isValid) {
      setErrorMsg(duration.error || 'Verifica las fechas seleccionadas.');
      return;
    }

    setIsSubmitting(true);
    const title = tripName.trim() || `Viaje a ${selectedLocality.name}`;

    const tripPayload = {
      destinationId: selectedLocality.id,
      startDate,
      endDate,
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
        onClose();
      } else {
        fallbackCreate(title);
      }
    } catch {
      fallbackCreate(title);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackCreate = (title: string) => {
    const newTrip: TripItinerary = {
      id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      destinationId: selectedLocality.id,
      destinationName: selectedLocality.name,
      startDate,
      endDate,
      totalDays: duration.days,
      totalNights: duration.nights,
      coverImage: selectedLocality.heroImage,
      notes: '',
      savedPlaceIds: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onTripCreated(newTrip);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E9EEF4] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9EEF4]">
          <h2 className="text-base font-bold font-display text-[#17243A]">
            Crear nuevo viaje
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1 text-[#64748B] hover:text-[#17243A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Destino */}
          <div>
            <label className="block text-xs font-semibold text-[#17243A] uppercase tracking-wider mb-1.5">
              Destino
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#F7F8FA] border border-[#E9EEF4] hover:border-slate-300 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E85B49] shrink-0" />
                  <span className="text-xs font-semibold text-[#17243A]">{selectedLocality.name}</span>
                  <span className="text-[11px] text-[#64748B]">Prov. {selectedLocality.province}</span>
                </div>
                <span className="text-xs text-[#64748B]">Cambiar</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-[#E9EEF4] rounded-xl shadow-lg p-2 max-h-52 overflow-y-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar localidad..."
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F7F8FA] border border-[#E9EEF4] rounded-lg mb-1.5 focus:outline-none focus:border-[#17243A]"
                    autoFocus
                  />
                  <div className="space-y-1">
                    {filteredLocalities.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSelectedDestinationId(loc.id);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          selectedDestinationId === loc.id
                            ? 'bg-[#17243A] text-white font-medium'
                            : 'hover:bg-[#F7F8FA] text-[#17243A]'
                        }`}
                      >
                        <span>{loc.name}</span>
                        {selectedDestinationId === loc.id && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-start-date" className="block text-xs font-semibold text-[#17243A] uppercase tracking-wider mb-1.5">
                Llegada
              </label>
              <input
                id="modal-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F7F8FA] border border-[#E9EEF4] rounded-xl font-mono text-[#17243A] focus:outline-none focus:border-[#17243A]"
                required
              />
            </div>
            <div>
              <label htmlFor="modal-end-date" className="block text-xs font-semibold text-[#17243A] uppercase tracking-wider mb-1.5">
                Salida
              </label>
              <input
                id="modal-end-date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F7F8FA] border border-[#E9EEF4] rounded-xl font-mono text-[#17243A] focus:outline-none focus:border-[#17243A]"
                required
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#F7F8FA] rounded-xl border border-[#E9EEF4] text-xs">
            <div className="flex items-center gap-1.5 text-[#17243A]">
              <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
              <span>{dateRangeFormatted}</span>
            </div>
            <span className="font-semibold text-[#17243A]">
              {duration.isValid ? `${duration.days} días` : '—'}
            </span>
          </div>

          {/* Nombre opcional */}
          <div>
            <label htmlFor="modal-trip-name" className="block text-xs font-semibold text-[#17243A] uppercase tracking-wider mb-1.5">
              Nombre <span className="text-[#64748B] font-normal lowercase">(opcional)</span>
            </label>
            <input
              id="modal-trip-name"
              type="text"
              placeholder={`Viaje a ${selectedLocality.name}`}
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#F7F8FA] border border-[#E9EEF4] rounded-xl text-[#17243A] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#17243A]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !duration.isValid}
            className="w-full mt-2 py-2.5 px-4 bg-[#E85B49] hover:bg-[#D94C3A] active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isSubmitting ? 'Guardando...' : 'Crear viaje'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
