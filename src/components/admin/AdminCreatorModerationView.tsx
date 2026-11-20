import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Video, Check, X, RefreshCw, ExternalLink, Shield, Plus, Search, Edit2, History,
  User, CheckCircle2, MapPin, Users, EyeOff, AlertTriangle, PlaySquare, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { VideoSubmission, ModerationStatus, CreatorProfile, VideoPlace } from '../../types/creators.ts';
import { Place } from '../../types/catalog.ts';
import { VideoEditorModal } from './VideoEditorModal.tsx';
import { CreatorEditorModal } from './CreatorEditorModal.tsx';
import { VideoHistoryModal } from './VideoHistoryModal.tsx';
import { CreatorHistoryModal } from './CreatorHistoryModal.tsx';
import { resolveCreatorLabel } from '../../utils/videoAdapter.ts';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

interface EnrichedVideoSubmission extends VideoSubmission {
  places?: Place[];
}

export const AdminCreatorModerationView: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'videos' | 'creators'>('videos');
  const [videos, setVideos] = useState<EnrichedVideoSubmission[]>([]);
  const [allVideos, setAllVideos] = useState<EnrichedVideoSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [creatorSearchQuery, setCreatorSearchQuery] = useState('');
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoSubmission | undefined>(undefined);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<CreatorProfile | undefined>(undefined);
  const [historyVideo, setHistoryVideo] = useState<{ id: string; title: string } | null>(null);
  const [historyCreator, setHistoryCreator] = useState<{ id: string; handle: string; name?: string } | null>(null);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; videoId: string; action: 'OBSERVE' | 'REJECT' | 'HIDE'; title: string; reason: string; internalNotes: string }>({ isOpen: false, videoId: '', action: 'OBSERVE', title: '', reason: '', internalNotes: '' });
  const [visibilityDialog, setVisibilityDialog] = useState<{ isOpen: boolean; creatorId: string; creatorHandle: string; targetStatus: boolean }>({ isOpen: false, creatorId: '', creatorHandle: '', targetStatus: true });
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [approveDialog, setApproveDialog] = useState<{ isOpen: boolean; videoId: string; videoTitle: string }>({ isOpen: false, videoId: '', videoTitle: '' });

  const handleToggleCreatorVisibility = async () => {
    setIsTogglingVisibility(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/admin/creators/${visibilityDialog.creatorId}`, {
        method: 'PUT', credentials: 'include',
        headers,
        body: JSON.stringify({ isPublic: visibilityDialog.targetStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Error al actualizar visibilidad del creador');
      setCreators((prev) => prev.map((c) => c.id === visibilityDialog.creatorId ? { ...c, isPublic: visibilityDialog.targetStatus } : c));
      setVisibilityDialog({ isOpen: false, creatorId: '', creatorHandle: '', targetStatus: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar visibilidad');
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const fetchAllVideos = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/moderation/queue?status=ALL', { headers, credentials: 'include' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setAllVideos(json.data);
    } catch (err) {
      console.error('[Admin] Error fetching global video queue:', err);
    }
  }, [token]);

  const fetchVideos = useCallback(async () => {
    setIsLoadingVideos(true);
    try {
      const url = statusFilter === 'ALL'
        ? '/api/admin/moderation/queue?status=ALL'
        : `/api/admin/moderation/queue?status=${statusFilter}`;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(url, { headers, credentials: 'include' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setVideos(json.data);
      await fetchAllVideos();
    } catch (err) {
      console.error('[Admin] Error fetching videos:', err);
    } finally {
      setIsLoadingVideos(false);
    }
  }, [statusFilter, token, fetchAllVideos]);

  const fetchCreators = useCallback(async () => {
    setIsLoadingCreators(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/creators', { headers, credentials: 'include' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setCreators(json.data);
    } catch (err) {
      console.error('[Admin] Error fetching creators:', err);
    } finally {
      setIsLoadingCreators(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'videos') fetchVideos();
    else fetchCreators();
  }, [activeTab, fetchVideos, fetchCreators]);

  const pendingVideosCount = useMemo(() => allVideos.filter((v) => v.status === 'PENDING').length, [allVideos]);

  const handleModerateAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'OBSERVE' | 'HIDE', reason?: string, internalNotes?: string) => {
    setProcessingId(id);
    const actionToStatus: Record<'APPROVE' | 'REJECT' | 'OBSERVE' | 'HIDE', ModerationStatus> = { APPROVE: 'APPROVED', REJECT: 'REJECTED', OBSERVE: 'OBSERVED', HIDE: 'HIDDEN' };
    const targetStatus = actionToStatus[action];
    setVideos((prev) => prev.map((v) => v.id === id ? { ...v, status: targetStatus, moderationNotes: reason || v.moderationNotes } : v));
    setAllVideos((prev) => prev.map((v) => v.id === id ? { ...v, status: targetStatus, moderationNotes: reason || v.moderationNotes } : v));
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/admin/moderation/${id}/action`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ action, reason: reason || (action === 'APPROVE' ? 'Aprobado por el equipo editorial' : 'Moderado por administración'), internalNotes }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setVideos((prev) => prev.map((v) => v.id === id ? { ...v, ...json.data } : v));
        setAllVideos((prev) => prev.map((v) => v.id === id ? { ...v, ...json.data } : v));
      } else await fetchVideos();
    } catch (err) {
      console.error('[Admin Moderation Error]:', err);
      await fetchVideos();
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenActionModal = (videoId: string, action: 'OBSERVE' | 'REJECT' | 'HIDE') => {
    const titles = { OBSERVE: 'Observar Video (Solicitar Corrección)', REJECT: 'Rechazar Video', HIDE: 'Ocultar Video del Catálogo Público' };
    setActionModal({ isOpen: true, videoId, action, title: titles[action], reason: '', internalNotes: '' });
  };

  const handleSubmitActionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.reason.trim()) return;
    await handleModerateAction(actionModal.videoId, actionModal.action, actionModal.reason.trim(), actionModal.internalNotes.trim() || undefined);
    setActionModal((prev) => ({ ...prev, isOpen: false, reason: '', internalNotes: '' }));
  };

  const filteredVideos = useMemo(() => {
    const q = videoSearchQuery.toLowerCase().trim();
    return videos.filter((v) => {
      const matchesSearch = !q ||
        v.title.toLowerCase().includes(q) ||
        (v.description?.toLowerCase().includes(q) ?? false) ||
        (v.creatorHandle?.toLowerCase().includes(q) ?? false) ||
        (v.creatorDisplayName?.toLowerCase().includes(q) ?? false) ||
        (v.externalCreatorHandle?.toLowerCase().includes(q) ?? false) ||
        (v.externalCreatorDisplayName?.toLowerCase().includes(q) ?? false) ||
        v.category.toLowerCase().includes(q) ||
        (v.localityId?.toLowerCase().includes(q) ?? false) ||
        (v.places?.some((place) => place.name.toLowerCase().includes(q) || place.localityName.toLowerCase().includes(q) || place.category.toLowerCase().includes(q)) ?? false);
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchesPlatform = platformFilter === 'ALL' || v.platform.toLowerCase() === platformFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [videos, videoSearchQuery, statusFilter, platformFilter]);

  const filteredCreators = useMemo(() => {
    const q = creatorSearchQuery.toLowerCase().trim();
    if (!q) return creators;
    return creators.filter((c) => c.handle.toLowerCase().includes(q) || c.displayName.toLowerCase().includes(q) || (c.bio?.toLowerCase().includes(q) ?? false));
  }, [creators, creatorSearchQuery]);

  const statusBadge = (status: ModerationStatus) => {
    switch (status) {
      case 'APPROVED': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><Check className="w-3 h-3" /> APROBADO</span>;
      case 'PENDING': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> PENDIENTE</span>;
      case 'OBSERVED': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">OBSERVADO</span>;
      case 'REJECTED': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"><X className="w-3 h-3" /> RECHAZADO</span>;
      case 'HIDDEN': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1"><EyeOff className="w-3 h-3" /> OCULTO</span>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><PlaySquare className="w-5 h-5 text-[#E85B49]" />Gestión de Videos y Creadores</h2>
          <p className="text-xs text-slate-500 mt-0.5">Registro, moderación editorial de videos sociales y directorio de creadores turísticos</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button onClick={() => setActiveTab('videos')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'videos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}><Video className="w-3.5 h-3.5 text-[#E85B49]" /><span>Videos ({allVideos.length})</span>{pendingVideosCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white font-mono animate-pulse">{pendingVideosCount} pend.</span>}</button>
          <button onClick={() => setActiveTab('creators')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'creators' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}><Users className="w-3.5 h-3.5 text-[#E85B49]" /><span>Creadores ({creators.length})</span></button>
        </div>
      </div>

      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5">
              <div className="relative w-full sm:w-64"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Buscar por título, creador o lugar..." value={videoSearchQuery} onChange={(e) => setVideoSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] focus:bg-white" /></div>
              <div className="flex items-center gap-2 w-full sm:w-auto"><span className="text-xs text-slate-500 whitespace-nowrap">Estado:</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] font-medium"><option value="ALL">Todos los estados</option><option value="PENDING">Pendientes de Revisión ({pendingVideosCount})</option><option value="APPROVED">Aprobados</option><option value="OBSERVED">Observados</option><option value="REJECTED">Rechazados</option><option value="HIDDEN">Ocultos</option></select></div>
              <div className="flex items-center gap-2 w-full sm:w-auto"><span className="text-xs text-slate-500 whitespace-nowrap">Plataforma:</span><select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] font-medium"><option value="ALL">Todas</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option></select></div>
              <button onClick={fetchVideos} title="Actualizar listado" className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs cursor-pointer shrink-0"><RefreshCw className={`w-3.5 h-3.5 ${isLoadingVideos ? 'animate-spin' : ''}`} /></button>
            </div>
            <button onClick={() => { setEditingVideo(undefined); setIsVideoModalOpen(true); }} className="px-4 py-2 bg-[#E85B49] hover:bg-[#d64f3e] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"><Plus className="w-4 h-4" /><span>Registrar Video</span></button>
          </div>

          {isLoadingVideos ? (
            <div className="p-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin text-[#E85B49]" /><span>Consultando catálogo de videos...</span></div>
          ) : filteredVideos.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center space-y-3"><Video className="w-10 h-10 text-slate-300 mx-auto" /><div className="text-sm font-semibold text-slate-700">No se encontraron videos</div><p className="text-xs text-slate-400 max-w-sm mx-auto">No hay videos que coincidan con los filtros aplicados.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((sub) => {
                const isProcessing = processingId === sub.id;
                return (
                  <div key={sub.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div>
                      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden group">
                        {sub.thumbnailUrl ? <img src={sub.thumbnailUrl} alt={sub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <Video className="w-10 h-10 text-slate-600" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5"><span className="px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] uppercase font-bold tracking-wider">{sub.platform}</span><span className="px-2 py-0.5 rounded bg-black/60 text-slate-200 font-mono text-[10px] uppercase">{sub.contentType}</span></div>
                        <div className="absolute top-2 right-2">{statusBadge(sub.status)}</div>
                        <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 hover:bg-black text-white text-[10px] rounded flex items-center gap-1 font-medium transition-colors"><span>Ver enlace original</span><ExternalLink className="w-3 h-3" /></a>
                      </div>
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-100"><div className="flex items-center gap-1.5 min-w-0"><User className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span className="font-semibold text-slate-800 truncate" title={resolveCreatorLabel(sub)}>{resolveCreatorLabel(sub)}</span></div><span className="text-[10px] font-mono text-slate-400 capitalize">{sub.localityId || 'La Libertad'}</span></div>
                        <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">{sub.title}</h3>
                        {sub.description && <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{sub.description}</p>}
                        <div className="pt-1"><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-[#E85B49]" /> Lugares Vinculados:</div>{sub.places && sub.places.length > 0 ? <div className="flex flex-wrap gap-1">{sub.places.map((place) => { const isPrimary = sub.places?.findIndex((p) => p.id === place.id) === 0; return <span key={place.id} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${isPrimary ? 'bg-[#E85B49]/10 text-[#E85B49] border-[#E85B49]/30 font-semibold' : 'bg-slate-100 text-slate-600 border-slate-200'}`} title={`${place.name} (${place.localityName})`}><span className="truncate max-w-[150px]">{place.name}</span></span>; })}</div> : <span className="text-[11px] text-slate-400 italic">Sin lugares asociados</span>}</div>
                        {sub.moderationNotes && <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800"><span className="font-bold">Observación:</span> {sub.moderationNotes}</div>}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5">
                        {sub.status !== 'APPROVED' && <button onClick={() => setApproveDialog({ isOpen: true, videoId: sub.id, videoTitle: sub.title })} disabled={isProcessing} className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"><Check className="w-3.5 h-3.5" /><span>Aprobar</span></button>}
                        {sub.status !== 'OBSERVED' && <button onClick={() => handleOpenActionModal(sub.id, 'OBSERVE')} disabled={isProcessing} className="flex-1 py-1 px-2 bg-white border border-yellow-300 text-yellow-800 hover:bg-yellow-50 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"><AlertTriangle className="w-3.5 h-3.5 text-yellow-600" /><span>Observar</span></button>}
                        {sub.status !== 'REJECTED' && <button onClick={() => handleOpenActionModal(sub.id, 'REJECT')} disabled={isProcessing} className="flex-1 py-1 px-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" /><span>Rechazar</span></button>}
                        {sub.status === 'APPROVED' && <button onClick={() => handleOpenActionModal(sub.id, 'HIDE')} disabled={isProcessing} className="flex-1 py-1 px-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"><EyeOff className="w-3.5 h-3.5" /><span>Ocultar</span></button>}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]"><button onClick={() => { setEditingVideo(sub); setIsVideoModalOpen(true); }} className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"><Edit2 className="w-3 h-3 text-slate-400" /><span>Editar Metadatos / Lugares</span></button><button onClick={() => setHistoryVideo({ id: sub.id, title: sub.title })} className="text-slate-600 hover:text-[#E85B49] font-medium flex items-center gap-1 cursor-pointer"><History className="w-3 h-3" /><span>Historial</span></button></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'creators' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Buscar por handle, nombre o bio..." value={creatorSearchQuery} onChange={(e) => setCreatorSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E85B49] focus:bg-white" /></div>
            <div className="flex items-center gap-2"><button onClick={fetchCreators} title="Actualizar creadores" className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs cursor-pointer"><RefreshCw className={`w-3.5 h-3.5 ${isLoadingCreators ? 'animate-spin' : ''}`} /></button><button onClick={() => { setEditingCreator(undefined); setIsCreatorModalOpen(true); }} className="px-4 py-2 bg-[#E85B49] hover:bg-[#d64f3e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"><Plus className="w-4 h-4" /><span>Registrar Creador</span></button></div>
          </div>
          {isLoadingCreators ? <div className="p-16 text-center text-xs text-slate-500">Cargando directorio...</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{filteredCreators.map((creator) => <div key={creator.id} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-start justify-between"><div><h4 className="text-sm font-bold text-slate-900">{creator.displayName}</h4><p className="text-xs text-slate-500">@{creator.handle}</p></div><button onClick={() => setVisibilityDialog({ isOpen: true, creatorId: creator.id, creatorHandle: creator.handle, targetStatus: !creator.isPublic })} className="text-xs font-semibold text-[#E85B49]">{creator.isPublic ? 'Ocultar' : 'Publicar'}</button></div><div className="mt-4 flex justify-end gap-2"><button onClick={() => setHistoryCreator({ id: creator.id, handle: creator.handle, name: creator.displayName })} className="text-xs text-slate-600">Historial</button><button onClick={() => { setEditingCreator(creator); setIsCreatorModalOpen(true); }} className="text-xs text-slate-600">Editar</button></div></div>)}</div>}
        </div>
      )}

      <VideoEditorModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} initialVideo={editingVideo} creators={creators} onVideoSaved={() => { fetchVideos(); fetchAllVideos(); }} />
      <CreatorEditorModal isOpen={isCreatorModalOpen} onClose={() => setIsCreatorModalOpen(false)} initialCreator={editingCreator} onCreatorSaved={() => fetchCreators()} />
      {historyVideo && <VideoHistoryModal isOpen={!!historyVideo} onClose={() => setHistoryVideo(null)} videoId={historyVideo.id} videoTitle={historyVideo.title} />}
      {historyCreator && <CreatorHistoryModal isOpen={!!historyCreator} onClose={() => setHistoryCreator(null)} creatorId={historyCreator.id} creatorHandle={historyCreator.handle} creatorName={historyCreator.name} />}

      {actionModal.isOpen && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md"><div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50"><h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Shield className="w-4 h-4 text-[#E85B49]" />{actionModal.title}</h3><button onClick={() => setActionModal((prev) => ({ ...prev, isOpen: false }))} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button></div><form onSubmit={handleSubmitActionModal} className="p-5 space-y-4"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Motivo / Observación *</label><textarea required rows={3} value={actionModal.reason} onChange={(e) => setActionModal((prev) => ({ ...prev, reason: e.target.value }))} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg" /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Nota interna</label><input type="text" value={actionModal.internalNotes} onChange={(e) => setActionModal((prev) => ({ ...prev, internalNotes: e.target.value }))} className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" /></div><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setActionModal((prev) => ({ ...prev, isOpen: false }))} className="px-3 py-1.5 border rounded-lg text-xs">Cancelar</button><button type="submit" className="px-4 py-1.5 bg-[#E85B49] text-white rounded-lg text-xs font-semibold">Confirmar Acción</button></div></form></div></div>}

      <ConfirmDialog isOpen={visibilityDialog.isOpen} title={visibilityDialog.targetStatus ? 'Publicar Creador' : 'Ocultar Creador'} message={`¿Cambiar la visibilidad de @${visibilityDialog.creatorHandle}?`} confirmText={visibilityDialog.targetStatus ? 'Sí, Publicar' : 'Sí, Ocultar'} cancelText="Cancelar" variant={visibilityDialog.targetStatus ? 'primary' : 'warning'} isProcessing={isTogglingVisibility} onConfirm={handleToggleCreatorVisibility} onClose={() => setVisibilityDialog({ isOpen: false, creatorId: '', creatorHandle: '', targetStatus: true })} />
      <ConfirmDialog isOpen={approveDialog.isOpen} title="Aprobar Publicación de Video" message={`¿Aprobar el video "${approveDialog.videoTitle}" para publicación pública?`} confirmText="Sí, Aprobar Video" cancelText="Cancelar" variant="primary" isProcessing={processingId === approveDialog.videoId} onConfirm={async () => { await handleModerateAction(approveDialog.videoId, 'APPROVE'); setApproveDialog({ isOpen: false, videoId: '', videoTitle: '' }); }} onClose={() => setApproveDialog({ isOpen: false, videoId: '', videoTitle: '' })} />
    </div>
  );
};
