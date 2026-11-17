import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  History,
  Search,
  RefreshCw,
  FileText,
  User,
  Calendar,
  X,
  Eye,
  MapPin,
  Video,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  Activity,
  Copy,
  Check,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { UnifiedAuditEntry, AuditModule } from '../../types/adminCatalog.ts';
import { useAuth } from '../../context/AuthContext.tsx';

// Helper for module-specific styling & labels matching RiyMo official palette
const MODULE_CONFIG: Record<
  AuditModule,
  { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string; border: string; ring: string }
> = {
  places: {
    label: 'Lugares',
    icon: MapPin,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500/10',
  },
  creators: {
    label: 'Creadores',
    icon: Users,
    bg: 'bg-rose-50',
    text: 'text-[#E85B49]',
    border: 'border-rose-200',
    ring: 'ring-[#E85B49]/10',
  },
  videos: {
    label: 'Videos',
    icon: Video,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    ring: 'ring-blue-500/10',
  },
};

// Helper for action badges
const getActionBadgeClass = (action: string) => {
  const act = action.toUpperCase();
  if (['CREATE', 'APPROVE'].includes(act)) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  if (['UPDATE', 'EDIT'].includes(act)) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (['STATUS_CHANGE', 'OBSERVE', 'VISIBILITY_CHANGE'].includes(act)) {
    return 'bg-amber-100 text-amber-800 border-amber-200';
  }
  if (['REJECT', 'ARCHIVE', 'HIDE'].includes(act)) {
    return 'bg-rose-100 text-rose-800 border-rose-200';
  }
  if (['MERGE'].includes(act)) {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  if (['VERIFY'].includes(act)) {
    return 'bg-teal-100 text-teal-800 border-teal-200';
  }
  return 'bg-slate-100 text-slate-800 border-slate-200';
};

export const AuditView: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<UnifiedAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModule, setActiveModule] = useState<'ALL' | AuditModule>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    all: 0,
    places: 0,
    creators: 0,
    videos: 0,
  });

  // Modal inspection state
  const [selectedLog, setSelectedLog] = useState<UnifiedAuditEntry | null>(null);

  // Debounce search input by 300ms so typing is smooth and prevents full screen reloads
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [activeModule, actionFilter, debouncedSearch, startDate, endDate]);

  const fetchAuditLogs = useCallback(
    async (targetPage: number) => {
      // If we already have logs, mark isRefreshing instead of wiping the screen
      if (logs.length > 0) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams();
        if (activeModule !== 'ALL') params.set('module', activeModule);
        if (actionFilter !== 'ALL') params.set('action', actionFilter);
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (startDate.trim()) params.set('startDate', startDate.trim());
        if (endDate.trim()) params.set('endDate', endDate.trim());
        params.set('page', targetPage.toString());
        params.set('limit', '50');

        const res = await fetch(`/api/admin/audit?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLogs(json.data);
          setTotal(json.total ?? json.data.length);
          setTotalPages(json.totalPages ?? 1);
          if (json.counts) {
            setCounts(json.counts);
          }
        }
      } catch (err) {
        console.error('[AuditView Error] Error fetching audit trail:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, activeModule, actionFilter, debouncedSearch, startDate, endDate, logs.length]
  );

  // Fetch when page or any filter changes
  useEffect(() => {
    fetchAuditLogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeModule, actionFilter, debouncedSearch, startDate, endDate]);

  // Handle escape key to close detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLog) {
        setSelectedLog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLog]);

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleModuleSelect = (mod: 'ALL' | AuditModule) => {
    setActiveModule(mod);
    setActionFilter('ALL');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Activity Overview stats calculated from loaded logs
  const overviewStats = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    let recent24hCount = 0;
    const adminEventCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};

    logs.forEach((log) => {
      const time = new Date(log.createdAt).getTime();
      if (time >= oneDayAgo) {
        recent24hCount++;
      }
      const admin = log.adminName || 'Administrador';
      adminEventCounts[admin] = (adminEventCounts[admin] || 0) + 1;
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    const topAdmins = Object.entries(adminEventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      recent24hCount,
      topAdmins,
      actionCounts,
    };
  }, [logs]);

  // Get relevant actions for current module
  const getActionOptions = () => {
    if (activeModule === 'places') {
      return [
        { value: 'CREATE', label: 'CREATE (Creación de lugares)' },
        { value: 'UPDATE', label: 'UPDATE (Edición de ficha)' },
        { value: 'STATUS_CHANGE', label: 'STATUS_CHANGE (Cambio de estado)' },
        { value: 'VERIFY', label: 'VERIFY (Verificación MINCETUR)' },
        { value: 'MERGE', label: 'MERGE (Fusión de duplicados)' },
        { value: 'ARCHIVE', label: 'ARCHIVE (Archivo)' },
      ];
    }
    if (activeModule === 'creators') {
      return [
        { value: 'CREATE', label: 'CREATE (Registro de creador)' },
        { value: 'UPDATE', label: 'UPDATE (Edición de perfil)' },
        { value: 'VISIBILITY_CHANGE', label: 'VISIBILITY_CHANGE (Visibilidad público/oculto)' },
      ];
    }
    if (activeModule === 'videos') {
      return [
        { value: 'CREATE', label: 'CREATE (Registro inicial de video)' },
        { value: 'UPDATE', label: 'UPDATE (Edición de metadatos)' },
        { value: 'APPROVE', label: 'APPROVE (Aprobación)' },
        { value: 'OBSERVE', label: 'OBSERVE (Observación)' },
        { value: 'REJECT', label: 'REJECT (Rechazo)' },
        { value: 'HIDE', label: 'HIDE (Ocultamiento)' },
      ];
    }
    return [
      { value: 'CREATE', label: 'CREATE (Creación/Registro)' },
      { value: 'UPDATE', label: 'UPDATE (Edición)' },
      { value: 'APPROVE', label: 'APPROVE (Aprobación)' },
      { value: 'OBSERVE', label: 'OBSERVE (Observación)' },
      { value: 'REJECT', label: 'REJECT (Rechazo)' },
      { value: 'STATUS_CHANGE', label: 'STATUS_CHANGE (Cambio estado)' },
      { value: 'VISIBILITY_CHANGE', label: 'VISIBILITY_CHANGE (Visibilidad creador)' },
      { value: 'VERIFY', label: 'VERIFY (Verificación)' },
      { value: 'MERGE', label: 'MERGE (Fusión duplicados)' },
      { value: 'ARCHIVE', label: 'ARCHIVE (Archivo)' },
    ];
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header section with status badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Auditoría Administrativa Unificada
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Trazabilidad Inmutable</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro consolidado de operaciones en Lugares Turísticos, Perfiles de Creadores y Moderación de Videos.
          </p>
        </div>

        <button
          onClick={() => fetchAuditLogs(page)}
          disabled={isLoading || isRefreshing}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-colors disabled:opacity-50 shadow-2xs"
          title="Recargar datos de auditoría"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* 2. Top Metric Cards (Fast Module Switchers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <button
          onClick={() => handleModuleSelect('ALL')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeModule === 'ALL'
              ? 'bg-white border-[#263B35] shadow-sm ring-2 ring-[#263B35]/15'
              : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Registros
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{counts.all}</span>
            <span className="text-[11px] text-slate-500">eventos</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Todos los módulos activos</span>
          </div>
        </button>

        {/* Places Module */}
        <button
          onClick={() => handleModuleSelect('places')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeModule === 'places'
              ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/15'
              : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Lugares Turísticos
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{counts.places}</span>
            <span className="text-[11px] text-slate-500">eventos</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Alta, edición, estados, verificación</span>
          </div>
        </button>

        {/* Creators Module */}
        <button
          onClick={() => handleModuleSelect('creators')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeModule === 'creators'
              ? 'bg-white border-[#E85B49] shadow-sm ring-2 ring-[#E85B49]/15'
              : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#E85B49] uppercase tracking-wider">
              Creadores
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-[#E85B49]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{counts.creators}</span>
            <span className="text-[11px] text-slate-500">eventos</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Perfiles y cambios de visibilidad</span>
          </div>
        </button>

        {/* Videos Module */}
        <button
          onClick={() => handleModuleSelect('videos')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeModule === 'videos'
              ? 'bg-white border-blue-600 shadow-sm ring-2 ring-blue-500/15'
              : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Videos & Moderación
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{counts.videos}</span>
            <span className="text-[11px] text-slate-500">eventos</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Aprobación, observación, rechazo</span>
          </div>
        </button>
      </div>

      {/* 3. Activity Overview Banner (Vista General de Actividad) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#17243A] rounded-xl p-4 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10 border border-white/15 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Vista General de Actividad
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En vivo</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {overviewStats.recent24hCount} eventos en las últimas 24 horas &bull; Trazabilidad respaldada en tiempo real.
              </p>
            </div>
          </div>

          {/* Quick Admin Filters: Click to filter by admin */}
          {overviewStats.topAdmins.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-400 font-medium">Administradores activos:</span>
              {overviewStats.topAdmins.map(([adminName, count]) => (
                <button
                  key={adminName}
                  onClick={() => setSearch(adminName)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    search.toLowerCase() === adminName.toLowerCase()
                      ? 'bg-[#E85B49] text-white border-[#E85B49]'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                  }`}
                  title={`Filtrar por administrador "${adminName}"`}
                >
                  <User className="w-3 h-3 text-slate-300" />
                  <span>{adminName}</span>
                  <span className="px-1 py-0.2 rounded bg-black/30 text-[9px] font-bold">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Module Selector Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto">
        <button
          onClick={() => handleModuleSelect('ALL')}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
            activeModule === 'ALL'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Todos los Módulos</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {counts.all}
          </span>
        </button>
        <button
          onClick={() => handleModuleSelect('places')}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
            activeModule === 'places'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Lugares Turísticos</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800">
            {counts.places}
          </span>
        </button>
        <button
          onClick={() => handleModuleSelect('creators')}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
            activeModule === 'creators'
              ? 'border-[#E85B49] text-[#E85B49]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Creadores</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-50 text-[#E85B49]">
            {counts.creators}
          </span>
        </button>
        <button
          onClick={() => handleModuleSelect('videos')}
          className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
            activeModule === 'videos'
              ? 'border-blue-600 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Videos & Moderación</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-800">
            {counts.videos}
          </span>
        </button>
      </div>

      {/* 5. Filter Toolbar with Search, Action, Date and Presets */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search box with debounced handling */}
          <div className="relative lg:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por entidad, administrador, acción o ID..."
              className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] focus:bg-white transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div className="lg:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] text-slate-700 cursor-pointer"
            >
              <option value="ALL">Todas las Acciones</option>
              {getActionOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div className="lg:col-span-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Fecha inicial"
              className="w-full text-xs px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] text-slate-700"
            />
          </div>

          {/* Date Range End */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Fecha final"
              className="w-full text-xs px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] text-slate-700"
            />
            {(startDate || endDate) && (
              <button
                onClick={handleClearDates}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Limpiar fechas"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Rango rápido:</span>
          </span>
          <button
            type="button"
            onClick={handleClearDates}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              !startDate && !endDate
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todo el historial
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date().toISOString().slice(0, 10);
              setStartDate(today);
              setEndDate(today);
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              startDate && startDate === endDate && startDate === new Date().toISOString().slice(0, 10)
                ? 'bg-[#E85B49] text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const past7 = new Date();
              past7.setDate(today.getDate() - 7);
              setStartDate(past7.toISOString().slice(0, 10));
              setEndDate(today.toISOString().slice(0, 10));
            }}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const past30 = new Date();
              past30.setDate(today.getDate() - 30);
              setStartDate(past30.toISOString().slice(0, 10));
              setEndDate(today.toISOString().slice(0, 10));
            }}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Últimos 30 días
          </button>
        </div>

        {/* Active Filters Pill Bar */}
        {(activeModule !== 'ALL' || actionFilter !== 'ALL' || search || startDate || endDate) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span className="font-medium text-slate-500">Filtros activos:</span>
            {activeModule !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center gap-1">
                <span>Módulo: {MODULE_CONFIG[activeModule].label}</span>
                <button
                  onClick={() => handleModuleSelect('ALL')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {actionFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center gap-1">
                <span>Acción: {actionFilter}</span>
                <button
                  onClick={() => setActionFilter('ALL')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center gap-1">
                <span>Búsqueda: "{search}"</span>
                <button
                  onClick={() => setSearch('')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(startDate || endDate) && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center gap-1">
                <span>
                  Fechas: {startDate || 'Inicio'} → {endDate || 'Hoy'}
                </span>
                <button
                  onClick={handleClearDates}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setActiveModule('ALL');
                setActionFilter('ALL');
                setSearch('');
                handleClearDates();
              }}
              className="text-[#E85B49] hover:underline font-semibold ml-auto cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* 6. Main Table with In-Place Loading (no screen blinking) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden relative">
        {/* Subtle in-place progress bar during background filter refresh */}
        {isRefreshing && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-100 overflow-hidden z-10">
            <div className="h-full bg-[#E85B49] animate-pulse w-full" />
          </div>
        )}

        {isLoading && logs.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#E85B49]" />
            <span>Consultando registro inmutable de auditoría...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-medium text-slate-600">No se encontraron eventos de auditoría</p>
            <p className="text-[11px] text-slate-400">
              Prueba cambiando los filtros de búsqueda, módulo o rango de fechas.
            </p>
          </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity duration-150 ${isRefreshing ? 'opacity-65' : 'opacity-100'}`}>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Entidad Afectada</th>
                  <th className="py-3 px-4">Resumen de la Operación</th>
                  <th className="py-3 px-4">Administrador Responsable</th>
                  <th className="py-3 px-4 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const modConf = MODULE_CONFIG[log.module] || MODULE_CONFIG.places;
                  const ModIcon = modConf.icon;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString('es-PE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      {/* Module Badge (Clickable to switch module) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleModuleSelect(log.module)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${modConf.bg} ${modConf.text} ${modConf.border}`}
                          title={`Filtrar por módulo ${modConf.label}`}
                        >
                          <ModIcon className="w-3 h-3" />
                          <span>{modConf.label}</span>
                        </button>
                      </td>

                      {/* Action Badge (Clickable to filter by action) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActionFilter(log.action)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border cursor-pointer hover:opacity-80 transition-opacity ${getActionBadgeClass(
                            log.action
                          )}`}
                          title={`Filtrar por acción ${log.action}`}
                        >
                          {log.action}
                        </button>
                      </td>

                      {/* Affected Entity */}
                      <td className="py-3 px-4">
                        <div
                          className="font-semibold text-slate-900 truncate max-w-[220px]"
                          title={log.entityName}
                        >
                          {log.entityName}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[170px]" title={log.entityId}>
                            {log.entityId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(log.entityId, log.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title="Copiar ID de la entidad"
                          >
                            {copiedId === log.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-3 px-4 font-medium text-slate-700 max-w-sm">
                        <div className="line-clamp-2" title={log.changeSummary}>
                          {log.changeSummary}
                        </div>
                        {log.previousStatus && log.newStatus && log.previousStatus !== log.newStatus && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                            <span className="font-mono px-1 py-0.2 rounded bg-slate-100">{log.previousStatus}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                            <span className="font-mono px-1 py-0.2 rounded bg-slate-200 font-semibold text-slate-800">
                              {log.newStatus}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Responsible Admin (Clickable to filter by admin) */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <button
                          type="button"
                          onClick={() => setSearch(log.adminName)}
                          className="flex items-center gap-1.5 hover:text-slate-900 text-left cursor-pointer group"
                          title={`Filtrar por ${log.adminName}`}
                        >
                          <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E85B49] transition-colors" />
                          <span className="font-medium text-slate-800 group-hover:underline">
                            {log.adminName}
                          </span>
                        </button>
                        <div className="font-mono text-[10px] text-slate-400">
                          {log.adminUserId ? log.adminUserId.slice(0, 10) : 'system'}
                        </div>
                      </td>

                      {/* Detail Button */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-[11px] font-medium flex items-center gap-1 mx-auto cursor-pointer transition-colors shadow-2xs"
                          title="Inspeccionar detalle completo"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <span>
              Mostrando <span className="font-semibold text-slate-900">{logs.length}</span> de{' '}
              <span className="font-semibold text-slate-900">{total}</span> eventos registrados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading || isRefreshing}
              className="p-1.5 border border-slate-200 bg-white rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-medium text-slate-700 px-2">
              Página {page} de {totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading || isRefreshing}
              className="p-1.5 border border-slate-200 bg-white rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. DETAIL INSPECTION MODAL */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLog(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      (MODULE_CONFIG[selectedLog.module] || MODULE_CONFIG.places).bg
                    } ${(MODULE_CONFIG[selectedLog.module] || MODULE_CONFIG.places).text} ${
                      (MODULE_CONFIG[selectedLog.module] || MODULE_CONFIG.places).border
                    }`}
                  >
                    <span>{(MODULE_CONFIG[selectedLog.module] || MODULE_CONFIG.places).label}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getActionBadgeClass(
                      selectedLog.action
                    )}`}
                  >
                    {selectedLog.action}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {selectedLog.entityName}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                  <span>ID: {selectedLog.entityId}</span>
                  <button
                    onClick={() => copyToClipboard(selectedLog.entityId, 'modal_entity_id')}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Copiar ID"
                  >
                    {copiedId === 'modal_entity_id' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Cerrar modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Event Metadata Cards */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Fecha y Hora
                  </span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {new Date(selectedLog.createdAt).toLocaleString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Administrador Responsable
                  </span>
                  <span className="font-semibold text-slate-800 text-[11px] block">
                    {selectedLog.adminName}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    ID: {selectedLog.adminUserId}
                  </span>
                </div>
              </div>

              {/* Status Transition (if exists) */}
              {selectedLog.previousStatus || selectedLog.newStatus ? (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                    Transición de Estado
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700 shadow-2xs">
                      {selectedLog.previousStatus || 'NINGUNO (null)'}
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                    <div className="px-2.5 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-mono font-bold text-amber-900 shadow-2xs">
                      {selectedLog.newStatus || 'ACTUAL'}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Change Summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Resumen de la Operación
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium leading-relaxed">
                  {selectedLog.changeSummary}
                </div>
              </div>

              {/* Moderation Details (if video module) */}
              {selectedLog.details?.reason || selectedLog.details?.internalNotes || selectedLog.details?.changedFields ? (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Metadatos de Moderación
                  </span>
                  {selectedLog.details.reason && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block">Motivo:</span>
                      <p className="text-slate-800 mt-0.5">{selectedLog.details.reason}</p>
                    </div>
                  )}
                  {selectedLog.details.internalNotes && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block">Notas internas:</span>
                      <p className="text-slate-700 mt-0.5 font-mono text-[11px]">
                        {selectedLog.details.internalNotes}
                      </p>
                    </div>
                  )}
                  {Array.isArray(selectedLog.details.changedFields) &&
                    selectedLog.details.changedFields.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-600 block">
                          Campos modificados:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLog.details.changedFields.map((field: string) => (
                            <span
                              key={field}
                              className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px]"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : null}

              {/* Payload Technical Inspection / Snapshots */}
              {selectedLog.details?.newData || selectedLog.details?.previousData ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Snapshots de Datos Técnicos
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(selectedLog.details, null, 2),
                          'modal_json_payload'
                        )
                      }
                      className="text-[11px] text-[#E85B49] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {copiedId === 'modal_json_payload' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Previous Data */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Datos Anteriores (Snapshot)
                      </span>
                      <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] overflow-x-auto max-h-56 leading-snug">
                        {selectedLog.details.previousData
                          ? JSON.stringify(selectedLog.details.previousData, null, 2)
                          : 'null'}
                      </pre>
                    </div>

                    {/* New Data */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Datos Nuevos (Snapshot)
                      </span>
                      <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] overflow-x-auto max-h-56 leading-snug">
                        {selectedLog.details.newData
                          ? JSON.stringify(selectedLog.details.newData, null, 2)
                          : 'null'}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                <span>Audit ID: {selectedLog.id}</span>
                <button
                  onClick={() => copyToClipboard(selectedLog.id, 'modal_audit_id')}
                  className="hover:text-slate-600 cursor-pointer"
                  title="Copiar Audit ID"
                >
                  {copiedId === 'modal_audit_id' ? (
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
