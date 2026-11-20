import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { getPlaceRepository, resetPlaceRepositoryForTesting } from './repositories/placeRepository.ts';
import { authMiddleware, clearRevokedTokensForTesting, createToken } from './authService.ts';
import { adminRouter } from './adminRoutes.ts';
import { formatPlaceValidationIssues, validateAndBuildPlacePayload } from '../utils/placeValidation.ts';

test('Place Repository & Admin Workflow Tests', async (t) => {
  resetPlaceRepositoryForTesting();
  const repo = getPlaceRepository();

  await t.test('1. Initial catalog loads exactly 297 verified places', async () => {
    const list = await repo.listPlaces({ limit: 400 });
    assert.equal(list.total, 297, `Expected exactly 297 places in initial seed, got ${list.total}`);
    assert.ok(list.places.length >= 297);
  });

  await t.test('2. Filtering by status: PUBLISHED returns all places initially', async () => {
    const published = await repo.listPlaces({ status: 'PUBLISHED', limit: 400 });
    assert.equal(published.total, 297);
    const drafts = await repo.listPlaces({ status: 'DRAFT' });
    assert.equal(drafts.total, 0);
  });

  await t.test('3. Admin can create a new place with validation and audit log', async () => {
    const newPlace = await repo.createPlace(
      {
        name: 'Nuevo Restaurante Mochica',
        category: 'restaurantes',
        localityId: 'moche',
        localityName: 'Moche',
        address: 'Campiña de Moche s/n',
        coordinates: { lat: -8.1705, lng: -79.0062 },
        shortDescription: 'Excelente comida típica tradicional norteña y sopa teóloga.',
        status: 'PUBLISHED',
      },
      'admin_user_1',
      'Pedro Admin'
    );

    assert.ok(newPlace.id);
    assert.equal(newPlace.name, 'Nuevo Restaurante Mochica');
    assert.equal(newPlace.localityId, 'moche');

    // Total should now be 298
    const updatedList = await repo.listPlaces({ limit: 400 });
    assert.equal(updatedList.total, 298);

    // Audit log was recorded
    const logs = await repo.getAuditLogs(newPlace.id);
    assert.ok(logs.length >= 1);
    assert.equal(logs[0].action, 'CREATE');
    assert.equal(logs[0].adminName, 'Pedro Admin');
  });

  await t.test('4. Admin can update place fields and change status to ARCHIVED', async () => {
    const place = (await repo.listPlaces({ limit: 1 })).places[0];
    const originalStatus = place.status;

    const updated = await repo.updateStatus(place.id, 'ARCHIVED', 'admin_user_1', 'Pedro Admin', 'Cierre temporal');
    assert.ok(updated);
    assert.equal(updated.status, 'ARCHIVED');

    // Public catalog should NOT include archived place
    const publicPlaces = await repo.getPublicPlaces();
    assert.ok(!publicPlaces.some((p) => p.id === place.id));

    // Audit trail has ARCHIVE action
    const logs = await repo.getAuditLogs(place.id);
    assert.ok(logs.some((l) => l.action === 'ARCHIVE'));

    // Revert status to PUBLISHED
    await repo.updateStatus(place.id, originalStatus, 'admin_user_1', 'Pedro Admin', 'Reapertura');
  });

  await t.test('5. Admin can update verification level and notes', async () => {
    const place = (await repo.listPlaces({ limit: 1 })).places[0];
    const verified = await repo.verifyPlace(
      place.id,
      true,
      'official_mincetur',
      'Validado con directorio regional oficial 2026',
      'admin_user_1',
      'Pedro Admin'
    );

    assert.ok(verified);
    assert.equal(verified.verification.isVerified, true);
    assert.equal(verified.verification.verificationLevel, 'official_mincetur');
    assert.equal(verified.verification.verifiedBy, 'Pedro Admin');
  });

  await t.test('6. Dashboard metrics aggregate correctly', async () => {
    const metrics = await repo.getDashboardMetrics();
    assert.ok(metrics.totalPlaces >= 297);
    assert.ok(metrics.placesByCategory.length > 0);
    assert.ok(metrics.placesByLocality.length >= 10);
    assert.ok(metrics.sourcesDistribution.length > 0);
    assert.ok(Array.isArray(metrics.recentAuditLogs));
  });

  await t.test('7. Duplicate detection identifies nearby identical places and supports merge', async () => {
    // Intentionally create a duplicate place
    const dup = await repo.createPlace(
      {
        name: 'Museo de Sitio de Chan Chan (Duplicado OSM)',
        category: 'museos',
        localityId: 'huanchaco',
        localityName: 'Huanchaco',
        address: 'Carretera Huanchaco Km 4.5',
        coordinates: { lat: -8.0999, lng: -79.0683 }, // 15 meters from Museo de Sitio de Chan Chan
        shortDescription: 'Museo de sitio arqueológico Chan Chan duplicado para test',
      },
      'admin_user_1',
      'Pedro Admin'
    );

    const duplicates = await repo.findDuplicates();
    assert.ok(duplicates.length > 0, 'Expected at least 1 duplicate candidate');

    // Find pair containing the new place
    const pair = duplicates.find((d: { primaryPlace: { id: string }; duplicatePlace: { id: string } }) => d.primaryPlace.id === dup.id || d.duplicatePlace.id === dup.id);
    assert.ok(pair, 'Duplicate pair was found');

    const primaryId = pair.primaryPlace.id === dup.id ? pair.duplicatePlace.id : pair.primaryPlace.id;
    const dupId = dup.id;

    const mergeResult = await repo.mergeDuplicates(primaryId, [dupId], 'admin_user_1', 'Pedro Admin');
    assert.ok(mergeResult.success);
    assert.equal(mergeResult.mergedCount, 1);

    // Duplicate should now be ARCHIVED
    const archivedDup = await repo.getPlaceById(dupId);
    assert.equal(archivedDup?.status, 'ARCHIVED');
  });
});

test('HTTP GET /api/admin/places Endpoint Tests', async (t) => {
  resetPlaceRepositoryForTesting();
  clearRevokedTokensForTesting();

  const app = express();
  app.use(express.json());
  app.use(authMiddleware);
  app.use('/api/admin', adminRouter);

  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}/api/admin/places`;

  const adminToken = createToken({
    id: 'admin_http_test',
    email: 'admin@riymo.pe',
    name: 'Admin HTTP Tester',
    role: 'ADMIN',
  });

  const authHeaders = {
    Authorization: `Bearer ${adminToken}`,
  };

  t.after(() => {
    server.close();
  });

  await t.test('1. GET /api/admin/places sin filtros retorna el catálogo paginado (297, 15 páginas)', async () => {
    const res = await fetch(baseUrl, { headers: authHeaders });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.total, 297);
    assert.equal(body.page, 1);
    assert.equal(body.totalPages, 15);
    assert.ok(Array.isArray(body.data));
    assert.equal(body.data.length, 20);

    // También debe aceptar los parámetros por defecto que envía el frontend y valores vacíos/nullish
    const defaultFrontendRes = await fetch(
      `${baseUrl}?search=&status=ALL&category=todas&localityId=todas&isVerified=ALL&page=1&limit=20&sortBy=updatedAt&sortOrder=desc`,
      { headers: authHeaders }
    );
    assert.equal(defaultFrontendRes.status, 200);
    const defaultFrontendBody = await defaultFrontendRes.json();
    assert.equal(defaultFrontendBody.success, true);
    assert.equal(defaultFrontendBody.total, 297);
    assert.equal(defaultFrontendBody.totalPages, 15);
    assert.equal(defaultFrontendBody.data.length, 20);

    const nullishRes = await fetch(
      `${baseUrl}?search=undefined&status=null&category=&localityId=&isVerified=&page=&limit=`,
      { headers: authHeaders }
    );
    assert.equal(nullishRes.status, 200);
    const nullishBody = await nullishRes.json();
    assert.equal(nullishBody.total, 297);
    assert.equal(nullishBody.page, 1);
  });

  await t.test('2. GET /api/admin/places con paginación funciona correctamente', async () => {
    const page2Res = await fetch(`${baseUrl}?page=2&limit=20`, { headers: authHeaders });
    assert.equal(page2Res.status, 200);
    const page2Body = await page2Res.json();
    assert.equal(page2Body.success, true);
    assert.equal(page2Body.total, 297);
    assert.equal(page2Body.page, 2);
    assert.equal(page2Body.totalPages, 15);
    assert.equal(page2Body.data.length, 20);

    const page15Res = await fetch(`${baseUrl}?page=15&limit=20`, { headers: authHeaders });
    assert.equal(page15Res.status, 200);
    const page15Body = await page15Res.json();
    assert.equal(page15Body.success, true);
    assert.equal(page15Body.page, 15);
    assert.equal(page15Body.totalPages, 15);
    assert.equal(page15Body.data.length, 17);
  });

  await t.test('3. GET /api/admin/places con búsqueda (search) filtra resultados', async () => {
    const res = await fetch(`${baseUrl}?search=${encodeURIComponent('Chan Chan')}&limit=50`, {
      headers: authHeaders,
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.total >= 1, 'Expected at least 1 match for Chan Chan');
    assert.ok(body.data.length >= 1);
    assert.ok(
      body.data.every((p: { name: string; address: string; localityName: string; category: string; id: string; tags?: string[] }) => {
        const hay = [p.name, p.address, p.localityName, p.category, p.id, ...(p.tags || [])]
          .join(' ')
          .toLowerCase();
        return hay.includes('chan chan');
      })
    );
  });

  await t.test('4. GET /api/admin/places con filtros por localidad (localityId) y categoría (category)', async () => {
    const res = await fetch(
      `${baseUrl}?localityId=huanchaco&category=playas&isVerified=ALL&limit=50`,
      { headers: authHeaders }
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.total >= 1, 'Expected at least 1 beach place in huanchaco');
    assert.ok(
      body.data.every(
        (p: { localityId: string; category: string }) =>
          p.localityId === 'huanchaco' && p.category === 'playas'
      )
    );

    const verifiedOnlyRes = await fetch(`${baseUrl}?isVerified=true&limit=20`, { headers: authHeaders });
    assert.equal(verifiedOnlyRes.status, 200);
    const verifiedOnlyBody = await verifiedOnlyRes.json();
    assert.equal(verifiedOnlyBody.success, true);
    assert.ok(
      verifiedOnlyBody.data.every((p: { verification: { isVerified: boolean } }) => p.verification.isVerified === true)
    );
  });

  await t.test('5. GET /api/admin/places con parámetros inválidos responde 400 Bad Request', async () => {
    const invalidQueries = [
      '?page=0',
      '?page=abc',
      '?limit=-5',
      '?limit=500',
      '?status=INVALID',
      '?category=invalida',
      '?localityId=lima',
      '?isVerified=talvez',
      '?sortBy=campo_inexistente',
      '?sortOrder=sideways',
    ];

    for (const qs of invalidQueries) {
      const res = await fetch(`${baseUrl}${qs}`, { headers: authHeaders });
      assert.equal(res.status, 400, `Expected 400 Bad Request for query "${qs}", got ${res.status}`);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.ok(Array.isArray(body.details) && body.details.length > 0, `Expected validation details for "${qs}"`);
    }
  });
});

test('HTTP POST /api/admin/places & Shared PlaceValidation Tests', async (t) => {
  resetPlaceRepositoryForTesting();
  clearRevokedTokensForTesting();

  const app = express();
  app.use(express.json());
  app.use(authMiddleware);
  app.use('/api/admin', adminRouter);

  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}/api/admin/places`;

  const adminToken = createToken({
    id: 'user_admin_post_test',
    email: 'admin@riymo.pe',
    name: 'Admin Creador',
    role: 'ADMIN',
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  t.after(() => {
    server.close();
  });

  await t.test('1. Crear un lugar con todos los campos obligatorios y payload exacto de PlaceEditorModal (incluyendo changeSummary)', async () => {
    const draft = validateAndBuildPlacePayload({
      name: 'Óvalo Papal de Trujillo',
      category: 'atractivos',
      subcategory: 'Plaza y Monumento',
      localityId: 'trujillo',
      address: 'Av. América Norte con Av. Jesús de Nazareth',
      coordinates: { lat: -8.1032, lng: -79.0354 },
      shortDescription: 'Espacio cívico emblemático de Trujillo con áreas verdes.',
      fullDescription: 'Lugar histórico visitado por el Papa Francisco en 2018.',
      phone: '+51 44 201122',
      email: 'turismo@trujillo.pe',
      website: 'https://trujillo.pe',
      mapsUrl: 'https://maps.google.com/?q=-8.1032,-79.0354',
      priceLevel: 1,
      recommendedDurationMinutes: 45,
      status: 'PUBLISHED',
      isVerified: true,
      verificationLevel: 'partner_verified',
      verificationNotes: 'Verificado por administración RIYMO',
      safetyScore: 88,
      tagsInput: 'turismo, plaza, trujillo',
      images: [
        {
          id: 'img_1',
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
          caption: 'Foto principal',
          isCover: true,
        },
      ],
      changeSummary: 'Creación inicial',
    });

    assert.equal(draft.valid, true);
    assert.ok(draft.payload);

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(draft.payload),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.name, 'Óvalo Papal de Trujillo');
    assert.equal(body.data.localityId, 'trujillo');
    assert.equal(body.data.localityName, 'Trujillo');
    assert.equal(body.data.slug, 'ovalo-papal-de-trujillo');

    // Verificar persistencia consultando el listado
    const searchRes = await fetch(`${baseUrl}?search=${encodeURIComponent('Óvalo Papal de Trujillo')}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(searchRes.status, 200);
    const searchBody = await searchRes.json();
    assert.equal(searchBody.total, 1);
    assert.equal(searchBody.data[0].id, body.data.id);
  });

  await t.test('2. Crear un lugar dejando campos opcionales vacíos (desde formulario y con strings/arrays vacíos o null en API)', async () => {
    // Caso A: normalización desde formulario con campos opcionales en blanco
    const minimalDraft = validateAndBuildPlacePayload({
      name: 'Mirador Cerro Campana',
      category: 'naturaleza',
      subcategory: '   ',
      localityId: 'huanchaco',
      address: 'Panamericana Norte Km 570',
      coordinates: { lat: -8.0065, lng: -79.1042 },
      shortDescription: 'Mirador natural costero en las afueras de Huanchaco.',
      fullDescription: '',
      phone: '',
      email: '',
      website: '',
      mapsUrl: '',
      priceLevel: 2,
      recommendedDurationMinutes: 60,
      status: 'PUBLISHED',
      isVerified: true,
      verificationLevel: 'partner_verified',
      verificationNotes: '',
      safetyScore: 85,
      tagsInput: '',
      images: [],
      changeSummary: '',
    });

    assert.equal(minimalDraft.valid, true);
    const resForm = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(minimalDraft.payload),
    });
    assert.equal(resForm.status, 201);
    const bodyForm = await resForm.json();
    assert.equal(bodyForm.success, true);
    assert.equal(bodyForm.data.name, 'Mirador Cerro Campana');
    assert.equal(bodyForm.data.localityName, 'Huanchaco');

    // Caso B: payload directo con opcionales explícitamente vacíos ("", "   ", null, []) y sin localityName
    const resRaw = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Bosque de Cachil',
        category: 'naturaleza',
        localityId: 'cascas',
        localityName: '',
        address: 'Sector Cachil, Contumazá - Ruta Cascas',
        coordinates: { lat: -7.405, lng: -78.782 },
        shortDescription: 'Bosque relicto de neblina cercano a Cascas.',
        subcategory: '   ',
        fullDescription: null,
        phone: '',
        email: '   ',
        website: '',
        mapsUrl: null,
        priceLevel: null,
        recommendedDurationMinutes: '',
        safetyScore: null,
        verification: {
          isVerified: true,
          verificationLevel: 'community',
          notes: '',
        },
        tags: ['', '  '],
        images: [],
        changeSummary: '   ',
      }),
    });

    assert.equal(resRaw.status, 201);
    const bodyRaw = await resRaw.json();
    assert.equal(bodyRaw.success, true);
    assert.equal(bodyRaw.data.name, 'Bosque de Cachil');
    assert.equal(bodyRaw.data.localityName, 'Cascas');
  });

  await t.test('3. Intentar crear un lugar sin nombre devuelve 400 e indica el campo name', async () => {
    const clientValidation = validateAndBuildPlacePayload({
      name: '   ',
      category: 'atractivos',
      localityId: 'trujillo',
      address: 'Centro Histórico, Trujillo',
      coordinates: { lat: -8.1118, lng: -79.0287 },
      shortDescription: 'Descripción válida del lugar turístico.',
    });
    assert.equal(clientValidation.valid, false);
    assert.ok(clientValidation.issues.some((i) => i.field === 'name'));
    assert.ok(formatPlaceValidationIssues(clientValidation.issues).includes('Nombre Oficial'));

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        category: 'atractivos',
        localityId: 'trujillo',
        address: 'Centro Histórico, Trujillo',
        coordinates: { lat: -8.1118, lng: -79.0287 },
        shortDescription: 'Descripción válida del lugar turístico.',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.includes('Nombre Oficial'));
    assert.ok(body.details.some((d: { field: string; message: string }) => d.field === 'name' && d.message.includes('obligatorio')));
  });

  await t.test('4. Intentar crear un lugar sin localidad devuelve 400 e indica el campo localityId', async () => {
    const clientValidation = validateAndBuildPlacePayload({
      name: 'Museo Regional',
      category: 'museos',
      localityId: '',
      address: 'Jr. Independencia 500',
      coordinates: { lat: -8.1118, lng: -79.0287 },
      shortDescription: 'Museo histórico con piezas arqueológicas.',
    });
    assert.equal(clientValidation.valid, false);
    assert.ok(clientValidation.issues.some((i) => i.field === 'localityId'));
    assert.ok(formatPlaceValidationIssues(clientValidation.issues).includes('Localidad'));

    // Sin localityId en body
    const resMissing = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Museo Regional',
        category: 'museos',
        address: 'Jr. Independencia 500',
        coordinates: { lat: -8.1118, lng: -79.0287 },
        shortDescription: 'Museo histórico con piezas arqueológicas.',
      }),
    });
    assert.equal(resMissing.status, 400);
    const bodyMissing = await resMissing.json();
    assert.equal(bodyMissing.success, false);
    assert.ok(bodyMissing.error.includes('Localidad'));
    assert.ok(bodyMissing.details.some((d: { field: string }) => d.field === 'localityId'));

    // Con localityId inválida
    const resInvalid = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Museo Regional',
        category: 'museos',
        localityId: 'lima',
        address: 'Jr. Independencia 500',
        coordinates: { lat: -8.1118, lng: -79.0287 },
        shortDescription: 'Museo histórico con piezas arqueológicas.',
      }),
    });
    assert.equal(resInvalid.status, 400);
    const bodyInvalid = await resInvalid.json();
    assert.ok(bodyInvalid.details.some((d: { field: string }) => d.field === 'localityId'));
  });

  await t.test('5. Errores de validación indican dirección, descripción corta o coordenadas faltantes/inválidas', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Lugar Incompleto',
        category: 'atractivos',
        localityId: 'moche',
        address: '',
        coordinates: { lat: -12.0464, lng: -77.0428 }, // Lima (fuera de La Libertad)
        shortDescription: 'abc', // menos de 5 caracteres
        email: 'correo-invalido',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    const fields = body.details.map((d: { field: string }) => d.field);
    assert.ok(fields.includes('address'), 'Debe indicar error en address');
    assert.ok(fields.includes('shortDescription'), 'Debe indicar error en shortDescription');
    assert.ok(fields.includes('coordinates'), 'Debe indicar error en coordinates');
    assert.ok(fields.includes('email'), 'Debe indicar error en email');
    assert.ok(body.error.includes('Dirección Física'));
    assert.ok(body.error.includes('Descripción Corta'));
    assert.ok(body.error.includes('Coordenadas GPS'));
  });
});

