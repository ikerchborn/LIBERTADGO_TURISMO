/**
 * LibertadGO - Intelligent Travel Planner (La Libertad, Perú)
 * Main Application Component: Coordinated SaaS Workspace inspired by Wanderlog.
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { TripCreationScreen } from './components/TripCreationScreen.tsx';
import { CreateTripModal } from './components/CreateTripModal.tsx';
import { ArchitectureModal } from './components/ArchitectureModal.tsx';
import { DestinationsGallery } from './components/DestinationsGallery.tsx';
import { WorkspaceNavbar } from './components/workspace/WorkspaceNavbar.tsx';
import { WorkspaceSidebar, WorkspaceSection } from './components/workspace/WorkspaceSidebar.tsx';
import { WorkspaceContent } from './components/workspace/WorkspaceContent.tsx';
import { MapPanel } from './components/workspace/MapPanel.tsx';
import { INITIAL_PLACES } from './data/initialPlaces.ts';
import { TripItinerary, Place, TripActivity } from './types/catalog.ts';

const STORAGE_TRIPS_KEY = 'libertadgo_trips_v2';
const STORAGE_ACTIVE_ID_KEY = 'libertadgo_active_trip_id_v2';

export default function App() {
  // Navigation & view states
  const [activeView, setActiveView] = useState<'workspace' | 'destinations'>('workspace');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [modalTargetDestinationId, setModalTargetDestinationId] = useState<string>('trujillo');

  // Wanderlog Workspace State
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('itinerary');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<'content' | 'map'>('content');

  // Places catalog state
  const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Trips persistence state
  const [savedTrips, setSavedTrips] = useState<TripItinerary[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_TRIPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Current active trip
  const [currentTrip, setCurrentTrip] = useState<TripItinerary | null>(() => {
    try {
      const activeId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      const stored = localStorage.getItem(STORAGE_TRIPS_KEY);
      if (activeId && stored) {
        const parsed: TripItinerary[] = JSON.parse(stored);
        const match = parsed.find((t) => t.id === activeId);
        if (match) return match;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Persist trips to localStorage
  useEffect(() => {
    try {
      if (savedTrips.length > 0) {
        localStorage.setItem(STORAGE_TRIPS_KEY, JSON.stringify(savedTrips));
      }
      if (currentTrip) {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, currentTrip.id);
      }
    } catch {
      // ignore
    }
  }, [savedTrips, currentTrip]);

  // Fetch places when destination changes
  useEffect(() => {
    if (!currentTrip) {
      setPlaces(INITIAL_PLACES);
      return;
    }

    fetch(`/api/places?localityId=${currentTrip.destinationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPlaces(data.data);
        } else {
          const localMatching = INITIAL_PLACES.filter(
            (p) => p.localityId === currentTrip.destinationId
          );
          setPlaces(localMatching.length > 0 ? localMatching : INITIAL_PLACES);
        }
      })
      .catch(() => {
        const localMatching = INITIAL_PLACES.filter(
          (p) => p.localityId === currentTrip.destinationId
        );
        setPlaces(localMatching.length > 0 ? localMatching : INITIAL_PLACES);
      });
  }, [currentTrip?.destinationId]);

  // ==========================================
  // TRIP CREATION & SWITCHING HANDLERS
  // ==========================================
  const handleTripCreated = (newTrip: TripItinerary) => {
    setCurrentTrip(newTrip);
    setSavedTrips((prev) => {
      const filtered = prev.filter((t) => t.id !== newTrip.id);
      return [newTrip, ...filtered];
    });
    setActiveView('workspace');
    setActiveSection('itinerary');
    setSelectedPlace(null);
  };

  const handleSelectSavedTrip = (trip: TripItinerary) => {
    setCurrentTrip(trip);
    setActiveView('workspace');
    setActiveSection('itinerary');
    setSelectedPlace(null);
  };

  const handleUpdateTripTitle = (newTitle: string) => {
    if (!currentTrip) return;
    const updated = { ...currentTrip, title: newTitle, updatedAt: new Date().toISOString() };
    setCurrentTrip(updated);
    setSavedTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // ==========================================
  // SYNCHRONIZED TRIP ACTIVITIES HANDLERS
  // ==========================================

  // 1. Add Place to Day
  const handleAddPlaceToDay = (place: Place, dayNumber: number) => {
    if (!currentTrip) return;

    const dayActivities = currentTrip.activities.filter((a) => a.dayNumber === dayNumber);
    const order = dayActivities.length + 1;

    const newActivity: TripActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tripId: currentTrip.id,
      placeId: place.id,
      place,
      dayNumber,
      order,
      isVisited: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTrip: TripItinerary = {
      ...currentTrip,
      activities: [...currentTrip.activities, newActivity],
      updatedAt: new Date().toISOString(),
    };

    setCurrentTrip(updatedTrip);
    setSavedTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    setSelectedPlace(place);
  };

  // 2. Toggle Save Place to Wishlist (savedPlaceIds)
  const handleToggleSavePlace = (placeId: string) => {
    if (!currentTrip) return;

    const existing = new Set(currentTrip.savedPlaceIds || []);
    if (existing.has(placeId)) {
      existing.delete(placeId);
    } else {
      existing.add(placeId);
    }

    const updatedTrip: TripItinerary = {
      ...currentTrip,
      savedPlaceIds: Array.from(existing),
      updatedAt: new Date().toISOString(),
    };

    setCurrentTrip(updatedTrip);
    setSavedTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  // 3. Remove Activity from Trip
  const handleRemoveActivity = (activityId: string) => {
    if (!currentTrip) return;

    const activityToRemove = currentTrip.activities.find((a) => a.id === activityId);
    if (!activityToRemove) return;

    const remainingActivities = currentTrip.activities.filter((a) => a.id !== activityId);

    const reindexedActivities = remainingActivities.map((a) => {
      if (a.dayNumber === activityToRemove.dayNumber && a.order > activityToRemove.order) {
        return { ...a, order: a.order - 1 };
      }
      return a;
    });

    const updatedTrip: TripItinerary = {
      ...currentTrip,
      activities: reindexedActivities,
      updatedAt: new Date().toISOString(),
    };

    setCurrentTrip(updatedTrip);
    setSavedTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  // 4. Move Activity between days
  const handleMoveActivityToDay = (activityId: string, targetDayNumber: number) => {
    if (!currentTrip) return;

    const activity = currentTrip.activities.find((a) => a.id === activityId);
    if (!activity || activity.dayNumber === targetDayNumber) return;

    const targetDayCount = currentTrip.activities.filter((a) => a.dayNumber === targetDayNumber).length;

    const updatedActivities = currentTrip.activities.map((a) => {
      if (a.id === activityId) {
        return { ...a, dayNumber: targetDayNumber, order: targetDayCount + 1 };
      }
      if (a.dayNumber === activity.dayNumber && a.order > activity.order) {
        return { ...a, order: a.order - 1 };
      }
      return a;
    });

    const updatedTrip: TripItinerary = {
      ...currentTrip,
      activities: updatedActivities,
      updatedAt: new Date().toISOString(),
    };

    setCurrentTrip(updatedTrip);
    setSavedTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  // 5. Reorder Activity within Day
  const handleReorderActivity = (activityId: string, direction: 'up' | 'down') => {
    if (!currentTrip) return;

    const activity = currentTrip.activities.find((a) => a.id === activityId);
    if (!activity) return;

    const dayActivities = currentTrip.activities
      .filter((a) => a.dayNumber === activity.dayNumber)
      .sort((a, b) => a.order - b.order);

    const currentIndex = dayActivities.findIndex((a) => a.id === activityId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= dayActivities.length) return;

    const targetActivity = dayActivities[targetIndex];

    const updatedActivities = currentTrip.activities.map((a) => {
      if (a.id === activity.id) return { ...a, order: targetActivity.order };
      if (a.id === targetActivity.id) return { ...a, order: activity.order };
      return a;
    });

    const updatedTrip: TripItinerary = {
      ...currentTrip,
      activities: updatedActivities,
      updatedAt: new Date().toISOString(),
    };

    setCurrentTrip(updatedTrip);
    setSavedTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  // 6. Add Manual Activity
  const handleAddManualActivity = (
    dayNumber: number,
    title: string,
    timeSlot?: string,
    notes?: string
  ) => {
    if (!currentTrip) return;

    const dayActivities = currentTrip.activities.filter((a) => a.dayNumber === dayNumber);

    const newActivity: TripActivity = {
      id: `act_man_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tripId: currentTrip.id,
      placeId: `custom_${Date.now()}`,
      customTitle: title,
      dayNumber,
      order: dayActivities.length + 1,
      timeSlot,
      notes,
      isVisited: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTrip: TripItinerary = {
      ...currentTrip,
      activities: [...currentTrip.activities, newActivity],
      updatedAt: new Date().toISOString(),
    };

    setCurrentTrip(updatedTrip);
    setSavedTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  // 7. Update Notes
  const handleUpdateNotes = (notes: string) => {
    if (!currentTrip) return;
    const updatedTrip: TripItinerary = { ...currentTrip, notes, updatedAt: new Date().toISOString() };
    setCurrentTrip(updatedTrip);
    setSavedTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#17243A] antialiased">
      {/* 
        Single Unified Header Bar:
        - When in workspace with an active trip: WorkspaceNavbar
        - When no trip or in destinations gallery: Header
      */}
      {currentTrip && activeView === 'workspace' ? (
        <WorkspaceNavbar
          trip={currentTrip}
          onEditTrip={() => {
            setModalTargetDestinationId(currentTrip.destinationId);
            setIsCreateModalOpen(true);
          }}
          onNewTrip={() => {
            setModalTargetDestinationId(currentTrip.destinationId);
            setIsCreateModalOpen(true);
          }}
          onUpdateTripTitle={handleUpdateTripTitle}
          onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
          onOpenDestinations={() => setActiveView('destinations')}
          mobileTab={mobileTab}
          setMobileTab={setMobileTab}
        />
      ) : (
        <Header
          currentTrip={currentTrip}
          onOpenCreateModal={() => {
            setModalTargetDestinationId(currentTrip?.destinationId || 'trujillo');
            setIsCreateModalOpen(true);
          }}
          onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'destinations' ? (
          <DestinationsGallery
            onSelectDestinationForTrip={(locId) => {
              setModalTargetDestinationId(locId);
              setIsCreateModalOpen(true);
            }}
          />
        ) : !currentTrip ? (
          /* Flujo Inicial Simplificado de Creación de Viaje */
          <TripCreationScreen
            onTripCreated={handleTripCreated}
            savedTrips={savedTrips}
            onSelectSavedTrip={handleSelectSavedTrip}
          />
        ) : (
          /* Workspace Wanderlog: Sidebar + Contenido Central + Mapa Persistente */
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-56px)] overflow-hidden">
            {/* Contenedor de Planificación (Sidebar + Contenido Central) */}
            <div
              className={`h-full ${
                mobileTab === 'content' ? 'flex flex-1' : 'hidden'
              } lg:flex lg:flex-initial transition-all z-10 shrink-0`}
            >
              {/* Barra lateral de navegación */}
              <WorkspaceSidebar
                trip={currentTrip}
                activeSection={activeSection}
                onSelectSection={setActiveSection}
                selectedDayNumber={selectedDayNumber}
                onSelectDayNumber={setSelectedDayNumber}
              />

              {/* Área central con el contenido de la sección activa */}
              <WorkspaceContent
                trip={currentTrip}
                places={places}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                activeSection={activeSection}
                selectedDayNumber={selectedDayNumber}
                onSelectDayNumber={setSelectedDayNumber}
                onAddPlaceToDay={handleAddPlaceToDay}
                onToggleSavePlace={handleToggleSavePlace}
                onRemoveActivity={handleRemoveActivity}
                onMoveActivityToDay={handleMoveActivityToDay}
                onReorderActivity={handleReorderActivity}
                onAddManualActivity={handleAddManualActivity}
                onUpdateNotes={handleUpdateNotes}
              />
            </div>

            {/* Panel Derecho: Mapa Persistente MapLibre */}
            <div
              className={`h-full ${
                mobileTab === 'map' ? 'flex flex-1' : 'hidden'
              } lg:flex flex-1 relative overflow-hidden`}
            >
              <MapPanel
                trip={currentTrip}
                places={places}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                onAddPlaceToDay={(place, day) => handleAddPlaceToDay(place, day)}
                onRemoveActivity={handleRemoveActivity}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modal de Creación / Edición de Viaje */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTripCreated={handleTripCreated}
        initialDestinationId={modalTargetDestinationId}
      />

      {/* Modal de Arquitectura MVP */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
