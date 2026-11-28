import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { authRouter } from './authRoutes.ts';
import { adminRouter } from './adminRoutes.ts';
import { getAuthRepository } from './repositories/index.ts';
import {
  hashPassword,
  authMiddleware,
  csrfProtectionMiddleware,
  clearRevokedTokensForTesting,
} from './authService.ts';

function extractCookieValue(setCookieHeader: string | null, cookieName: string): string | null {
  if (!setCookieHeader) return null;
  const regex = new RegExp(`(?:^|,\\s*)${cookieName}=([^;]+)`);
  const match = setCookieHeader.match(regex);
  return match ? `${cookieName}=${match[1]}` : null;
}

test('RiyMo Integral Auth + Admin Dashboard 8-Flow Validation', async () => {
  clearRevokedTokensForTesting();

  const authRepo = getAuthRepository();
  const suffix = Date.now();
  const adminEmail = `admin.flow.${suffix}@riymo.pe`;
  const userEmail = `user.flow.${suffix}@riymo.pe`;
  const password = 'RiyMoSecure!2026';

  await authRepo.createUser({
    email: adminEmail,
    passwordHash: hashPassword(password),
    name: 'Administrador Principal',
    role: 'ADMIN',
  });

  await authRepo.createUser({
    email: userEmail,
    passwordHash: hashPassword(password),
    name: 'Viajero Estándar',
    role: 'USER',
  });

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(authMiddleware);
  app.use(csrfProtectionMiddleware);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Flow 5 (pre-check): Unauthenticated /api/auth/me and /api/admin/dashboard -> 401
    const unauthMe = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(unauthMe.status, 401, 'Unauthenticated /api/auth/me must return 401');

    const unauthDash = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.equal(unauthDash.status, 401, 'Unauthenticated /api/admin/dashboard must return 401');

    // Flow 6: Non-admin USER role -> 403 on /api/admin/dashboard
    const userLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password }),
    });
    assert.equal(userLoginRes.status, 200, 'Standard user login must succeed');
    const userLoginJson = await userLoginRes.json();
    const userToken = userLoginJson.data.token as string;
    const userCookie = extractCookieValue(userLoginRes.headers.get('set-cookie'), 'libertadgo_token');
    assert.ok(userCookie, 'User login must set session cookie');

    const userDashBearerRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(userDashBearerRes.status, 403, 'USER role with Bearer must receive 403');

    const userDashCookieRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: userCookie },
    });
    assert.equal(userDashCookieRes.status, 403, 'USER role with Cookie must receive 403');

    // Flow 1: Admin login with valid credentials (simulate Cloud Run HTTPS proxy)
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-Host': 'goriymo.ai.studio',
      },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    assert.equal(adminLoginRes.status, 200, 'Admin login must return 200');
    const adminLoginJson = await adminLoginRes.json();
    assert.equal(adminLoginJson.success, true);
    assert.equal(adminLoginJson.data.user.role, 'ADMIN');

    const adminSetCookie = adminLoginRes.headers.get('set-cookie');
    assert.ok(adminSetCookie, 'Admin login must emit Set-Cookie');
    assert.match(adminSetCookie, /HttpOnly/i, 'Cookie must be HttpOnly');
    assert.match(adminSetCookie, /Secure/i, 'HTTPS proxied login must set Secure cookie');
    assert.match(adminSetCookie, /SameSite=None/i, 'HTTPS proxied login must set SameSite=None');

    const adminCookie = extractCookieValue(adminSetCookie, 'libertadgo_token');
    const adminToken = adminLoginJson.data.token as string;
    assert.ok(adminCookie, 'Must extract libertadgo_token cookie');
    assert.ok(adminToken, 'Must receive session token');

    // Flow 2: GET /api/auth/me with valid session (cookie alone, Bearer, and cookie + Bearer null) -> 200
    const meCookieRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(meCookieRes.status, 200, 'GET /api/auth/me with cookie must return 200');
    const meCookieJson = await meCookieRes.json();
    assert.equal(meCookieJson.data.user.email, adminEmail);
    assert.equal(meCookieJson.data.user.role, 'ADMIN');

    const meBearerRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(meBearerRes.status, 200, 'GET /api/auth/me with Bearer must return 200');

    // Flow 3 & Flow 4: GET /api/admin/dashboard -> 200 with real data (not mocked)
    const dashCookieRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(dashCookieRes.status, 200, 'GET /api/admin/dashboard with cookie must return 200');
    const dashCookieJson = await dashCookieRes.json();
    assert.equal(dashCookieJson.success, true);
    assert.ok(dashCookieJson.data.totalPlaces >= 290, 'Real catalog places count must be >= 290');
    assert.ok(Array.isArray(dashCookieJson.data.timeline) && dashCookieJson.data.timeline.length > 0);
    assert.ok(Array.isArray(dashCookieJson.data.recentActivity));
    assert.ok(typeof dashCookieJson.data.creators.total === 'number');
    assert.ok(typeof dashCookieJson.data.videos.total === 'number');

    const dashBearerRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(dashBearerRes.status, 200, 'GET /api/admin/dashboard with Bearer must return 200');

    // Also verify other admin endpoints respond 200 for authenticated admin
    for (const path of ['/api/admin/places', '/api/admin/audit', '/api/admin/categories', '/api/admin/localities', '/api/admin/sources', '/api/admin/duplicates']) {
      const endpointRes: Response = await fetch(`${baseUrl}${path}`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(endpointRes.status, 200, `${path} must return 200 for authenticated admin`);
    }

    // Flow 7: Logout clears cookie and revokes token
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: adminCookie,
        Authorization: `Bearer ${adminToken}`,
        Origin: 'https://goriymo.ai.studio',
        'X-Forwarded-Host': 'goriymo.ai.studio',
        'X-Forwarded-Proto': 'https',
        'Sec-Fetch-Site': 'same-origin',
      },
    });
    assert.equal(logoutRes.status, 200, 'Logout must succeed');
    const logoutSetCookie = logoutRes.headers.get('set-cookie') || '';
    assert.match(logoutSetCookie, /libertadgo_token=;/, 'Logout must clear libertadgo_token cookie');
    assert.match(logoutSetCookie, /SameSite=None/i, 'Logout clearCookie must match SameSite=None on HTTPS');

    const afterLogoutMe = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(afterLogoutMe.status, 401, 'Revoked cookie must fail on /api/auth/me');

    const afterLogoutDash = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(afterLogoutDash.status, 401, 'Revoked Bearer token must fail on /api/admin/dashboard');

    // Flow 8: Re-login works cleanly end-to-end
    const reloginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    assert.equal(reloginRes.status, 200, 'Re-login must succeed');
    const reloginJson = await reloginRes.json();
    const reloginCookie = extractCookieValue(reloginRes.headers.get('set-cookie'), 'libertadgo_token');
    assert.ok(reloginCookie, 'Re-login must issue new cookie');
    assert.notEqual(reloginJson.data.token, undefined);

    const reloginMe = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: reloginCookie },
    });
    assert.equal(reloginMe.status, 200, 'Re-login cookie must authenticate /api/auth/me');

    const reloginDash = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: reloginCookie },
    });
    assert.equal(reloginDash.status, 200, 'Re-login cookie must load /api/admin/dashboard');
  } finally {
    server.close();
  }
});
