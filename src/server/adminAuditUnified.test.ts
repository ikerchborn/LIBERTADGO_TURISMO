import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { adminRouter } from './adminRoutes.ts';
import { getAuthRepository, getCreatorsRepository } from './repositories/index.ts';
import { getPlaceRepository } from './repositories/placeRepository.ts';
import { hashPassword, createToken, authMiddleware } from './authService.ts';

test('Unified Administrative Audit: Multi-module traceability across Places, Creators, and Videos', async () => {
  const authRepo = getAuthRepository();
  const placeRepo = getPlaceRepository();
  const creatorsRepo = getCreatorsRepository();

  // Create admin user
  const admin = await authRepo.createUser({
    email: `superadmin.audit.${Date.now()}@libertadgo.pe`,
    passwordHash: hashPassword('Pass1234!'),
    name: 'Super Auditor',
    role: 'ADMIN',
  });
  const token = createToken(admin);

  // Set up Express test app
  const app = express();
  app.use(express.json());
  app.use(authMiddleware);
  app.use('/api/admin', adminRouter);

  // 1. Create a Place mutation (will log to place_audit_log)
  const place = await placeRepo.createPlace(
    {
      name: 'Complejo Arqueológico El Brujo',
      category: 'arqueologia',
      localityId: 'magdalena_de_cao',
      fullDescription: 'Hogar de la Dama de Cao en el valle Chicama',
      coordinates: { lat: -7.917, lng: -79.303 },
      tags: ['arqueologia', 'moche'],
      shortDescription: 'Cuna de la Dama de Cao',
      address: 'Magdalena de Cao, Ascope',
    },
    admin.id,
    admin.name
  );
  assert.ok(place.id);

  // 2. Create a Creator Profile mutation (will log to creator_audit_logs)
  const handle = `arqueologa_cao_${Date.now()}`;
  const creator = await creatorsRepo.saveCreatorProfile({
    userId: admin.id,
    handle,
    displayName: 'Arqueóloga Cao',
    primaryPlatform: 'instagram',
    isPublic: true,
  });
  await creatorsRepo.addCreatorAuditLog({
    creatorId: creator.id,
    creatorHandle: creator.handle,
    adminUserId: admin.id,
    adminName: admin.name,
    action: 'CREATE',
    previousData: null,
    newData: creator,
    changeSummary: `Creado perfil de creador @${creator.handle} (${creator.displayName}).`,
  });

  // Toggle Creator visibility
  await creatorsRepo.addCreatorAuditLog({
    creatorId: creator.id,
    creatorHandle: creator.handle,
    adminUserId: admin.id,
    adminName: admin.name,
    action: 'VISIBILITY_CHANGE',
    previousData: { isPublic: true },
    newData: { isPublic: false },
    changeSummary: `Cambiado estado de visibilidad a OCULTO para @${creator.handle}.`,
  });

  // 3. Create a Video submission mutation (will log to video_moderation_logs)
  const video = await creatorsRepo.createSubmission(
    {
      userId: admin.id,
      creatorProfileId: creator.id,
      platform: 'instagram',
      externalVideoId: `ig_${Date.now()}`,
      videoUrl: 'https://instagram.com/reel/C123456789/',
      embedUrl: 'https://instagram.com/reel/C123456789/embed',
      thumbnailUrl: null,
      title: 'Misterios de la Señora de Cao',
      description: 'Recorrido nocturno por las huacas',
      contentType: 'PLACE',
      category: 'sitios_arqueologicos',
      localityId: 'magdalena_de_cao',
      status: 'APPROVED',
    },
    [place.id],
    place.id,
    {
      adminUserId: admin.id,
      adminName: admin.name,
      action: 'CREATE',
      previousStatus: null,
      newStatus: 'APPROVED',
      reason: 'Registro y publicación directa autorizada',
      internalNotes: 'Video aprobado por administración',
    }
  );
  assert.ok(video.id);

  // Helper to query app directly
  const queryAudit = async (queryString: string) => {
    const server = app.listen(0);
    const port = (server.address() as any).port;
    try {
      const res = await fetch(`http://localhost:${port}/api/admin/audit?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } finally {
      server.close();
    }
  };

  // Test 1: Query ALL modules
  const allResult = await queryAudit('module=ALL&limit=100');
  assert.equal(allResult.success, true);
  assert.ok(allResult.total >= 3, `Expected at least 3 entries, got ${allResult.total}`);
  assert.ok(allResult.counts.places >= 1);
  assert.ok(allResult.counts.creators >= 2);
  assert.ok(allResult.counts.videos >= 1);
  assert.equal(allResult.counts.all, allResult.counts.places + allResult.counts.creators + allResult.counts.videos);

  // Check structure of unified entries
  const entry = allResult.data[0];
  assert.ok(entry.id);
  assert.ok(['places', 'creators', 'videos'].includes(entry.module));
  assert.ok(entry.action);
  assert.ok(entry.adminUserId);
  assert.ok(entry.adminName);
  assert.ok(entry.createdAt);

  // Test 2: Filter by places module
  const placesResult = await queryAudit('module=places');
  assert.equal(placesResult.success, true);
  assert.ok(placesResult.data.every((e: any) => e.module === 'places'));

  // Test 3: Filter by creators module
  const creatorsResult = await queryAudit('module=creators');
  assert.equal(creatorsResult.success, true);
  assert.ok(creatorsResult.data.length >= 2);
  assert.ok(creatorsResult.data.every((e: any) => e.module === 'creators'));
  const visibilityChangeEntry = creatorsResult.data.find((e: any) => e.action === 'VISIBILITY_CHANGE');
  assert.ok(visibilityChangeEntry, 'Should contain VISIBILITY_CHANGE entry');
  assert.equal(visibilityChangeEntry.previousStatus, 'Público');
  assert.equal(visibilityChangeEntry.newStatus, 'Oculto');

  // Test 4: Filter by videos module
  const videosResult = await queryAudit('module=videos');
  assert.equal(videosResult.success, true);
  assert.ok(videosResult.data.every((e: any) => e.module === 'videos'));

  // Test 5: Search query
  const searchResult = await queryAudit(`search=${handle}`);
  assert.equal(searchResult.success, true);
  assert.ok(searchResult.data.length >= 2);
  assert.ok(searchResult.data.every((e: any) => e.entityName.includes(handle) || e.changeSummary.includes(handle)));

  // Test 6: Pagination limit
  const pagedResult = await queryAudit('limit=1&page=1');
  assert.equal(pagedResult.success, true);
  assert.equal(pagedResult.data.length, 1);
  assert.equal(pagedResult.limit, 1);
  assert.ok(pagedResult.totalPages >= 3);

  // Test 7: Individual history endpoints
  const queryEndpoint = async (path: string) => {
    const server = app.listen(0);
    const port = (server.address() as any).port;
    try {
      const res = await fetch(`http://localhost:${port}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } finally {
      server.close();
    }
  };

  // 7a. Place individual history
  const placeHistory = await queryEndpoint(`/api/admin/places/${place.id}/history`);
  assert.equal(placeHistory.success, true);
  assert.ok(Array.isArray(placeHistory.data));
  assert.ok(placeHistory.data.length >= 1);
  assert.equal(placeHistory.data[0].placeId, place.id);

  // 7b. Video individual history
  const videoHistory = await queryEndpoint(`/api/admin/moderation/${video.id}/history`);
  assert.equal(videoHistory.success, true);
  assert.ok(Array.isArray(videoHistory.data));
  assert.ok(videoHistory.data.length >= 1);
  assert.equal(videoHistory.data[0].videoId, video.id);

  // 7c. Creator individual history
  const creatorHistory = await queryEndpoint(`/api/admin/creators/${creator.id}/history`);
  assert.equal(creatorHistory.success, true);
  assert.ok(Array.isArray(creatorHistory.data));
  assert.ok(creatorHistory.data.length >= 2);
  assert.equal(creatorHistory.data[0].creatorId, creator.id);

  // Test 8: Filter by action
  const createActionResult = await queryAudit('action=CREATE');
  assert.equal(createActionResult.success, true);
  assert.ok(createActionResult.data.every((e: any) => e.action === 'CREATE'));

  const visibilityActionResult = await queryAudit('action=VISIBILITY_CHANGE');
  assert.equal(visibilityActionResult.success, true);
  assert.ok(visibilityActionResult.data.every((e: any) => e.action === 'VISIBILITY_CHANGE'));

  // Test 9: Search by Admin User ID
  const searchAdminIdResult = await queryAudit(`search=${admin.id}`);
  assert.equal(searchAdminIdResult.success, true);
  assert.ok(searchAdminIdResult.data.length >= 3, 'Should find events associated with this adminUserId');

  // Test 10: Date range filtering
  const today = new Date().toISOString().slice(0, 10);
  const todayResult = await queryAudit(`startDate=${today}&endDate=${today}`);
  assert.equal(todayResult.success, true);
  assert.ok(todayResult.data.length >= 3, 'All newly created events should fall on today');

  // Test 11: Deduplication & ID Uniqueness & Sort Order (DESC)
  const allEvents = await queryAudit('module=ALL&limit=200');
  const allIds = allEvents.data.map((e: any) => e.id);
  const uniqueIds = new Set(allIds);
  assert.equal(uniqueIds.size, allIds.length, 'Audit entries must have globally unique IDs and zero duplicates');

  for (let i = 0; i < allEvents.data.length - 1; i++) {
    const curTime = new Date(allEvents.data[i].createdAt).getTime();
    const nextTime = new Date(allEvents.data[i + 1].createdAt).getTime();
    assert.ok(curTime >= nextTime, 'Events must be sorted in descending chronological order');
  }

  // Test 12: Security check - No sensitive secrets in audit logs
  for (const item of allEvents.data) {
    const jsonStr = JSON.stringify(item);
    assert.ok(!jsonStr.includes('passwordHash'), 'Audit log must never expose password hashes');
    assert.ok(!jsonStr.includes('sessionSecret'), 'Audit log must never expose session secrets');
  }
});
