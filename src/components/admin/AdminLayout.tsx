import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { AdminSidebar, AdminSection } from './AdminSidebar.tsx';
import { AdminHeader } from './AdminHeader.tsx';
import { DashboardView } from './DashboardView.tsx';
import { PlacesListView } from './PlacesListView.tsx';
import { CategoriesView } from './CategoriesView.tsx';
import { LocalitiesView } from './LocalitiesView.tsx';
import { SourcesView } from './SourcesView.tsx';
import { DuplicatesView } from './DuplicatesView.tsx';
import { AuditView } from './AuditView.tsx';
import { AdminCreatorModerationView } from './AdminCreatorModerationView.tsx';
import { PlaceEditorModal } from './PlaceEditorModal.tsx';
import { PlaceHistoryModal } from './PlaceHistoryModal.tsx';
import { AdminPlaceRecord } from '../../types/adminCatalog.ts';

interface AdminLayoutProps {
  onGoToPublicApp: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onGoToPublicApp }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  // Place editing state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AdminPlaceRecord | null>(null);

  const [placesRefreshKey, setPlacesRefreshKey] = useState(0);
  const [placeNotification, setPlaceNotification] = useState<string | null>(null);

  const handlePlaceSaved = (place: AdminPlaceRecord, message?: string) => {
    setPlacesRefreshKey((current) => current + 1);
    setPlaceNotification(message || `Lugar "${place.name}" guardado correctamente.`);
  };

  // Place history audit modal state
  const [historyPlace, setHistoryPlace] = useState<{ id: string; name: string } | null>(null);

  const handleOpenCreateModal = () => {
    setPlaceNotification(null);
    setEditingPlace(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (place: AdminPlaceRecord) => {
    setEditingPlace(place);
    setIsEditorOpen(true);
  };

  const handleViewPlaceHistory = (placeId: string, placeName: string) => {
    setHistoryPlace({ id: placeId, name: placeName });
  };

  const handleFilterByCategory = (category: string) => {
    setActiveSection('places');
  };

  const handleFilterByLocality = (localityId: string) => {
    setActiveSection('places');
  };

  return (
    <div className="h-dvh flex overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onGoToPublicApp={onGoToPublicApp}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          activeSection={activeSection}
          onGoToPublicApp={onGoToPublicApp}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {placeNotification && (activeSection === 'places' || activeSection === 'dashboard') && (
            <div className="px-6 lg:px-8 pt-6 max-w-7xl mx-auto">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{placeNotification}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlaceNotification(null)}
                  aria-label="Cerrar notificación"
                  className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 'dashboard' && (
            <DashboardView
              onNavigateSection={setActiveSection}
              onOpenCreatePlaceModal={handleOpenCreateModal}
              refreshKey={placesRefreshKey}
            />
          )}

          {activeSection === 'places' && (
            <PlacesListView
              onEditPlace={handleOpenEditModal}
              onCreatePlace={handleOpenCreateModal}
              onViewPlaceHistory={handleViewPlaceHistory}
              refreshKey={placesRefreshKey}
            />
          )}

          {activeSection === 'categories' && (
            <CategoriesView onFilterByCategory={handleFilterByCategory} />
          )}

          {activeSection === 'localities' && (
            <LocalitiesView onFilterByLocality={handleFilterByLocality} />
          )}

          {activeSection === 'sources' && <SourcesView />}

          {activeSection === 'duplicates' && <DuplicatesView />}

          {activeSection === 'audit' && <AuditView />}

          {activeSection === 'creators' && <AdminCreatorModerationView />}
        </main>
      </div>

      {/* Place Editor Dialog */}
      <PlaceEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onPlaceSaved={handlePlaceSaved}
        initialPlace={editingPlace}
      />

      {/* Place History Audit Dialog */}
      {historyPlace && (
        <PlaceHistoryModal
          isOpen={Boolean(historyPlace)}
          onClose={() => setHistoryPlace(null)}
          placeId={historyPlace.id}
          placeName={historyPlace.name}
        />
      )}
    </div>
  );
};
