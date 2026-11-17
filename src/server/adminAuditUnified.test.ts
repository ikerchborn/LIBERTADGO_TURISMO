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
      category: 'sitios_arqueologicos',
      localityId: 'magdalena_de_cao',
      description: 'Hogar de la Dama de Cao en el valle Chicama',
      latitude: -7.917,
      longitude: -79.303,
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
});
