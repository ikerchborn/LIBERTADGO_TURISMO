import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  BarChart3,
  Filter,
  Info,
} from 'lucide-react';
import { AdminDashboardMetrics, UnifiedAuditEntry, AuditModule } from '../../types/adminCatalog.ts';
import { AdminSection } from './AdminSidebar.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface DashboardViewProps {
  onNavigateSection: (section: AdminSection) => void;
  onOpenCreatePlaceModal: () => void;
  refreshKey: number;
}

type TimelineMetricType = 'total' | 'videos' | 'creators' | 'places' | 'audits';

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
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro activo para el historial de actividad reciente
  const [activityFilter, setActivityFilter] = useState<'all' | AuditModule>('all');

  // Métrica activa para el gráfico de evolución temporal
  const [timelineMetric, setTimelineMetric] = useState<TimelineMetricType>('total');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/dashboard', {
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Sesión administrativa expirada o no autorizada. Vuelve a iniciar sesión.');
        }
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
  }, [refreshKey, token]);

  // Actividades filtradas por módulo
  const filteredActivity = useMemo(() => {
    if (!metrics?.recentActivity) return [];
    if (activityFilter === 'all') return metrics.recentActivity;
    return metrics.recentActivity.filter((item) => item.module === activityFilter);
  }, [metrics?.recentActivity, activityFilter]);

  if (isLoading && !metrics) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[450px]">
        <div className="flex items-center gap-3 text-[#263B35] text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E85B49]" />
          <span className="font-semibold">Consolidando indicadores en tiempo real desde Neon...</span>
        </div>
        <p className="text-xs text-[#64748B] mt-2">
          Catálogo regional, creadores, moderación de videos y auditoría unificada.
        </p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E85B49] shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
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
  const timeline = m.timeline || [];

  // Cálculos para el gráfico temporal
  const timelineValues = timeline.map((t) => t[timelineMetric] || 0);
  const maxTimelineValue = Math.max(...timelineValues, 1);
  const totalTimelineSum = timelineValues.reduce((acc, curr) => acc + curr, 0);
  const avgTimelineValue = timelineValues.length > 0 ? (totalTimelineSum / timelineValues.length).toFixed(1) : '0';
  const peakBucket = timeline.reduce((prev, current) =>
    (current[timelineMetric] || 0) > (prev[timelineMetric] || 0) ? current : prev,
    timeline[0] || { label: 'Sin datos', total: 0 }
  );

  return (
    <div className="p-5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-[#263B35]">
      {/* ============================================================ */}
      {/* 1. TOP OPERATIONS BANNER (RiyMo Brand Colors)               */}
      {/* ============================================================ */}
      <div className="bg-[#17243A] text-white rounded-xl p-5 sm:p-6 shadow-xs border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#E85B49]/15 via-[#D9B66F]/5 to-transparent pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E85B49]/20 text-[#E85B49] text-[11px] font-bold tracking-wider uppercase border border-[#E85B49]/30">
              La Libertad, Perú
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium tracking-wide border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Base de Datos Neon Conectada
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Panel de Control y Rendimiento de RiyMo
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Supervisión integral de {m.totalPlaces} destinos turísticos catalogados, {creators.total} perfiles de creadores locales, {videos.total} experiencias en video y trazabilidad inmutable de cambios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
          <button
            onClick={fetchDashboardData}
            title="Sincronizar métricas en tiempo real"
            className="p-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#E85B49]' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => onNavigateSection('creators')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-[#D9B66F]" />
            <span>Moderar Videos</span>
            {videos.pending > 0 && (
              <span className="px-1.5 py-0.2 bg-[#E85B49] text-white text-[10px] font-bold rounded-full">
                {videos.pending}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCreatePlaceModal}
            className="px-3.5 py-2 bg-[#E85B49] hover:bg-[#d64f3e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Lugar</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FOUR MASTER KPI CLUSTERS (Clean, Professional Hierarchy)   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cluster 1: Lugares Turísticos */}
        <div
          onClick={() => onNavigateSection('places')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-[#E9E7E1] hover:border-[#E85B49]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E85B49]/10 flex items-center justify-center text-[#E85B49]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Lugares</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#E85B49] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="text-3xl font-bold text-[#263B35] tracking-tight">
              {m.totalPlaces}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Destinos en La Libertad</p>

            <div className="mt-3.5 pt-3 border-t border-[#E9E7E1] grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded-md">
                <span className="text-emerald-900 font-medium">Publicados:</span>
                <span className="font-bold text-emerald-800 font-mono">{m.publishedCount}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#F7F2E8] rounded-md">
                <span className="text-[#263B35] font-medium">Borradores:</span>
                <span className="font-bold text-[#263B35] font-mono">{m.draftCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1 text-[#263B35] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#263B35]" />
              {m.verifiedCount} oficiales
            </span>
            {m.potentialDuplicatesCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <CopyX className="w-3 h-3 text-amber-700" />
                {m.potentialDuplicatesCount} duplicados
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">0 duplicados</span>
            )}
          </div>
        </div>

        {/* Cluster 2: Creadores de Contenido */}
        <div
          onClick={() => onNavigateSection('creators')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-[#E9E7E1] hover:border-[#263B35]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#263B35]/10 flex items-center justify-center text-[#263B35]">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Creadores</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#263B35] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="text-3xl font-bold text-[#263B35] tracking-tight">
              {creators.total}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Perfiles registrados en la región</p>

            <div className="mt-3.5 pt-3 border-t border-[#E9E7E1] grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-[#F7F2E8] rounded-md">
                <span className="text-[#263B35] font-medium">Públicos:</span>
                <span className="font-bold text-[#263B35] font-mono">{creators.publicCount}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-md">
                <span className="text-[#64748B] font-medium">Ocultos:</span>
                <span className="font-bold text-slate-700 font-mono">{creators.hiddenCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-[#64748B]">
              <Sparkles className="w-3.5 h-3.5 text-[#D9B66F]" />
              {creators.verifiedCount} verificados
            </span>
            <span className="font-semibold text-[#263B35] bg-[#F7F2E8] px-2 py-0.5 rounded text-[11px]">
              {formatNumber(creators.totalAudienceFollowers)} audiencia
            </span>
          </div>
        </div>

        {/* Cluster 3: Videos & Moderación */}
        <div
          onClick={() => onNavigateSection('creators')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-[#E9E7E1] hover:border-[#17243A]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#17243A]/10 flex items-center justify-center text-[#17243A]">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Videos</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#17243A] group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-[#263B35] tracking-tight">
                {videos.total}
              </div>
              {videos.pending > 0 ? (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-xs rounded-full border border-rose-200">
                  {videos.pending} pendientes
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-medium text-xs rounded-full">
                  Al día
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Experiencias multimedia</p>

            <div className="mt-3.5 pt-3 border-t border-[#E9E7E1] grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded-md">
                <span className="text-emerald-900 font-medium">Aprobados:</span>
                <span className="font-bold text-emerald-800 font-mono">{videos.approved}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-amber-50 rounded-md">
                <span className="text-amber-900 font-medium">Observados:</span>
                <span className="font-bold text-amber-800 font-mono">{videos.observed}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Lugares con video:</span>
            <span className="font-bold text-[#263B35] font-mono">
              {videos.placesWithVideosCount} ({videos.catalogCoveragePercent}% del catálogo)
            </span>
          </div>
        </div>

        {/* Cluster 4: Engagement & Interacciones Reales */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E9E7E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-[#E85B49]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Interacción</span>
              </div>
              <span className="text-[10px] bg-[#F7F2E8] text-[#263B35] font-medium px-2 py-0.5 rounded border border-[#E9E7E1]">
                Datos Reales
              </span>
            </div>

            <div className="text-3xl font-bold text-[#E85B49] tracking-tight">
              {formatNumber(engagement.totalInternalViews + engagement.totalExternalViews)}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Visualizaciones globales acumuladas</p>

            <div className="mt-3.5 pt-3 border-t border-[#E9E7E1] grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-1.5 bg-[#F7F2E8] rounded-md">
                <div className="flex items-center gap-1 text-[#64748B] text-[10px]">
                  <Eye className="w-3 h-3 text-[#263B35]" />
                  <span>RiyMo App:</span>
                </div>
                <div className="font-bold text-[#263B35] font-mono mt-0.5">
                  {formatNumber(engagement.totalInternalViews)}
                </div>
              </div>

              <div className="p-1.5 bg-[#F7F2E8] rounded-md">
                <div className="flex items-center gap-1 text-[#64748B] text-[10px]">
                  <Bookmark className="w-3 h-3 text-[#D9B66F]" />
                  <span>En Itinerarios:</span>
                </div>
                <div className="font-bold text-[#263B35] font-mono mt-0.5">
                  {formatNumber(engagement.totalInternalSaves)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-[#64748B]" />
              {formatNumber(engagement.totalExternalLikes)} likes
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#64748B]" />
              {formatNumber(engagement.totalExternalComments)} comentarios
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. GRÁFICO DE EVOLUCIÓN TEMPORAL (Datos reales cronológicos) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl p-5 border border-[#E9E7E1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9E7E1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F7F2E8] flex items-center justify-center text-[#263B35]">
              <BarChart3 className="w-4 h-4 text-[#263B35]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#263B35] flex items-center gap-2">
                <span>Evolución Temporal de la Plataforma</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                  Neon PostgreSQL
                </span>
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Registro cronológico consolidado por meses para análisis de crecimiento y moderación.
              </p>
            </div>
          </div>

          {/* Selector de Métrica */}
          <div className="flex items-center gap-1 bg-[#F7F2E8] p-1 rounded-lg border border-[#E9E7E1] text-xs">
            <button
              onClick={() => setTimelineMetric('total')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                timelineMetric === 'total'
                  ? 'bg-white text-[#263B35] shadow-xs'
                  : 'text-[#64748B] hover:text-[#263B35]'
              }`}
            >
              Actividad Total
            </button>
            <button
              onClick={() => setTimelineMetric('videos')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                timelineMetric === 'videos'
                  ? 'bg-white text-[#263B35] shadow-xs'
                  : 'text-[#64748B] hover:text-[#263B35]'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setTimelineMetric('creators')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                timelineMetric === 'creators'
                  ? 'bg-white text-[#263B35] shadow-xs'
                  : 'text-[#64748B] hover:text-[#263B35]'
              }`}
            >
              Creadores
            </button>
            <button
              onClick={() => setTimelineMetric('places')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                timelineMetric === 'places'
                  ? 'bg-white text-[#263B35] shadow-xs'
                  : 'text-[#64748B] hover:text-[#263B35]'
              }`}
            >
              Lugares
            </button>
            <button
              onClick={() => setTimelineMetric('audits')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                timelineMetric === 'audits'
                  ? 'bg-white text-[#263B35] shadow-xs'
                  : 'text-[#64748B] hover:text-[#263B35]'
              }`}
            >
              Auditoría
            </button>
          </div>
        </div>

        {/* Resumen numérico rápido del periodo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F7F2E8]/60 rounded-lg border border-[#E9E7E1]">
            <span className="text-[11px] text-[#64748B] block">Total acumulado:</span>
            <span className="text-lg font-bold text-[#263B35] font-mono mt-0.5 block">
              {totalTimelineSum} eventos
            </span>
          </div>
          <div className="p-3 bg-[#F7F2E8]/60 rounded-lg border border-[#E9E7E1]">
            <span className="text-[11px] text-[#64748B] block">Promedio mensual:</span>
            <span className="text-lg font-bold text-[#263B35] font-mono mt-0.5 block">
              {avgTimelineValue} / mes
            </span>
          </div>
          <div className="p-3 bg-[#F7F2E8]/60 rounded-lg border border-[#E9E7E1]">
            <span className="text-[11px] text-[#64748B] block">Pico de actividad:</span>
            <span className="text-sm font-bold text-[#E85B49] mt-1 block truncate">
              {peakBucket.label} ({peakBucket[timelineMetric] || 0})
            </span>
          </div>
          <div className="p-3 bg-[#F7F2E8]/60 rounded-lg border border-[#E9E7E1]">
            <span className="text-[11px] text-[#64748B] block">Periodo cubierto:</span>
            <span className="text-sm font-medium text-[#263B35] mt-1 block">
              {timeline.length} meses cronológicos
            </span>
          </div>
        </div>

        {/* Gráfico visual de barras cronológico */}
        <div className="pt-2">
          {timeline.length > 0 ? (
            <div className="space-y-2">
              <div className="h-44 flex items-end gap-3 sm:gap-6 pt-6 px-2">
                {timeline.map((bucket) => {
                  const val = bucket[timelineMetric] || 0;
                  const heightPercent = maxTimelineValue > 0 ? Math.max(Math.round((val / maxTimelineValue) * 100), 6) : 6;
                  const isCurrentPeak = val > 0 && val === maxTimelineValue;

                  return (
                    <div
                      key={bucket.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip con valor exacto en hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#17243A] text-white text-[10px] py-0.5 px-2 rounded pointer-events-none whitespace-nowrap shadow-xs z-10 font-mono">
                        {val} {timelineMetric}
                      </div>

                      {/* Etiqueta del valor encima de la barra */}
                      <span className="text-[10px] font-mono text-[#64748B] group-hover:text-[#263B35] font-semibold mb-1">
                        {val}
                      </span>

                      {/* Barra de altura proporcional */}
                      <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md overflow-hidden flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isCurrentPeak
                              ? 'bg-[#E85B49]'
                              : timelineMetric === 'videos'
                              ? 'bg-[#D9B66F]'
                              : timelineMetric === 'creators'
                              ? 'bg-[#71958B]'
                              : 'bg-[#263B35]'
                          } group-hover:brightness-110`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Etiqueta del mes debajo */}
                      <span className="text-[11px] text-[#64748B] group-hover:text-[#263B35] font-medium mt-2 whitespace-nowrap">
                        {bucket.label.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-[#64748B] opacity-75 font-mono">
                        {bucket.label.split(' ')[1] || ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#E9E7E1]">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>
                    Gráfico generado exclusivamente con fechas reales de publicaciones, registros de creadores y registros de auditoría en Neon.
                  </span>
                </div>
                <span className="font-mono text-[#263B35] font-semibold">100% datos verificados</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B] bg-[#F7F2E8]/40 rounded-lg">
              No existen series temporales suficientes aún para proyectar el gráfico.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. DISTRIBUTIONS & MULTIMEDIA GRID                          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Distribución por Localidad (La Libertad) */}
        <div className="bg-white p-5 rounded-xl border border-[#E9E7E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E85B49]" />
                <h3 className="text-sm font-semibold text-[#263B35]">Cobertura Territorial</h3>
              </div>
              <button
                onClick={() => onNavigateSection('localities')}
                className="text-xs text-[#E85B49] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
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
                      <span className="font-medium text-[#263B35]">{loc.localityName}</span>
                      <span className="text-[#64748B] font-mono text-[11px]">
                        {loc.count} lugares <span className="opacity-75">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F7F2E8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#263B35] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E9E7E1] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Provincias y balnearios de La Libertad</span>
            <span className="font-mono text-[#263B35] font-semibold">{m.placesByLocality.length} zonas</span>
          </div>
        </div>

        {/* Card 2: Distribución por Categorías */}
        <div className="bg-white p-5 rounded-xl border border-[#E9E7E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#71958B]" />
                <h3 className="text-sm font-semibold text-[#263B35]">Categorías Turísticas</h3>
              </div>
              <button
                onClick={() => onNavigateSection('categories')}
                className="text-xs text-[#E85B49] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
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
                      <span className="font-medium text-[#263B35] capitalize">{cat.category}</span>
                      <span className="text-[#64748B] font-mono text-[11px]">
                        {cat.count} lugares <span className="opacity-75">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F7F2E8] rounded-full overflow-hidden">
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

          <div className="mt-5 pt-3 border-t border-[#E9E7E1] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Clasificación del catálogo regional</span>
            <span className="font-mono text-[#263B35] font-semibold">{m.placesByCategory.length} categorías</span>
          </div>
        </div>

        {/* Card 3: Plataformas & Top Creadores */}
        <div className="bg-white p-5 rounded-xl border border-[#E9E7E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#D9B66F]" />
                <h3 className="text-sm font-semibold text-[#263B35]">Ecosistema Multimedia</h3>
              </div>
              <button
                onClick={() => onNavigateSection('creators')}
                className="text-xs text-[#E85B49] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Gestionar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Plataformas Breakdown */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 bg-[#F7F2E8]/60 border border-[#E9E7E1] rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-[#263B35]">TikTok</span>
                <div className="text-base font-bold text-[#263B35] font-mono mt-0.5">
                  {videos.byPlatform.tiktok}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {creators.byPlatform.tiktok} creadores
                </div>
              </div>

              <div className="p-2.5 bg-[#F7F2E8]/60 border border-[#E9E7E1] rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-rose-600">Instagram</span>
                <div className="text-base font-bold text-[#263B35] font-mono mt-0.5">
                  {videos.byPlatform.instagram}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {creators.byPlatform.instagram} creadores
                </div>
              </div>

              <div className="p-2.5 bg-[#F7F2E8]/60 border border-[#E9E7E1] rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-red-600">YouTube</span>
                <div className="text-base font-bold text-[#263B35] font-mono mt-0.5">
                  {videos.byPlatform.youtube}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {creators.byPlatform.youtube} creadores
                </div>
              </div>
            </div>

            {/* Top Creadores */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">
                Top Creadores por Audiencia
              </span>
              <div className="space-y-1.5">
                {creators.topCreators && creators.topCreators.length > 0 ? (
                  creators.topCreators.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F7F2E8]/50 transition-colors border border-transparent hover:border-[#E9E7E1]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.displayName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E9E7E1]"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#F7F2E8] text-[#263B35] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E9E7E1]">
                            {c.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-xs font-semibold text-[#263B35] truncate flex items-center gap-1">
                            <span>{c.displayName}</span>
                            {c.isVerified && (
                              <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-[#64748B] font-mono">{c.handle}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold font-mono text-[#263B35] bg-[#F7F2E8] px-2 py-0.5 rounded shrink-0">
                        {formatNumber(c.followers)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#64748B] text-center py-3">
                    No hay creadores con audiencia registrada aún.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E9E7E1] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Redes compatibles: TikTok, IG, YT</span>
            <span className="font-mono text-[#263B35] font-semibold">100% video directo</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. UNIFIED RECENT AUDIT ACTIVITY STREAM                     */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-[#E9E7E1] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E9E7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F7F2E8] flex items-center justify-center text-[#263B35]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#263B35]">Actividad Administrativa Reciente</h3>
              <p className="text-[11px] text-[#64748B]">
                Auditoría unificada inmutable: catálogo de lugares, creadores y moderación de videos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filtros de Módulo */}
            <div className="flex items-center gap-1 bg-[#F7F2E8] p-0.5 rounded-lg border border-[#E9E7E1] text-xs">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  activityFilter === 'all'
                    ? 'bg-white text-[#263B35] shadow-xs'
                    : 'text-[#64748B] hover:text-[#263B35]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActivityFilter('places')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  activityFilter === 'places'
                    ? 'bg-white text-[#263B35] shadow-xs'
                    : 'text-[#64748B] hover:text-[#263B35]'
                }`}
              >
                Lugares
              </button>
              <button
                onClick={() => setActivityFilter('creators')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  activityFilter === 'creators'
                    ? 'bg-white text-[#263B35] shadow-xs'
                    : 'text-[#64748B] hover:text-[#263B35]'
                }`}
              >
                Creadores
              </button>
              <button
                onClick={() => setActivityFilter('videos')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  activityFilter === 'videos'
                    ? 'bg-white text-[#263B35] shadow-xs'
                    : 'text-[#64748B] hover:text-[#263B35]'
                }`}
              >
                Videos
              </button>
            </div>

            <button
              onClick={() => onNavigateSection('audit')}
              className="text-xs text-[#E85B49] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer pl-1"
            >
              <span>Ver historial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#E9E7E1]">
          {filteredActivity.length > 0 ? (
            filteredActivity.map((log) => {
              const moduleBadge =
                log.module === 'places'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : log.module === 'creators'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-blue-50 text-blue-900 border-blue-200';

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
                  className="p-3.5 sm:p-4 hover:bg-[#F7F2E8]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${moduleBadge}`}
                        >
                          {moduleLabel}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${actionBadge}`}
                        >
                          {log.action}
                        </span>
                        <span className="font-semibold text-[#263B35] truncate">
                          {log.entityName}
                        </span>
                      </div>

                      <p className="text-[#64748B] text-xs leading-relaxed">
                        {log.changeSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 text-[#64748B] text-[11px]">
                    <span>
                      Por: <strong className="text-[#263B35] font-semibold">{log.adminName}</strong>
                    </span>
                    <span className="font-mono text-[#64748B]" title={log.createdAt}>
                      {formatTimeAgo(log.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No hay actividades registradas para el filtro seleccionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
