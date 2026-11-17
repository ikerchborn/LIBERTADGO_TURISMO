import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { adminRouter } from './adminRoutes.ts';
import { getAuthRepository, getCreatorsRepository } from './repositories/index.ts';
import { getPlaceRepository } from './repositories/placeRepository.ts';
import { hashPassword, createToken, authMiddleware } from './authService.ts';

test('RiyMo Comprehensive Admin Dashboard API (/api/admin/dashboard)', async () => {
  const authRepo = getAuthRepository();
  const placeRepo = getPlaceRepository();
  const creatorsRepo = getCreatorsRepository();

  // Create admin user for authentication
  const admin = await authRepo.createUser({
    email: `dashadmin.${Date.now()}@libertadgo.pe`,
    passwordHash: hashPassword('Pass1234!'),
    name: 'Dashboard Inspector',
    role: 'ADMIN',
  });
  const token = createToken(admin);

  // Set up Express test app
  const app = express();
  app.use(express.json());
  app.use(authMiddleware);
  app.use('/api/admin', adminRouter);

  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Unauthenticated request should be rejected with 401
    const unauthRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.equal(unauthRes.status, 401, 'Unauthenticated request must be blocked');

    // 2. Authenticated request should return full platform indicators
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 200, 'Admin request must return 200');
    const json = await res.json();
    assert.equal(json.success, true, 'Response must have success: true');
    assert.ok(json.data, 'Response must include data payload');

    const data = json.data;

    // A. Verify Places Metrics
    assert.ok(typeof data.totalPlaces === 'number', 'totalPlaces must be a number');
    assert.ok(data.totalPlaces >= 290, 'Must have at least 290 places pre-seeded in La Libertad');
    assert.ok(typeof data.publishedCount === 'number', 'publishedCount must be a number');
    assert.ok(typeof data.draftCount === 'number', 'draftCount must be a number');
    assert.ok(typeof data.verifiedCount === 'number', 'verifiedCount must be a number');
    assert.ok(Array.isArray(data.placesByCategory), 'placesByCategory must be an array');
    assert.ok(Array.isArray(data.placesByLocality), 'placesByLocality must be an array');
    assert.ok(Array.isArray(data.sourcesDistribution), 'sourcesDistribution must be an array');

    // B. Verify Creators Metrics
    assert.ok(data.creators, 'Must contain creators cluster');
    assert.ok(typeof data.creators.total === 'number', 'creators.total must be a number');
    assert.ok(typeof data.creators.publicCount === 'number', 'creators.publicCount must be a number');
    assert.ok(typeof data.creators.hiddenCount === 'number', 'creators.hiddenCount must be a number');
    assert.ok(typeof data.creators.verifiedCount === 'number', 'creators.verifiedCount must be a number');
    assert.ok(data.creators.byPlatform, 'creators.byPlatform must be present');
    assert.ok(typeof data.creators.byPlatform.tiktok === 'number', 'creators.byPlatform.tiktok must be a number');
    assert.ok(typeof data.creators.byPlatform.instagram === 'number', 'creators.byPlatform.instagram must be a number');
    assert.ok(typeof data.creators.byPlatform.youtube === 'number', 'creators.byPlatform.youtube must be a number');
    assert.ok(typeof data.creators.totalAudienceFollowers === 'number', 'creators.totalAudienceFollowers must be a number');
    assert.ok(Array.isArray(data.creators.topCreators), 'creators.topCreators must be an array');

    // C. Verify Videos & Moderation Metrics
    assert.ok(data.videos, 'Must contain videos cluster');
    assert.ok(typeof data.videos.total === 'number', 'videos.total must be a number');
    assert.ok(typeof data.videos.approved === 'number', 'videos.approved must be a number');
    assert.ok(typeof data.videos.pending === 'number', 'videos.pending must be a number');
    assert.ok(typeof data.videos.observed === 'number', 'videos.observed must be a number');
    assert.ok(typeof data.videos.rejected === 'number', 'videos.rejected must be a number');
    assert.ok(data.videos.byPlatform, 'videos.byPlatform must be present');
    assert.ok(Array.isArray(data.videos.byCategory), 'videos.byCategory must be an array');
    assert.ok(typeof data.videos.placesWithVideosCount === 'number', 'videos.placesWithVideosCount must be a number');
    assert.ok(typeof data.videos.catalogCoveragePercent === 'number', 'videos.catalogCoveragePercent must be a number');

    // D. Verify Real Engagement Metrics (zero mock/random)
    assert.ok(data.engagement, 'Must contain engagement cluster');
    assert.ok(typeof data.engagement.totalInternalViews === 'number', 'totalInternalViews must be a number');
    assert.ok(typeof data.engagement.totalInternalSaves === 'number', 'totalInternalSaves must be a number');
    assert.ok(typeof data.engagement.totalExternalViews === 'number', 'totalExternalViews must be a number');
    assert.ok(typeof data.engagement.totalExternalLikes === 'number', 'totalExternalLikes must be a number');
    assert.ok(typeof data.engagement.totalExternalComments === 'number', 'totalExternalComments must be a number');

    // E. Verify Unified Recent Activity
    assert.ok(Array.isArray(data.recentActivity), 'recentActivity must be an array');
    if (data.recentActivity.length > 0) {
      const first = data.recentActivity[0];
      assert.ok(first.id, 'Activity must have an id');
      assert.ok(first.module, 'Activity must specify module (places, creators, or videos)');
      assert.ok(first.entityId, 'Activity must specify entityId');
      assert.ok(first.entityName, 'Activity must specify entityName');
      assert.ok(first.action, 'Activity must specify action');
      assert.ok(first.createdAt, 'Activity must have a createdAt timestamp');
    }
  } finally {
    server.close();
  }
});
