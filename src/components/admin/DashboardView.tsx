import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  CopyX,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  Video,
  Eye,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronRight,
  Activity,
  Check,
} from 'lucide-react';
import { AdminDashboardMetrics, UnifiedAuditEntry } from '../../types/adminCatalog.ts';
import { AdminSection } from './AdminSidebar.tsx';

interface DashboardViewProps {
  onNavigateSection: (section: AdminSection) => void;
  onOpenCreatePlaceModal: () => void;
  refreshKey: number;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('es-PE');
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Hace un momento';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return new Date(isoString).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  } catch {
    return isoString;
  }
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateSection,
  onOpenCreatePlaceModal,
  refreshKey,
}) => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Error al cargar métricas del panel administrativo');
      }

      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      } else {
        throw new Error(json.error || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  if (isLoading && !metrics) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[450px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E85B49]" />
          <span className="font-medium">Consolidando indicadores globales de RiyMo...</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Catálogo regional, creadores, moderación de videos y auditoría unificada.
        </p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const m = metrics!;
  const creators = m.creators || {
    total: 0,
    publicCount: 0,
    hiddenCount: 0,
    verifiedCount: 0,
    byPlatform: { tiktok: 0, instagram: 0, youtube: 0 },
    totalAudienceFollowers: 0,
    topCreators: [],
  };
  const videos = m.videos || {
    total: 0,
    approved: 0,
    pending: 0,
    observed: 0,
    rejected: 0,
    byPlatform: { tiktok: 0, instagram: 0, youtube: 0 },
    byCategory: [],
    placesWithVideosCount: 0,
    catalogCoveragePercent: 0,
  };
  const engagement = m.engagement || {
    totalInternalViews: 0,
    totalInternalSaves: 0,
    totalExternalViews: 0,
    totalExternalLikes: 0,
    totalExternalComments: 0,
  };
  const recentActivity = m.recentActivity || [];

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* 1. Top Operations Banner */}
      <div className="bg-[#17243A] text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#E85B49]/10 via-[#D9B66F]/5 to-transparent pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E85B49]/20 text-[#E85B49] text-[11px] font-bold tracking-wider uppercase border border-[#E85B49]/30">
              Región La Libertad, Perú
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold tracking-wide border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistema Operativo
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Panel General de Operaciones
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Supervisión integral de {m.totalPlaces} destinos turísticos, {creators.total} creadores locales, {videos.total} videos en moderación y trazabilidad inmutable de cambios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
          <button
            onClick={fetchDashboardData}
            title="Sincronizar datos"
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#E85B49]' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => onNavigateSection('creators')}
            className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Video className="w-4 h-4 text-[#D9B66F]" />
            <span>Moderación</span>
            {videos.pending > 0 && (
              <span className="px-1.5 py-0.2 bg-[#E85B49] text-white text-[10px] font-bold rounded-full">
                {videos.pending}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCreatePlaceModal}
            className="px-4 py-2.5 bg-[#E85B49] hover:bg-[#d64f3e] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Lugar</span>
          </button>
        </div>
      </div>

      {/* 2. Four Master KPI Clusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cluster 1: Lugares Turísticos */}
        <div
          onClick={() => onNavigateSection('places')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#E85B49]/40 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E85B49]/10 flex items-center justify-center text-[#E85B49]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Lugares</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E85B49] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {m.totalPlaces}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Destinos en La Libertad</p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-emerald-50/70 rounded-md">
                <span className="text-emerald-800 font-medium">Publicados:</span>
                <span className="font-bold text-emerald-700 font-mono">{m.publishedCount}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-md">
                <span className="text-slate-600 font-medium">Borradores:</span>
                <span className="font-bold text-slate-700 font-mono">{m.draftCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              {m.verifiedCount} oficiales
            </span>
            {m.potentialDuplicatesCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                <CopyX className="w-3 h-3 text-amber-600" />
                {m.potentialDuplicatesCount} posibles duplicados
              </span>
            ) : (
              <span className="text-slate-400">Sin duplicados</span>
            )}
          </div>
        </div>

        {/* Cluster 2: Creadores de Contenido */}
        <div
          onClick={() => onNavigateSection('creators')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#263B35]/40 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#263B35]/10 flex items-center justify-center text-[#263B35]">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Creadores</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#263B35] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {creators.total}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Perfiles registrados en la región</p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-blue-50/70 rounded-md">
                <span className="text-blue-800 font-medium">Públicos:</span>
                <span className="font-bold text-blue-700 font-mono">{creators.publicCount}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-md">
                <span className="text-slate-600 font-medium">Ocultos:</span>
                <span className="font-bold text-slate-700 font-mono">{creators.hiddenCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-[#D9B66F]" />
              {creators.verifiedCount} verificados
            </span>
            <span className="font-bold text-[#263B35] bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
              {formatNumber(creators.totalAudienceFollowers)} audiencia
            </span>
          </div>
        </div>

        {/* Cluster 3: Videos & Moderación */}
        <div
          onClick={() => onNavigateSection('creators')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#17243A]/40 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#17243A]/10 flex items-center justify-center text-[#17243A]">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Videos</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#17243A] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {videos.total}
              </div>
              {videos.pending > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-full border border-amber-200 animate-pulse">
                  {videos.pending} pendientes
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Experiencias multimedia</p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-emerald-50/70 rounded-md">
                <span className="text-emerald-800 font-medium">Aprobados:</span>
                <span className="font-bold text-emerald-700 font-mono">{videos.approved}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-amber-50/70 rounded-md">
                <span className="text-amber-800 font-medium">Observados:</span>
                <span className="font-bold text-amber-700 font-mono">{videos.observed}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
            <span>Lugares con video:</span>
            <span className="font-bold text-slate-900 font-mono">
              {videos.placesWithVideosCount} ({videos.catalogCoveragePercent}% del catálogo)
            </span>
          </div>
        </div>

        {/* Cluster 4: Engagement & Interacciones Reales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-[#E85B49]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Interacción</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Datos Reales
              </span>
            </div>

            <div className="text-3xl font-extrabold text-[#E85B49] tracking-tight">
              {formatNumber(engagement.totalInternalViews + engagement.totalExternalViews)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Visualizaciones globales acumuladas</p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-1.5 bg-slate-50 rounded-md">
                <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>RiyMo App:</span>
                </div>
                <div className="font-bold text-slate-900 font-mono mt-0.5">
                  {formatNumber(engagement.totalInternalViews)}
                </div>
              </div>

              <div className="p-1.5 bg-slate-50 rounded-md">
                <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                  <Bookmark className="w-3 h-3 text-amber-500" />
                  <span>En Itinerarios:</span>
                </div>
                <div className="font-bold text-slate-900 font-mono mt-0.5">
                  {formatNumber(engagement.totalInternalSaves)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-slate-400" />
              {formatNumber(engagement.totalExternalLikes)} likes
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              {formatNumber(engagement.totalExternalComments)} comentarios
            </span>
          </div>
        </div>
      </div>

      {/* 3. Distributions & Multimedia Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Distribución por Localidad (La Libertad) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E85B49]" />
                <h3 className="text-sm font-bold text-slate-900">Cobertura Territorial</h3>
              </div>
              <button
                onClick={() => onNavigateSection('localities')}
                className="text-xs text-[#E85B49] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {m.placesByLocality.slice(0, 6).map((loc) => {
                const percentage = m.totalPlaces > 0 ? Math.round((loc.count / m.totalPlaces) * 100) : 0;
                return (
                  <div key={loc.localityId} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{loc.localityName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {loc.count} lugares <span className="text-slate-400">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-800 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Provincias y balnearios de La Libertad</span>
            <span className="font-mono text-slate-600 font-semibold">{m.placesByLocality.length} zonas</span>
          </div>
        </div>

        {/* Card 2: Distribución por Categorías */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#71958B]" />
                <h3 className="text-sm font-bold text-slate-900">Categorías Turísticas</h3>
              </div>
              <button
                onClick={() => onNavigateSection('categories')}
                className="text-xs text-[#E85B49] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {m.placesByCategory.slice(0, 6).map((cat) => {
                const percentage = m.totalPlaces > 0 ? Math.round((cat.count / m.totalPlaces) * 100) : 0;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 capitalize">{cat.category}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {cat.count} lugares <span className="text-slate-400">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E85B49] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Clasificación del catálogo regional</span>
            <span className="font-mono text-slate-600 font-semibold">{m.placesByCategory.length} categorías</span>
          </div>
        </div>

        {/* Card 3: Plataformas & Top Creadores */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#D9B66F]" />
                <h3 className="text-sm font-bold text-slate-900">Ecosistema Multimedia</h3>
              </div>
              <button
                onClick={() => onNavigateSection('creators')}
                className="text-xs text-[#E85B49] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Gestionar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Plataformas Breakdown */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500">TikTok</span>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {videos.byPlatform.tiktok}
                </div>
                <div className="text-[10px] text-slate-400">
                  {creators.byPlatform.tiktok} creadores
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-rose-600">Instagram</span>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {videos.byPlatform.instagram}
                </div>
                <div className="text-[10px] text-slate-400">
                  {creators.byPlatform.instagram} creadores
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-red-600">YouTube</span>
                <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {videos.byPlatform.youtube}
                </div>
                <div className="text-[10px] text-slate-400">
                  {creators.byPlatform.youtube} creadores
                </div>
              </div>
            </div>

            {/* Top Creadores */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Top Creadores por Audiencia
              </span>
              <div className="space-y-2">
                {creators.topCreators && creators.topCreators.length > 0 ? (
                  creators.topCreators.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.displayName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {c.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                            <span>{c.displayName}</span>
                            {c.isVerified && (
                              <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{c.handle}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        {formatNumber(c.followers)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No hay creadores con audiencia registrada aún.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Redes compatibles: TikTok, IG, YT</span>
            <span className="font-mono text-[#263B35] font-bold">100% video directo</span>
          </div>
        </div>
      </div>

      {/* 4. Unified Recent Audit Activity Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Actividad Administrativa Reciente</h3>
              <p className="text-[11px] text-slate-500">
                Auditoría unificada inmutable: lugares, creadores y moderación de videos.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('audit')}
            className="text-xs text-[#E85B49] hover:underline font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Ver historial completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((log) => {
              const moduleBadge =
                log.module === 'places'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : log.module === 'creators'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200';

              const moduleLabel =
                log.module === 'places'
                  ? 'Lugar'
                  : log.module === 'creators'
                  ? 'Creador'
                  : 'Video';

              const actionBadge =
                log.action === 'CREATE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : log.action === 'APPROVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : log.action === 'REJECT'
                  ? 'bg-rose-100 text-rose-800'
                  : log.action === 'OBSERVE'
                  ? 'bg-amber-100 text-amber-800'
                  : log.action === 'STATUS_CHANGE'
                  ? 'bg-purple-100 text-purple-800'
                  : log.action === 'MERGE'
                  ? 'bg-indigo-100 text-indigo-800'
                  : log.action === 'ARCHIVE'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700';

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${moduleBadge}`}
                        >
                          {moduleLabel}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${actionBadge}`}
                        >
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-900 truncate">
                          {log.entityName}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed">
                        {log.changeSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 text-slate-400 text-[11px]">
                    <span className="font-medium text-slate-600">
                      Por: <span className="text-slate-800 font-semibold">{log.adminName}</span>
                    </span>
                    <span className="font-mono text-slate-400" title={log.createdAt}>
                      {formatTimeAgo(log.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay actividades registradas en la auditoría unificada todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
