import React, { useState, useEffect } from 'react';
import { X, History, User, Clock, RefreshCw, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { CreatorAuditEntry } from '../../types/adminCatalog.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CreatorHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorHandle: string;
  creatorName?: string;
}

const actionBadgeStyle = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'VISIBILITY_CHANGE':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const actionLabels: Record<string, string> = {
  CREATE: 'REGISTRO DE PERFIL',
  UPDATE: 'EDICIÓN DE PERFIL',
  VISIBILITY_CHANGE: 'CAMBIO DE VISIBILIDAD',
};

export const CreatorHistoryModal: React.FC<CreatorHistoryModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorHandle,
  creatorName,
}) => {
  const { token } = useAuth();
  const [history, setHistory] = useState<CreatorAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !creatorId) return;
    setIsLoading(true);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`/api/admin/creators/${encodeURIComponent(creatorId)}/history`, {
      headers,
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setHistory(json.data);
        }
      })
      .catch((err) => {
        console.error('[CreatorHistoryModal Error]', err);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, creatorId, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E85B49]/15 text-[#E85B49] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Historial de Trazabilidad del Creador
              </h3>
              <p className="text-xs text-slate-500">
                @{creatorHandle.replace(/^@+/, '')} {creatorName ? `• ${creatorName}` : ''} •{' '}
                <span className="font-mono text-[10px]">{creatorId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#E85B49]" />
              <span>Cargando eventos de auditoría del creador...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No se han registrado modificaciones administrativas para este creador aún.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((log) => {
                const prevPublic = log.previousData?.isPublic;
                const newPublic = log.newData?.isPublic;
                const hasVisibilityTransition =
                  typeof prevPublic === 'boolean' && typeof newPublic === 'boolean';

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${actionBadgeStyle(
                            log.action
                          )}`}
                        >
                          {actionLabels[log.action] || log.action}
                        </span>

                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(log.createdAt).toLocaleString('es-PE')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium shrink-0">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{log.adminName}</span>
                      </div>
                    </div>

                    {/* Change Summary */}
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {log.changeSummary}
                    </p>

                    {/* Visibility Transition (if applicable) */}
                    {hasVisibilityTransition && (
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="text-slate-500">Visibilidad:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                            prevPublic
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {prevPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{prevPublic ? 'PÚBLICO' : 'OCULTO'}</span>
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                            newPublic
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {newPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{newPublic ? 'PÚBLICO' : 'OCULTO'}</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            {history.length} {history.length === 1 ? 'registro' : 'registros'} de auditoría
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
