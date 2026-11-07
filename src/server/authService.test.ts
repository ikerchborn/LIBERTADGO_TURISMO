import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
} from './authService.ts';

test('authService hashes and verifies passwords securely', () => {
  const password = 'SuperSecretLaLibertad2026!';
  const hash = hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(hash.includes(':'), true);

  const isMatch = verifyPassword(password, hash);
  assert.equal(isMatch, true);

  const isWrongMatch = verifyPassword('WrongPassword123', hash);
  assert.equal(isWrongMatch, false);
});

test('authService creates and verifies cryptographically signed tokens', () => {
  const user = {
    id: 'usr_test_123',
    email: 'viajero@lalibertad.pe',
    name: 'Carlos Viajero',
    role: 'USER' as const,
  };

  const token = createToken(user);
  assert.equal(typeof token, 'string');
  assert.equal(token.includes('.'), true);

  const payload = verifyToken(token);
  assert.notEqual(payload, null);
  assert.equal(payload?.userId, user.id);
  assert.equal(payload?.email, user.email);
  assert.equal(payload?.role, 'USER');
});

test('authService preserves ADMIN role in token', () => {
  const admin = {
    id: 'usr_admin_999',
    email: 'admin@libertadgo.pe',
    name: 'Admin LibertadGO',
    role: 'ADMIN' as const,
  };

  const token = createToken(admin);
  const payload = verifyToken(token);
  assert.equal(payload?.role, 'ADMIN');
});

test('authService rejects tampered tokens', () => {
  const user = {
    id: 'usr_test_123',
    email: 'user@libertadgo.pe',
    name: 'Test',
    role: 'USER' as const,
  };

  const token = createToken(user);
  const tamperedToken = token.slice(0, -4) + 'abcd';
  const payload = verifyToken(tamperedToken);
  assert.equal(payload, null);
});
