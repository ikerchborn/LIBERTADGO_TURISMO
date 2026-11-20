import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  MapPin,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
  Info,
  Link,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl(workerUrl);
}
import { AdminPlaceRecord, PlaceStatus } from '../../types/adminCatalog.ts';
import { PlaceCategory, PlaceVerification, PlaceImage, PlaceOpeningHours } from '../../types/catalog.ts';
import { LA_LIBERTAD_LOCALITIES } from '../../types/geo.ts';
import {
  DEFAULT_PLACE_COVER_IMAGE_URL,
  PlaceValidationIssue,
  formatPlaceValidationIssues,
  getPlaceFieldLabel,
  isValidHttpUrl,
  validateAndBuildPlacePayload,
} from '../../utils/placeValidation.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface PlaceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceSaved: (place: AdminPlaceRecord, message?: string) => void;
  initialPlace?: AdminPlaceRecord | null;
}

const CATEGORIES: { id: PlaceCategory; label: string }[] = [
  { id: 'atractivos', label: 'Atractivos Turísticos' },
  { id: 'arqueologia', label: 'Arqueología & Sitios' },
  { id: 'gastronomia', label: 'Gastronomía Tradicional' },
  { id: 'restaurantes', label: 'Restaurantes' },
  { id: 'playas', label: 'Playas & Balnearios' },
  { id: 'museos', label: 'Museos & Galerías' },
  { id: 'cultura', label: 'Cultura & Tradición' },
  { id: 'naturaleza', label: 'Naturaleza & Ecoturismo' },
  { id: 'hoteles', label: 'Hospedajes & Hoteles' },
  { id: 'actividades', label: 'Actividades & Deportes' },
];

export const PlaceEditorModal: React.FC<PlaceEditorModalProps> = ({
  isOpen,
  onClose,
  onPlaceSaved,
  initialPlace,
}) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'map' | 'contact' | 'media' | 'verification'>('general');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('atractivos');
  const [subcategory, setSubcategory] = useState('');
  const [localityId, setLocalityId] = useState('trujillo');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(-8.1118);
  const [lng, setLng] = useState(-79.0287);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [priceLevel, setPriceLevel] = useState<number>(2);
  const [recommendedDurationMinutes, setRecommendedDurationMinutes] = useState(60);
  const [status, setStatus] = useState<PlaceStatus>('PUBLISHED');
  const [isVerified, setIsVerified] = useState(true);
  const [verificationLevel, setVerificationLevel] = useState<PlaceVerification['verificationLevel']>('partner_verified');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [safetyScore, setSafetyScore] = useState(85);
  const [tagsInput, setTagsInput] = useState('');
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [changeSummary, setChangeSummary] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PlaceValidationIssue[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const coordsRef = useRef({ lat, lng });
  const isInternalMapUpdateRef = useRef(false);
  coordsRef.current = { lat, lng };

  // Load initial data
  useEffect(() => {
    if (initialPlace) {
      setName(initialPlace.name);
      setCategory(initialPlace.category);
      setSubcategory(initialPlace.subcategory || '');
      setLocalityId(initialPlace.localityId);
      setAddress(initialPlace.address);
      setLat(initialPlace.coordinates.lat);
      setLng(initialPlace.coordinates.lng);
      setShortDescription(initialPlace.shortDescription);
      setFullDescription(initialPlace.fullDescription || '');
      setPhone(initialPlace.phone || '');
      setEmail(initialPlace.email || '');
      setWebsite(initialPlace.website || '');
      setMapsUrl(initialPlace.mapsUrl || '');
      setPriceLevel(initialPlace.priceLevel || 2);
      setRecommendedDurationMinutes(initialPlace.recommendedDurationMinutes || 60);
      setStatus(initialPlace.status || 'PUBLISHED');
      setIsVerified(Boolean(initialPlace.verification?.isVerified));
      setVerificationLevel(initialPlace.verification?.verificationLevel || 'partner_verified');
      setVerificationNotes(initialPlace.verification?.notes || '');
      setSafetyScore(initialPlace.safetyScore ?? 85);
      setTagsInput(Array.isArray(initialPlace.tags) ? initialPlace.tags.join(', ') : '');
      setImages(initialPlace.images || []);
      setChangeSummary('');
    } else {
      setName('');
      setCategory('atractivos');
      setSubcategory('');
      setLocalityId('trujillo');
      setAddress('Centro Histórico, Trujillo');
      setLat(-8.1118);
      setLng(-79.0287);
      setShortDescription('');
      setFullDescription('');
      setPhone('');
      setEmail('');
      setWebsite('');
      setMapsUrl('');
      setPriceLevel(2);
      setRecommendedDurationMinutes(60);
      setStatus('PUBLISHED');
      setIsVerified(true);
      setVerificationLevel('partner_verified');
      setVerificationNotes('Verificado por administración RIYMO');
      setSafetyScore(85);
      setTagsInput('turismo, la-libertad');
      setImages([
        {
          id: `img_${Date.now()}`,
          url: DEFAULT_PLACE_COVER_IMAGE_URL,
          caption: 'Foto principal',
          isCover: true,
        },
      ]);
      setChangeSummary('Creación inicial');
    }
    setActiveTab('general');
    setError(null);
    setFieldErrors([]);
  }, [initialPlace, isOpen]);

  // Helper to destroy MapLibre instance and observers cleanly
  const destroyMapInstance = () => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  // Lazy MapLibre initialization & resize on tab visibility changes
  useEffect(() => {
    if (!isOpen || activeTab !== 'map') return;
    if (!mapContainerRef.current) return;

    let cancelled = false;
    let initRafId: number | null = null;
    let postPaintRafId: number | null = null;

    const ensureMapReady = () => {
      if (cancelled) return;
      const container = mapContainerRef.current;
      if (!container) return;

      const hasValidDimensions = container.clientWidth > 0 && container.clientHeight > 0;
      if (!hasValidDimensions) {
        initRafId = window.requestAnimationFrame(ensureMapReady);
        return;
      }

      const rawCoords = coordsRef.current;
      const currentLat = Number.isFinite(rawCoords.lat) ? rawCoords.lat : -8.1118;
      const currentLng = Number.isFinite(rawCoords.lng) ? rawCoords.lng : -79.0287;

      if (!mapInstanceRef.current) {
        const map = new maplibregl.Map({
          container,
          style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          center: [currentLng, currentLat],
          zoom: 14,
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

        const marker = new maplibregl.Marker({
          color: '#E85B49',
          draggable: true,
        })
          .setLngLat([currentLng, currentLat])
          .addTo(map);

        marker.on('dragend', () => {
          const coords = marker.getLngLat();
          isInternalMapUpdateRef.current = true;
          setLat(Math.round(coords.lat * 100000) / 100000);
          setLng(Math.round(coords.lng * 100000) / 100000);
        });

        map.on('click', (e) => {
          marker.setLngLat(e.lngLat);
          isInternalMapUpdateRef.current = true;
          setLat(Math.round(e.lngLat.lat * 100000) / 100000);
          setLng(Math.round(e.lngLat.lng * 100000) / 100000);
        });

        map.on('load', () => {
          const el = mapContainerRef.current;
          if (el && el.clientWidth > 0 && el.clientHeight > 0) {
            map.resize();
          }
        });

        if (typeof ResizeObserver !== 'undefined' && !resizeObserverRef.current) {
          const observer = new ResizeObserver(() => {
            const el = mapContainerRef.current;
            if (el && el.clientWidth > 0 && el.clientHeight > 0 && mapInstanceRef.current) {
              mapInstanceRef.current.resize();
            }
          });
          observer.observe(container);
          resizeObserverRef.current = observer;
        }

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.resize();
        markerRef.current?.setLngLat([currentLng, currentLat]);
        mapInstanceRef.current.setCenter([currentLng, currentLat]);
      }

      postPaintRafId = window.requestAnimationFrame(() => {
        if (cancelled) return;
        const el = mapContainerRef.current;
        if (el && el.clientWidth > 0 && el.clientHeight > 0 && mapInstanceRef.current) {
          mapInstanceRef.current.resize();
        }
      });
    };

    ensureMapReady();

    return () => {
      cancelled = true;
      if (initRafId !== null) window.cancelAnimationFrame(initRafId);
      if (postPaintRafId !== null) window.cancelAnimationFrame(postPaintRafId);
    };
  }, [isOpen, activeTab]);

  // Synchronize marker & center when lat/lng state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    marker.setLngLat([lng, lat]);
    if (isInternalMapUpdateRef.current) {
      isInternalMapUpdateRef.current = false;
    } else {
      map.setCenter([lng, lat]);
    }
  }, [lat, lng]);

  // Clean up map when modal closes
  useEffect(() => {
    if (!isOpen) {
      destroyMapInstance();
    }
  }, [isOpen]);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      destroyMapInstance();
    };
  }, []);

  if (!isOpen) return null;

  const hasFieldError = (field: string) =>
    fieldErrors.some((issue) => issue.field === field || issue.field.startsWith(`${field}.`));

  const getFieldError = (field: string) =>
    fieldErrors.find((issue) => issue.field === field || issue.field.startsWith(`${field}.`))?.message;

  const focusTabForField = (field: string) => {
    if (['name', 'category', 'subcategory', 'localityId', 'address', 'shortDescription', 'fullDescription', 'tags'].includes(field)) {
      setActiveTab('general');
    } else if (field === 'coordinates' || field.startsWith('coordinates.')) {
      setActiveTab('map');
    } else if (['phone', 'email', 'website', 'mapsUrl', 'priceLevel', 'recommendedDurationMinutes', 'safetyScore'].includes(field)) {
      setActiveTab('contact');
    } else if (field === 'images' || field.startsWith('images.')) {
      setActiveTab('media');
    } else if (['status', 'verification', 'changeSummary'].includes(field) || field.startsWith('verification.')) {
      setActiveTab('verification');
    }
  };

  const handleAddImage = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) return;
    if (!isValidHttpUrl(trimmedUrl)) {
      const issue: PlaceValidationIssue = {
        field: 'images',
        message: 'La URL de la imagen debe iniciar con http:// o https://.',
      };
      setFieldErrors([issue]);
      setError(formatPlaceValidationIssues([issue]));
      return;
    }
    setError(null);
    setFieldErrors((prev) => prev.filter((item) => item.field !== 'images'));
    setImages((prev) => [
      ...prev,
      {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        url: trimmedUrl,
        caption: name.trim() || 'Imagen de establecimiento',
        isCover: prev.length === 0,
      },
    ]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (imgId: string) => {
    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imgId);
      if (remaining.length > 0 && !remaining.some((img) => img.isCover)) {
        remaining[0].isCover = true;
      }
      return remaining;
    });
  };

  const handleSetCover = (imgId: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === imgId,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);

    const validation = validateAndBuildPlacePayload({
      name,
      category,
      subcategory,
      localityId,
      address,
      coordinates: { lat, lng },
      shortDescription,
      fullDescription,
      phone,
      email,
      website,
      mapsUrl,
      priceLevel,
      recommendedDurationMinutes,
      status,
      isVerified,
      verificationLevel,
      verificationNotes,
      safetyScore,
      tagsInput,
      images,
      changeSummary,
      isEdit: Boolean(initialPlace),
    });

    if (!validation.valid || !validation.payload) {
      setFieldErrors(validation.issues);
      setError(formatPlaceValidationIssues(validation.issues));
      if (validation.issues[0]?.field) {
        focusTabForField(validation.issues[0].field);
      }
      return;
    }

    setIsSaving(true);

    try {
      const url = initialPlace ? `/api/admin/places/${initialPlace.id}` : '/api/admin/places';
      const method = initialPlace ? 'PUT' : 'POST';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers,
        body: JSON.stringify(validation.payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        const serverDetails: PlaceValidationIssue[] = Array.isArray(json?.details)
          ? json.details
              .filter((d: unknown): d is { field?: unknown; message?: unknown } => Boolean(d && typeof d === 'object'))
              .map((d: { field?: unknown; message?: unknown }) => ({
                field: typeof d.field === 'string' ? d.field : '',
                message: typeof d.message === 'string' ? d.message : 'Valor inválido',
              }))
          : [];

        if (serverDetails.length > 0) {
          setFieldErrors(serverDetails);
          focusTabForField(serverDetails[0].field);
          throw new Error(json?.error || formatPlaceValidationIssues(serverDetails));
        }

        throw new Error(json?.error || 'Error al guardar el lugar');
      }

      onPlaceSaved(
        json.data,
        json.message ||
          (initialPlace
            ? `Cambios guardados en "${json.data?.name || name.trim()}".`
            : `Lugar "${json.data?.name || name.trim()}" creado correctamente.`)
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialPlace ? `Editar: ${initialPlace.name}` : 'Registrar Nuevo Lugar Turístico'}
            </h2>
            <p className="text-xs text-slate-500">
              {initialPlace ? `ID: ${initialPlace.id} • Slug: ${initialPlace.slug}` : 'Ingresa los datos del nuevo atractivo o establecimiento'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0 overflow-x-auto">
          {[
            { id: 'general', label: 'General & Textos', icon: Info },
            { id: 'map', label: 'Ubicación GPS & Mapa', icon: MapPin },
            { id: 'contact', label: 'Contacto & Metadatos', icon: Link },
            { id: 'media', label: 'Imágenes', icon: ImageIcon },
            { id: 'verification', label: 'Estado & Verificación', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#E85B49] text-[#E85B49]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form noValidate onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{error}</p>
                {fieldErrors.length > 1 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {fieldErrors.map((issue, idx) => (
                      <li key={`${issue.field}_${idx}`}>
                        <strong>{getPlaceFieldLabel(issue.field)}:</strong> {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Oficial *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Huaca de la Luna"
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                      hasFieldError('name') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                    }`}
                  />
                  {getFieldError('name') && (
                    <p className="text-[11px] text-red-600 mt-1">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría Turística *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white capitalize ${
                      hasFieldError('category') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                    }`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError('category') && (
                    <p className="text-[11px] text-red-600 mt-1">{getFieldError('category')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subcategoría
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Ej. Sitio Arqueológico Moche"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Localidad (La Libertad) *
                  </label>
                  <select
                    value={localityId}
                    onChange={(e) => setLocalityId(e.target.value)}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                      hasFieldError('localityId') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                    }`}
                  >
                    <option value="">Selecciona una localidad...</option>
                    {LA_LIBERTAD_LOCALITIES.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  {getFieldError('localityId') && (
                    <p className="text-[11px] text-red-600 mt-1">{getFieldError('localityId')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección Física *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Campiña de Moche, Trujillo"
                  className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                    hasFieldError('address') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                  }`}
                />
                {getFieldError('address') && (
                  <p className="text-[11px] text-red-600 mt-1">{getFieldError('address')}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Corta (Resumen para tarjetas) *
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  placeholder="Descripción concisa visible en el planificador..."
                  className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                    hasFieldError('shortDescription') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                  }`}
                />
                {getFieldError('shortDescription') && (
                  <p className="text-[11px] text-red-600 mt-1">{getFieldError('shortDescription')}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Completa Detallada
                </label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={4}
                  placeholder="Historia, recomendaciones, qué ver, contexto cultural..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="arqueologia, moche, murales, historia"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49] focus:bg-white font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MAP & GPS (kept mounted while hidden so MapLibre canvas persists across tab switches) */}
          <div className={activeTab === 'map' ? 'space-y-4' : 'hidden'}>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E85B49] shrink-0" />
                <span>
                  Haz clic en el mapa o arrastra el marcador rojo para fijar las coordenadas exactas dentro de La Libertad.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#E85B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono focus:outline-none ${
                      hasFieldError('coordinates') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                    }`}
                  />
                </div>
              </div>
              {getFieldError('coordinates') && (
                <p className="text-[11px] text-red-600">{getFieldError('coordinates')}</p>
              )}

              {/* Map Container */}
              <div
                ref={mapContainerRef}
                className="w-full h-80 min-h-[320px] rounded-xl border border-slate-300 overflow-hidden shadow-inner bg-slate-100"
              />
          </div>

          {/* TAB 3: CONTACT & DETAILS */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+51 44 282121"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@huacasdemoche.pe"
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${
                      hasFieldError('email') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                    }`}
                  />
                  {getFieldError('email') && (
                    <p className="text-[11px] text-red-600 mt-1">{getFieldError('email')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sitio Web Oficial
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://huacasdemoche.pe"
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${
                      hasFieldError('website') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                    }`}
                  />
                  {getFieldError('website') && (
                    <p className="text-[11px] text-red-600 mt-1">{getFieldError('website')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nivel de Precios
                  </label>
                  <select
                    value={priceLevel}
                    onChange={(e) => setPriceLevel(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                  >
                    <option value={1}>$ Económico (Gratis o muy bajo)</option>
                    <option value={2}>$$ Moderado (Estándar)</option>
                    <option value={3}>$$$ Alto (Experiencia premium)</option>
                    <option value={4}>$$$$ Exclusivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiempo de Visita Recomendado (minutos)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={recommendedDurationMinutes}
                    onChange={(e) => setRecommendedDurationMinutes(Number(e.target.value) || 60)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Índice de Seguridad Territorial (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(Number(e.target.value) || 85)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enlace de Google Maps / Ficha
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?cid=..."
                  className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none ${
                    hasFieldError('mapsUrl') ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#E85B49]'
                  }`}
                />
                {getFieldError('mapsUrl') && (
                  <p className="text-[11px] text-red-600 mt-1">{getFieldError('mapsUrl')}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & IMAGES */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... o enlace de fotografía"
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Foto</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative rounded-lg border overflow-hidden group bg-slate-100 ${
                      img.isCover ? 'ring-2 ring-[#E85B49] border-transparent' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Foto'}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
                      }}
                    />

                    {img.isCover && (
                      <span className="absolute top-2 left-2 bg-[#E85B49] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        Portada
                      </span>
                    )}

                    <div className="p-2 bg-white flex items-center justify-between text-xs">
                      {!img.isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          className="text-[11px] text-slate-600 hover:text-[#E85B49] cursor-pointer"
                        >
                          Hacer portada
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="text-red-500 hover:text-red-700 p-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VERIFICATION & STATUS */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado en el Catálogo *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PlaceStatus)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49] font-medium"
                  >
                    <option value="PUBLISHED">PUBLICADO (Visible en planificador público)</option>
                    <option value="DRAFT">BORRADOR (Oculto, en preparación)</option>
                    <option value="FLAGGED">OBSERVADO (Requiere corrección de datos)</option>
                    <option value="ARCHIVED">ARCHIVADO (Cerrado o descontinuado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nivel de Verificación
                  </label>
                  <select
                    value={verificationLevel}
                    onChange={(e) => setVerificationLevel(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                  >
                    <option value="official_mincetur">Oficial MINCETUR / Directorio Regional</option>
                    <option value="partner_verified">Verificado por Administrador RIYMO</option>
                    <option value="community">Aportado por Comunidad / Creadores</option>
                    <option value="unverified">Sin Verificar</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkVerified"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 text-[#E85B49] rounded border-slate-300 focus:ring-[#E85B49]"
                />
                <label htmlFor="chkVerified" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Marcar como lugar verificado y confiable
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Verificación o Motivo de Estado
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={2}
                  placeholder="Detalles sobre resolución, número de ficha MINCETUR, o motivo del estado actual..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resumen de Cambio (Para el registro inmutable de auditoría)
                </label>
                <input
                  type="text"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="Ej. Actualización de horarios y fotografías de temporada"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#E85B49] hover:bg-[#d64f3e] disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando en catálogo...' : 'Guardar y Publicar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
