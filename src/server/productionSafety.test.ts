import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidPostgresUrl,
  validateDatabaseConfig,
} from './repositories/index.ts';
import {
  getSessionSecret,
  validateSecurityConfig,
} from './authService.ts';

test('productionSafety: isValidPostgresUrl correctly validates connection string protocols', () => {
  assert.equal(isValidPostgresUrl('postgres://user:pass@ep-xyz.us-east-1.aws.neon.tech/neondb'), true);
  assert.equal(isValidPostgresUrl('postgresql://user:pass@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require'), true);
  assert.equal(isValidPostgresUrl('mysql://root:pass@localhost:3306/db'), false);
  assert.equal(isValidPostgresUrl('http://insecure-db.internal'), false);
  assert.equal(isValidPostgresUrl('not-a-url'), false);
  assert.equal(isValidPostgresUrl(''), false);
});

test('productionSafety: validateDatabaseConfig enforces DATABASE_URL in production', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;

    // Must fail if missing in production
    assert.throws(
      () => validateDatabaseConfig(),
      /FATAL: DATABASE_URL is missing in production environment/
    );

    // Must fail if invalid format in production
    process.env.DATABASE_URL = 'invalid-connection-string';
    assert.throws(
      () => validateDatabaseConfig(),
      /FATAL: DATABASE_URL has an invalid PostgreSQL format/
    );

    // Must succeed if valid PostgreSQL URL in production
    process.env.DATABASE_URL = 'postgresql://user:secret@ep-demo.us-east-1.aws.neon.tech/libertadgo?sslmode=require';
    assert.doesNotThrow(() => validateDatabaseConfig());

    // In development, missing DATABASE_URL does not throw
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;
    assert.doesNotThrow(() => validateDatabaseConfig());
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) {
      process.env.DATABASE_URL = originalDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  }
});

test('productionSafety: validateSecurityConfig enforces SESSION_SECRET in production', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.SESSION_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;

    // Must fail if missing in production
    assert.throws(
      () => validateSecurityConfig(),
      /FATAL: SESSION_SECRET is mandatory in production/
    );

    // Must fail if using default development secret in production
    process.env.SESSION_SECRET = 'libertadgo_sec_sig_7b29e01f5c6a84d3e218';
    assert.throws(
      () => validateSecurityConfig(),
      /must not use the development default secret/
    );

    // Must fail if too short in production
    process.env.SESSION_SECRET = 'short_secret_12';
    assert.throws(
      () => validateSecurityConfig(),
      /must be at least 16 characters long/
    );

    // Must succeed with strong production secret
    process.env.SESSION_SECRET = 'c9a8f23b4e107d6e5a4f3b2c1d0e9a8f7b6c5d4e3a2b1c';
    assert.doesNotThrow(() => validateSecurityConfig());
    assert.equal(getSessionSecret(), 'c9a8f23b4e107d6e5a4f3b2c1d0e9a8f7b6c5d4e3a2b1c');

    // In development, fallback is allowed without throwing
    process.env.NODE_ENV = 'development';
    delete process.env.SESSION_SECRET;
    assert.doesNotThrow(() => validateSecurityConfig());
    assert.equal(getSessionSecret(), 'libertadgo_sec_sig_7b29e01f5c6a84d3e218');
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalSecret !== undefined) {
      process.env.SESSION_SECRET = originalSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  }
});
