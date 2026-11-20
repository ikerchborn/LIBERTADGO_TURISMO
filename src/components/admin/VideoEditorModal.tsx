import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X,
  Video,
  Check,
  AlertCircle,
  ExternalLink,
  MapPin,
  Star,
  Search,
  Upload,
  Plus,
  Filter,
  CheckCircle2,
  UserPlus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { VideoSubmission, CreatorProfile, VideoContentType, ModerationStatus, VideoPlatform } from '../../types/creators.ts';
import { Place } from '../../types/catalog.ts';
import { INITIAL_PLACES } from '../../data/initialPlaces.ts';
import { LA_LIBERTAD_LOCALITIES } from '../../types/geo.ts';
import { parseAndValidateVideoUrl } from '../../utils/videoUrlParser.ts';
import { VideoPreviewCard } from './VideoPreviewCard.tsx';
import { VideoPreviewData, PreviewState } from '../../server/oembedService.ts';

interface VideoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSaved: () => void;
  initialVideo?: (VideoSubmission & { places?: Place[] }) | null;
  creators: CreatorProfile[];
  onCreatorCreated?: (newCreator: CreatorProfile) => void;
}

const CATEGORIES = [
  { id: 'restaurantes', name: 'Restaurantes y Gastronomía' },
  { id: 'arqueologia', name: 'Sitios Arqueológicos' },
  { id: 'playas', name: 'Playas y Surf' },
  { id: 'hoteles', name: 'Hospedaje y Hoteles' },
  { id: 'cafeterias', name: 'Cafeterías y Bares' },
  { id: 'cultura', name: 'Museos y Cultura' },
  { id: 'naturaleza', name: 'Naturaleza y Paisajes' },
  { id: 'artesania', name: 'Artesanías y Tradición' },
  { id: 'aventura', name: 'Aventura y Deportes' },
];

const PLACE_FILTER_CATEGORIES = [
  { id: 'ALL', name: 'Todas las categorías' },
  { id: 'restaurantes', name: 'Restaurantes y Gastronomía' },
  { id: 'arqueologia', name: 'Sitios Arqueológicos' },
  { id: 'playas', name: 'Playas y Balnearios' },
  { id: 'hoteles', name: 'Hospedaje y Hoteles' },
  { id: 'museos', name: 'Museos y Salas Culturales' },
  { id: 'atractivos', name: 'Atractivos Turísticos' },
  { id: 'cultura', name: 'Cultura y Tradición' },
  { id: 'naturaleza', name: 'Naturaleza y Paisajes' },
  { id: 'gastronomia', name: 'Gastronomía Tradicional' },
];

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  isOpen,
  onClose,
  onVideoSaved,
  initialVideo,
  creators,
  onCreatorCreated,
}) => {
  const { token } = useAuth();
  const isEditing = Boolean(initialVideo);

  // Local creators state allows instant inline creator addition
  const [localCreators, setLocalCreators] = useState<CreatorProfile[]>(creators);
  useEffect(() => {
    setLocalCreators(creators);
  }, [creators]);

  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<VideoContentType>('PLACE');
  const [category, setCategory] = useState('restaurantes');
  const [localityId, setLocalityId] = useState('trujillo');
  const [creatorProfileId, setCreatorProfileId] = useState<string>('');
  const [externalCreatorHandle, setExternalCreatorHandle] = useState('');
  const [externalCreatorDisplayName, setExternalCreatorDisplayName] = useState('');
  const [externalCreatorAvatarUrl, setExternalCreatorAvatarUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [primaryPlaceId, setPrimaryPlaceId] = useState<string>('');
  const [status, setStatus] = useState<ModerationStatus>('APPROVED');

  // Place selection & filtering
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeLocalityFilter, setPlaceLocalityFilter] = useState('ALL');
  const [placeCategoryFilter, setPlaceCategoryFilter] = useState('ALL');

  // Inline creator creation modal/drawer state
  const [showInlineCreator, setShowInlineCreator] = useState(false);
  const [inlineHandle, setInlineHandle] = useState('');
  const [inlineDisplayName, setInlineDisplayName] = useState('');
  const [inlinePlatform, setInlinePlatform] = useState<VideoPlatform>('tiktok');
  const [inlineBio, setInlineBio] = useState('');
  const [inlineAvatarUrl, setInlineAvatarUrl] = useState('');
  const [isCreatingCreator, setIsCreatingCreator] = useState(false);
  const [inlineCreatorError, setInlineCreatorError] = useState<string | null>(null);
  const [creatorSuccessToast, setCreatorSuccessToast] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live URL validation state
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    platform?: string;
    error?: string;
  }>({ isValid: false });

  // Official Video Preview state machine
  const [previewState, setPreviewState] = useState<PreviewState>('idle');
  const [previewData, setPreviewData] = useState<VideoPreviewData | null>(null);
  const [previewError, setPreviewError] = useState<string | undefined>(undefined);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Safe preview fetcher with cancellation
  const fetchPreviewForUrl = useCallback(async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setPreviewState('idle');
      setPreviewData(null);
      setPreviewError(undefined);
      return;
    }

    const parsed = parseAndValidateVideoUrl(trimmed);
    if (!parsed.isValid || !parsed.data) {
      setPreviewState('invalid_format');
      setPreviewData(null);
      setPreviewError(parsed.error || 'Formato de enlace no admitido');
      return;
    }

    // Cancel in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPreviewState('loading');
    setPreviewError(undefined);

    try {
      const res = await fetch(`/api/creators/oembed?url=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });

      const json = await res.json();
      if (controller.signal.aborted) return;

      if (json.state === 'ready' && json.data) {
        setPreviewState('ready');
        setPreviewData(json.data);
        setPreviewError(undefined);

        // Smart auto-fill for empty fields (without overwriting existing text)
        if (json.data.title) {
          setTitle((prev) => (!prev.trim() ? json.data.title : prev));
        }
        if (json.data.authorName) {
          setExternalCreatorDisplayName((prev) =>
            !prev.trim() ? json.data.authorName : prev
          );
        }
        if (json.data.thumbnailUrl) {
          setThumbnailUrl((prev) =>
            !prev.trim() ? json.data.thumbnailUrl : prev
          );
        }
      } else if (json.state === 'unavailable') {
        setPreviewState('unavailable');
        setPreviewData(null);
        setPreviewError(json.message || 'No se pudo generar la vista previa. El enlace original puede registrarse igualmente.');
      } else if (json.state === 'provider_error') {
        setPreviewState('provider_error');
        setPreviewData(null);
        setPreviewError(json.message || 'Error temporal del proveedor. Puedes registrar el video con su enlace original.');
      } else {
        setPreviewState('invalid_format');
        setPreviewData(null);
        setPreviewError(json.error || json.message || 'Enlace no válido');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('[Preview Fetch Error]:', err);
      setPreviewState('provider_error');
      setPreviewData(null);
      setPreviewError('Error de conexión al obtener la vista previa oficial.');
    }
  }, []);

  // Modal open/close and initial data loading
  useEffect(() => {
    if (!isOpen) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      return;
    }

    if (initialVideo) {
      setVideoUrl(initialVideo.videoUrl);
      setTitle(initialVideo.title);
      setDescription(initialVideo.description || '');
      setContentType(initialVideo.contentType);
      setCategory(initialVideo.category);
      setLocalityId(initialVideo.localityId || 'trujillo');
      setCreatorProfileId(initialVideo.creatorProfileId || '');
      setExternalCreatorHandle(
        initialVideo.externalCreatorHandle ||
        (initialVideo.externalMetrics as any)?.creatorHandle ||
        ''
      );
      setExternalCreatorDisplayName(
        initialVideo.externalCreatorDisplayName ||
        (initialVideo.externalMetrics as any)?.creatorDisplayName ||
        ''
      );
      setExternalCreatorAvatarUrl(
        initialVideo.externalCreatorAvatarUrl ||
        (initialVideo.externalMetrics as any)?.creatorAvatarUrl ||
        ''
      );
      setThumbnailUrl(initialVideo.thumbnailUrl || '');
      setStatus(initialVideo.status);

      const pIds = initialVideo.places?.map((p) => p.id) || [];
      setSelectedPlaceIds(pIds);
      setPrimaryPlaceId(pIds[0] || '');
      setUrlValidation({ isValid: true, platform: initialVideo.platform });

      // Automatically resolve preview for the existing video being edited
      fetchPreviewForUrl(initialVideo.videoUrl);
    } else {
      setVideoUrl('');
      setTitle('');
      setDescription('');
      setContentType('PLACE');
      setCategory('restaurantes');
      setLocalityId('trujillo');
      setCreatorProfileId('');
      setExternalCreatorHandle('');
      setExternalCreatorDisplayName('');
      setExternalCreatorAvatarUrl('');
      setThumbnailUrl('');
      setSelectedPlaceIds([]);
      setPrimaryPlaceId('');
      setStatus('APPROVED');
      setUrlValidation({ isValid: false });
      setPreviewState('idle');
      setPreviewData(null);
      setPreviewError(undefined);
    }
    setErrorMessage(null);
    setPlaceSearch('');
    setPlaceLocalityFilter('ALL');
    setPlaceCategoryFilter('ALL');
    setShowInlineCreator(false);
    setInlineCreatorError(null);
    setCreatorSuccessToast(null);

    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [initialVideo, isOpen, fetchPreviewForUrl]);

  // Handle URL change with live validation & debounced preview fetch
  const handleUrlChange = (url: string) => {
    setVideoUrl(url);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!url.trim()) {
      setUrlValidation({ isValid: false });
      setPreviewState('idle');
      setPreviewData(null);
      setPreviewError(undefined);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    const parsed = parseAndValidateVideoUrl(url);
    if (parsed.isValid && parsed.data) {
      setUrlValidation({
        isValid: true,
        platform: parsed.data.platform,
      });

      // Auto-detect author handle if creatorProfileId is not assigned
      if (parsed.data.authorHandle && !creatorProfileId && !externalCreatorHandle) {
        setExternalCreatorHandle(parsed.data.authorHandle);
      }

      // Indicate loading immediately and trigger debounced fetch
      setPreviewState('loading');
      debounceTimerRef.current = setTimeout(() => {
        fetchPreviewForUrl(url);
      }, 400);
    } else {
      setUrlValidation({
        isValid: false,
        error: parsed.error || 'URL no soportada',
      });
      setPreviewState('invalid_format');
      setPreviewData(null);
      setPreviewError(parsed.error);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  };

  const handleRetryPreview = () => {
    if (videoUrl.trim()) {
      fetchPreviewForUrl(videoUrl);
    }
  };

  // Inline creator creation handler
  const handleCreateCreatorInline = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineCreatorError(null);

    const cleanHandle = inlineHandle.trim().toLowerCase().replace(/^@+/, '');
    if (!/^[a-z0-9_]{3,30}$/.test(cleanHandle)) {
      setInlineCreatorError('El handle debe tener 3 a 30 caracteres (solo minúsculas, números y guión bajo)');
      return;
    }

    if (inlineDisplayName.trim().length < 2) {
      setInlineCreatorError('El nombre público debe tener al menos 2 caracteres');
      return;
    }

    setIsCreatingCreator(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/creators', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          handle: cleanHandle,
          displayName: inlineDisplayName.trim(),
          primaryPlatform: inlinePlatform,
          bio: inlineBio.trim() || undefined,
          avatarUrl: inlineAvatarUrl.trim() || undefined,
          isPublic: true,
          isVerified: false,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al registrar el perfil del creador');
      }

      const created: CreatorProfile = json.data;
      // Immediately append to local list and select
      setLocalCreators((prev) => [created, ...prev]);
      setCreatorProfileId(created.id);
      setExternalCreatorHandle('');
      setExternalCreatorDisplayName('');
      setExternalCreatorAvatarUrl('');
      setShowInlineCreator(false);
      setInlineHandle('');
      setInlineDisplayName('');
      setInlineBio('');
      setInlineAvatarUrl('');
      setCreatorSuccessToast(`Creador @${created.handle} (${created.displayName}) registrado y asignado exitosamente.`);
      setTimeout(() => setCreatorSuccessToast(null), 5000);

      // Notify parent view so creators directory stays in sync
      onCreatorCreated?.(created);
    } catch (err) {
      setInlineCreatorError(err instanceof Error ? err.message : 'Error inesperado al crear creador');
    } finally {
      setIsCreatingCreator(false);
    }
  };

  const handleTogglePlace = (placeId: string) => {
    setSelectedPlaceIds((prev) => {
      if (prev.includes(placeId)) {
        const next = prev.filter((id) => id !== placeId);
        if (primaryPlaceId === placeId) {
          setPrimaryPlaceId(next[0] || '');
        }
        return next;
      } else {
        if (prev.length >= 10) return prev;
        const next = [...prev, placeId];
        if (!primaryPlaceId) {
          setPrimaryPlaceId(placeId);
        }
        return next;
      }
    });
  };

  // Robust multi-criteria place filtering
  const filteredPlaces = useMemo(() => {
    const q = placeSearch.toLowerCase().trim();
    return INITIAL_PLACES.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.localityName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesLocality =
        placeLocalityFilter === 'ALL' ||
        p.localityId === placeLocalityFilter ||
        p.localityName.toLowerCase() === placeLocalityFilter.toLowerCase();

      const matchesCategory =
        placeCategoryFilter === 'ALL' ||
        p.category.toLowerCase() === placeCategoryFilter.toLowerCase();

      return matchesSearch && matchesLocality && matchesCategory;
    });
  }, [placeSearch, placeLocalityFilter, placeCategoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!urlValidation.isValid) {
      setErrorMessage('Por favor ingresa un enlace válido de TikTok, Instagram Reels o YouTube');
      return;
    }

    if (title.trim().length < 5) {
      setErrorMessage('El título debe contener al menos 5 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        videoUrl: videoUrl.trim(),
        title: title.trim(),
        description: description.trim() || null,
        contentType,
        category,
        localityId: localityId || null,
        thumbnailUrl: thumbnailUrl.trim() || null,
        creatorProfileId: creatorProfileId || null,
        externalCreatorHandle: externalCreatorHandle.trim() ? externalCreatorHandle.trim().replace(/^@+/, '') : null,
        externalCreatorDisplayName: externalCreatorDisplayName.trim() || null,
        externalCreatorAvatarUrl: externalCreatorAvatarUrl.trim() || null,
        placeIds: selectedPlaceIds,
        primaryPlaceId: primaryPlaceId || selectedPlaceIds[0] || null,
        status,
      };

      const endpoint = isEditing ? `/api/admin/videos/${initialVideo!.id}` : '/api/admin/videos';
      const method = isEditing ? 'PUT' : 'POST';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al procesar la publicación');
      }

      onVideoSaved();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E85B49] flex items-center justify-center text-white">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                {isEditing ? 'Editar Publicación de Video' : 'Registrar Nuevo Video Turístico'}
              </h3>
              <p className="text-[11px] text-slate-400">
                TikTok, Instagram Reels y YouTube Shorts vinculados al catálogo de La Libertad
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Video URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Enlace del Video (TikTok, Instagram, YouTube) *
            </label>
            <div className="relative">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.tiktok.com/@usuario/video/1234567890..."
                disabled={isEditing}
                className="w-full text-xs p-2.5 pr-24 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49] focus:ring-1 focus:ring-[#E85B49] disabled:bg-slate-100 disabled:text-slate-500"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {urlValidation.isValid ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {urlValidation.platform}
                  </span>
                ) : videoUrl.trim() ? (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-medium">
                    No válido
                  </span>
                ) : null}
              </div>
            </div>
            {urlValidation.error && (
              <p className="text-[11px] text-red-500">{urlValidation.error}</p>
            )}
            <p className="text-[11px] text-slate-500">
              Pega el enlace original. No se descargarán ni alojarán archivos multimedia de terceros; se utiliza embebido oficial seguro.
            </p>
          </div>

          {/* Previsualización Oficial Automática de Video */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Previsualización Oficial del Video
            </label>
            <VideoPreviewCard
              state={previewState}
              data={previewData}
              rawUrl={videoUrl}
              errorMessage={previewError}
              onRetry={handleRetryPreview}
            />
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-800">
                Título de la Publicación *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Los mejores ceviches de Huanchaco frente al mar"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                required
                minLength={5}
                maxLength={140}
              />
              <span className="text-[10px] text-slate-400 float-right">{title.length}/140</span>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-800">
                Descripción / Resumen
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalle o recomendación turística descrita en el video..."
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                maxLength={1000}
              />
            </div>
          </div>

          {/* Category, Locality & Content Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">Categoría *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">Localidad *</label>
              <select
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
              >
                {LA_LIBERTAD_LOCALITIES.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">Tipo de Contenido</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as VideoContentType)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
              >
                <option value="PLACE">Lugar Turístico Específico</option>
                <option value="ROUTE">Ruta o Circuito Diario</option>
                <option value="GENERAL">Recomendación General / Tips</option>
              </select>
            </div>
          </div>

          {/* Creator Attribution */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {creatorSuccessToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{creatorSuccessToast}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    Creador Asignado
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInlineCreator(!showInlineCreator);
                      if (!showInlineCreator) {
                        setInlineHandle(externalCreatorHandle || '');
                        setInlineDisplayName(externalCreatorDisplayName || previewData?.authorName || '');
                        if (urlValidation.platform === 'tiktok' || urlValidation.platform === 'instagram' || urlValidation.platform === 'youtube') {
                          setInlinePlatform(urlValidation.platform as VideoPlatform);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E85B49] hover:text-[#d64f3e] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showInlineCreator ? 'Cerrar registro' : '+ Registrar nuevo creador'}</span>
                  </button>
                </div>
                <select
                  value={creatorProfileId}
                  onChange={(e) => setCreatorProfileId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                >
                  <option value="">— Sin creador asignado (Oficial / General) —</option>
                  {localCreators.map((c) => (
                    <option key={c.id} value={c.id}>
                      @{c.handle} ({c.displayName}) - {c.primaryPlatform}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Estado de la Publicación
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ModerationStatus)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49] font-medium"
                >
                  <option value="APPROVED">Aprobado (Visible en el ranking público)</option>
                  <option value="PENDING">Pendiente de Revisión</option>
                  <option value="OBSERVED">Observado</option>
                  <option value="HIDDEN">Oculto</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </div>
            </div>

            {/* Inline Quick Creator Registration Panel */}
            {showInlineCreator && (
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <UserPlus className="w-4 h-4 text-[#E85B49]" />
                    <span>Registrar Nuevo Creador al Directorio</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Se creará e inmediatamente se asignará a este video
                  </span>
                </div>

                {inlineCreatorError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{inlineCreatorError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Handle / Usuario (@) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">@</span>
                      <input
                        type="text"
                        value={inlineHandle}
                        onChange={(e) => setInlineHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="viajero_libertad"
                        className="w-full text-xs p-2 pl-6 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nombre Público *
                    </label>
                    <input
                      type="text"
                      value={inlineDisplayName}
                      onChange={(e) => setInlineDisplayName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Plataforma Principal *
                    </label>
                    <select
                      value={inlinePlatform}
                      onChange={(e) => setInlinePlatform(e.target.value as VideoPlatform)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                    >
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Biografía Breve (Opcional)
                    </label>
                    <input
                      type="text"
                      value={inlineBio}
                      onChange={(e) => setInlineBio(e.target.value)}
                      placeholder="Explorador gastronómico de Trujillo y Huanchaco..."
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      URL del Avatar / Foto (Opcional)
                    </label>
                    <input
                      type="url"
                      value={inlineAvatarUrl}
                      onChange={(e) => setInlineAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInlineCreator(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCreatorInline}
                    disabled={isCreatingCreator || inlineHandle.trim().length < 3 || inlineDisplayName.trim().length < 2}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#E85B49] hover:bg-[#d64f3e] disabled:opacity-50 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isCreatingCreator ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Crear y Vincular Creador</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* External Creator Attribution Fields (when no registered profile is selected) */}
          {!creatorProfileId && !showInlineCreator && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Identidad del Creador Original (TikTok / Instagram / YouTube)
                </label>
                <span className="text-[11px] text-slate-500">
                  Conserva la autoría del creador sin atribuir al administrador
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Handle / Usuario Externo
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">@</span>
                    <input
                      type="text"
                      value={externalCreatorHandle.replace(/^@+/, '')}
                      onChange={(e) => setExternalCreatorHandle(e.target.value.trim().replace(/^@+/, ''))}
                      placeholder="viajerotrujillano"
                      className="w-full text-xs p-2 pl-7 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Ejemplo: @viajerotrujillano (sin arroba)</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Nombre Público del Creador (Opcional)
                  </label>
                  <input
                    type="text"
                    value={externalCreatorDisplayName}
                    onChange={(e) => setExternalCreatorDisplayName(e.target.value)}
                    placeholder="Viajero Trujillano Oficial"
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#E85B49]"
                  />
                  <p className="text-[10px] text-slate-400">Si se omite, se mostrará el @handle o "Creador de contenido"</p>
                </div>
              </div>
            </div>
          )}

          {/* Place Association: Search, Locality/Category Filters & Multi-select */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Lugares Turísticos Asociados ({selectedPlaceIds.length}/10)
                </label>
                <p className="text-[11px] text-slate-500">
                  Selecciona uno o más destinos del catálogo. Marca la estrella (★) para definir el destino principal.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 shrink-0">
                Mostrando {Math.min(filteredPlaces.length, 30)} de {filteredPlaces.length} destinos
              </span>
            </div>

            {/* Selected places chips */}
            {selectedPlaceIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                {selectedPlaceIds.map((pId) => {
                  const place = INITIAL_PLACES.find((p) => p.id === pId);
                  const isPrimary = primaryPlaceId === pId;
                  return (
                    <span
                      key={pId}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs transition-colors ${
                        isPrimary
                          ? 'bg-[#E85B49]/10 text-[#E85B49] border-[#E85B49]/40 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setPrimaryPlaceId(pId)}
                        title={isPrimary ? 'Lugar principal del video' : 'Establecer como destino principal'}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isPrimary ? 'fill-[#E85B49] text-[#E85B49]' : 'text-slate-300 hover:text-amber-500'
                          }`}
                        />
                      </button>
                      <span className="truncate max-w-[170px]">{place?.name || pId}</span>
                      {place && (
                        <span className="text-[10px] text-slate-400 capitalize">
                          ({place.localityName})
                        </span>
                      )}
                      {isPrimary && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-[#E85B49] text-white">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleTogglePlace(pId)}
                        title="Quitar asociación"
                        className="text-slate-400 hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Filters Toolbar: Search + Locality Filter + Category Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="sm:col-span-6 relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  placeholder="Buscar por nombre o calle (ej. Huanchaco, Chan Chan, Celler)..."
                  className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E85B49]"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={placeLocalityFilter}
                  onChange={(e) => setPlaceLocalityFilter(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E85B49]"
                >
                  <option value="ALL">Todas las localidades</option>
                  {LA_LIBERTAD_LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={placeCategoryFilter}
                  onChange={(e) => setPlaceCategoryFilter(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E85B49]"
                >
                  {PLACE_FILTER_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Available Places List */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
              {filteredPlaces.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400 space-y-1">
                  <p>No se encontraron lugares con los filtros actuales.</p>
                  {(placeSearch || placeLocalityFilter !== 'ALL' || placeCategoryFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlaceSearch('');
                        setPlaceLocalityFilter('ALL');
                        setPlaceCategoryFilter('ALL');
                      }}
                      className="text-[#E85B49] hover:underline font-semibold text-xs cursor-pointer"
                    >
                      Restablecer filtros de búsqueda
                    </button>
                  )}
                </div>
              ) : (
                filteredPlaces.slice(0, 40).map((p) => {
                  const isSelected = selectedPlaceIds.includes(p.id);
                  const isPrimary = primaryPlaceId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleTogglePlace(p.id)}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-amber-50/70 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by row click
                          className="rounded text-[#E85B49] focus:ring-[#E85B49]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 truncate block">{p.name}</span>
                            {isPrimary && (
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-[#E85B49] text-white">
                                Principal
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize block">
                            {p.localityName} • {p.category} {p.address ? `• ${p.address}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryPlaceId(p.id);
                            }}
                            title={isPrimary ? 'Es el destino principal' : 'Definir como principal'}
                            className={`p-1 rounded cursor-pointer ${
                              isPrimary ? 'text-[#E85B49]' : 'text-slate-300 hover:text-amber-500'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isPrimary ? 'fill-[#E85B49]' : ''}`} />
                          </button>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.rating ? `★ ${p.rating}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !urlValidation.isValid}
              className="px-5 py-2 text-xs font-bold text-white bg-[#E85B49] hover:bg-[#d64f3e] disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Registrar Publicación'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
