import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import { apiRouter } from './routes.ts';
import {
  createToken,
  hashPasswordAsync,
  verifyPasswordAsync,
  csrfProtectionMiddleware,
} from './authService.ts';
import {
  aiRateLimiter,
  aiCreditTracker,
  campaignRateLimiter,
  submissionRateLimiter,
  voteRateLimiter,
  itineraryRateLimiter,
} from './rateLimiter.ts';

function createTestApp() {
  const app = express();
  app.use(express.json({ limit: '200kb' }));
  app.use(csrfProtectionMiddleware);
  app.use('/api', apiRouter);
  return app;
}

async function requestApp(
  app: express.Express,
  method: string,
  path: string,
  options: { headers?: Record<string, string>; body?: unknown } = {}
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        server.close();
        return reject(new Error('Failed to bind test server'));
      }
      const payload = options.body !== undefined ? JSON.stringify(options.body) : undefined;
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: addr.port,
          path,
          method,
          headers: {
            ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
            ...(options.headers || {}),
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            server.close();
            server.closeAllConnections?.();
            try {
              resolve({ status: res.statusCode || 0, body: raw ? JSON.parse(raw) : null, headers: res.headers });
            } catch {
              resolve({ status: res.statusCode || 0, body: raw, headers: res.headers });
            }
          });
        }
      );
      req.on('error', (err) => {
        server.close();
        server.closeAllConnections?.();
        reject(err);
      });
      if (payload) req.write(payload);
      req.end();
    });
  });
}

describe('Hardening Security Suite', () => {
  beforeEach(() => {
    aiRateLimiter.clearForTesting();
    aiCreditTracker.clearForTesting();
    campaignRateLimiter.clearForTesting();
    submissionRateLimiter.clearForTesting();
    voteRateLimiter.clearForTesting();
    itineraryRateLimiter.clearForTesting();
  });

  test('hashPasswordAsync & verifyPasswordAsync work without blocking', async () => {
    const hash = await hashPasswordAsync('LibertadGO2026!');
    assert.equal(await verifyPasswordAsync('LibertadGO2026!', hash), true);
    assert.equal(await verifyPasswordAsync('WrongPassword', hash), false);
  });

  test('/api/route rejects path injection and malformed coordinates with 400', async () => {
    const app = createTestApp();
    const res1 = await requestApp(app, 'GET', '/api/route?coordinates=1,2,/../../nearest;3,4');
    assert.equal(res1.status, 400);
    assert.equal(res1.body.success, false);

    const res2 = await requestApp(app, 'GET', `/api/route?coordinates=${encodeURIComponent('-79.028, -8.111')}`);
    assert.equal(res2.status, 400);
  });

  test('/api/places enforces default pagination even without limit param', async () => {
    const app = createTestApp();
    const res = await requestApp(app, 'GET', '/api/places');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length <= 50);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.limit, 50);

    const pageOne = await requestApp(app, 'GET', '/api/places?page=1&limit=10');
    const pageTwo = await requestApp(app, 'GET', '/api/places?page=2&limit=10');
    assert.equal(pageOne.status, 200);
    assert.equal(pageTwo.status, 200);
    assert.equal(pageTwo.body.total, pageOne.body.total);
    assert.equal(pageTwo.body.data.length, 10);
    assert.ok(
      pageOne.body.data.every(
        (place: { id: string }) => !pageTwo.body.data.some((nextPlace: { id: string }) => nextPlace.id === place.id)
      )
    );

    const invalidPage = await requestApp(app, 'GET', '/api/places?page=0');
    const oversizedPage = await requestApp(app, 'GET', '/api/places?limit=101');
    const invalidLimit = await requestApp(app, 'GET', '/api/places?limit=abc');
    const emptyPage = await requestApp(app, 'GET', '/api/places?page=999&limit=10');
    assert.equal(invalidPage.status, 400);
    assert.equal(oversizedPage.status, 400);
    assert.equal(invalidLimit.status, 400);
    assert.equal(emptyPage.status, 200);
    assert.equal(emptyPage.body.data.length, 0);
    assert.equal(emptyPage.body.total, pageOne.body.total);
  });

  test('/api/places/search validates the query and paginates results', async () => {
    const app = createTestApp();
    const firstPage = await requestApp(app, 'GET', '/api/places/search?q=a&limit=2&page=1');
    const secondPage = await requestApp(app, 'GET', '/api/places/search?q=a&limit=2&page=2');

    assert.equal(firstPage.status, 200);
    assert.equal(secondPage.status, 200);
    assert.equal(firstPage.body.limit, 2);
    assert.equal(secondPage.body.page, 2);
    assert.equal(firstPage.body.total, secondPage.body.total);
    assert.equal(firstPage.body.data.length, 2);
    assert.equal(secondPage.body.data.length, 2);

    const missingQuery = await requestApp(app, 'GET', '/api/places/search');
    const longQuery = await requestApp(app, 'GET', `/api/places/search?q=${'a'.repeat(121)}`);
    const noMatches = await requestApp(app, 'GET', '/api/places/search?q=zzzznotfound');
    assert.equal(missingQuery.status, 400);
    assert.equal(longQuery.status, 400);
    assert.equal(noMatches.status, 200);
    assert.equal(noMatches.body.total, 0);
    assert.equal(noMatches.body.totalPages, 0);
  });

  test('campaigns, submissions, and votes require auth and prevent duplicate votes', async () => {
    const app = createTestApp();

    // Unauthenticated campaign creation -> 401
    const noAuthCamp = await requestApp(app, 'POST', '/api/campaigns', {
      body: { title: 'Test Camp', businessName: 'Local', startDate: '2026-01-01', endDate: '2026-02-01' },
    });
    assert.equal(noAuthCamp.status, 401);

    const userToken = createToken({ id: 'u_1', email: 'u1@test.com', name: 'User One', role: 'USER' });

    // Authenticated campaign creation -> 201
    const campRes = await requestApp(app, 'POST', '/api/campaigns', {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { title: 'Campaña Segura', businessName: 'Restaurante Sol', startDate: '2026-01-01', endDate: '2026-02-01' },
    });
    assert.equal(campRes.status, 201);
    const campId = campRes.body.data.id;

    // Submission with disallowed video domain -> 400
    const badSub = await requestApp(app, 'POST', `/api/campaigns/${campId}/submissions`, {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { creatorName: 'Ana', videoUrl: 'https://evil.com/video.mp4', title: 'Mi Video' },
    });
    assert.equal(badSub.status, 400);

    // Valid submission -> 201
    const goodSub = await requestApp(app, 'POST', `/api/campaigns/${campId}/submissions`, {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { creatorName: 'Ana', videoUrl: 'https://www.tiktok.com/@ana/video/12345', title: 'Trujillo Tour' },
    });
    assert.equal(goodSub.status, 201);
    const subId = goodSub.body.data.id;

    // Unauthenticated vote -> 401
    const noAuthVote = await requestApp(app, 'POST', `/api/campaigns/${campId}/submissions/${subId}/vote`);
    assert.equal(noAuthVote.status, 401);

    // First authenticated vote -> 200
    const firstVote = await requestApp(app, 'POST', `/api/campaigns/${campId}/submissions/${subId}/vote`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(firstVote.status, 200);

    // Duplicate vote by same user -> 409
    const dupVote = await requestApp(app, 'POST', `/api/campaigns/${campId}/submissions/${subId}/vote`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(dupVote.status, 409);
  });

  test('/api/ai/chat ignores client remainingCredits and enforces rate limit & Zod validation', async () => {
    const app = createTestApp();

    // Invalid context object -> 400
    const badContext = await requestApp(app, 'POST', '/api/ai/chat', {
      body: { message: 'Hola', context: { unexpectedKey: 'x'.repeat(100) } },
    });
    assert.equal(badContext.status, 400);

    aiRateLimiter.clearForTesting();

    // First 3 requests within 1 minute succeed (ignoring remainingCredits: 999)
    for (let i = 0; i < 3; i++) {
      const res = await requestApp(app, 'POST', '/api/ai/chat', {
        body: { message: 'Hola Trujillo', remainingCredits: 999 },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.creditsRemaining, 9 - i);
    }

    // 4th request in same minute -> 429 rate limited
    const rateLimited = await requestApp(app, 'POST', '/api/ai/chat', {
      body: { message: 'Hola Trujillo', remainingCredits: 999 },
    });
    assert.equal(rateLimited.status, 429);
  });

  test('CSRF blocks localhost origin in production and ignores x-forwarded-host spoofing', async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevSecret = process.env.SESSION_SECRET;
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'test_secret_local_32_chars_min_xxxx';

    try {
      const app = createTestApp();
      const res = await requestApp(app, 'POST', '/api/auth/logout', {
        headers: {
          Cookie: 'libertadgo_token=abc',
          Origin: 'http://localhost:3000',
          Host: 'libertadgo.pe',
          'x-forwarded-host': 'localhost:3000',
        },
      });
      assert.equal(res.status, 403);
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevSecret === undefined) delete process.env.SESSION_SECRET;
      else process.env.SESSION_SECRET = prevSecret;
    }
  });
});
