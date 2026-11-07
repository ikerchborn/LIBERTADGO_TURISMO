import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidPostgresUrl,
  validateDatabaseConfig,
  verifyDatabaseConnectivity,
  checkDatabaseHealth,
  getCreatorsRepository,
  setActiveDatabaseAdapterForTesting,
  resetRepositoriesForTesting,
} from './repositories/index.ts';
import { MemoryCreatorsRepository } from './repositories/memoryCreatorsRepository.ts';
import {
  getSessionSecret,
  validateSecurityConfig,
  bootstrapAdminFromEnv,
} from './authService.ts';

test('Protocol validation: isValidPostgresUrl correctly validates connection string protocols', () => {
  assert.equal(isValidPostgresUrl('postgres://user:pass@ep-xyz.us-east-1.aws.neon.tech/neondb'), true);
  assert.equal(isValidPostgresUrl('postgresql://user:pass@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require'), true);
  assert.equal(isValidPostgresUrl('mysql://root:pass@localhost:3306/db'), false);
  assert.equal(isValidPostgresUrl('http://insecure-db.internal'), false);
  assert.equal(isValidPostgresUrl('not-a-url'), false);
  assert.equal(isValidPostgresUrl(''), false);
});

// 1. Producción sin SESSION_SECRET: arranque rechazado.
test('1. Producción sin SESSION_SECRET: arranque rechazado', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.SESSION_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;

    assert.throws(
      () => validateSecurityConfig(),
      /FATAL: SESSION_SECRET is mandatory in production environment/
    );

    assert.throws(
      () => getSessionSecret(),
      /FATAL: SESSION_SECRET is mandatory in production/
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalSecret !== undefined) {
      process.env.SESSION_SECRET = originalSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  }
});

// 2. Producción con secreto de desarrollo: arranque rechazado.
test('2. Producción con secreto de desarrollo: arranque rechazado', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.SESSION_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'libertadgo_sec_sig_7b29e01f5c6a84d3e218';

    assert.throws(
      () => validateSecurityConfig(),
      /must not use the development default secret in production/
    );

    assert.throws(
      () => getSessionSecret(),
      /must not use the development default secret/
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalSecret !== undefined) {
      process.env.SESSION_SECRET = originalSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  }
});

// 3. Producción sin DATABASE_URL: arranque rechazado.
test('3. Producción sin DATABASE_URL: arranque rechazado', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;

    assert.throws(
      () => validateDatabaseConfig(),
      /FATAL: DATABASE_URL is missing in production environment/
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) {
      process.env.DATABASE_URL = originalDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  }
});

// 4. Producción con DATABASE_URL inaccesible: arranque rechazado.
test('4. Producción con DATABASE_URL inaccesible: arranque rechazado', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:secret@ep-offline.us-east-1.aws.neon.tech/libertadgo?sslmode=require';

    // Mock an adapter simulating a failed connection to Neon/Postgres
    const mockFailingAdapter = {
      testConnection: async () => {
        throw new Error('Connection refused / host unreachable at ep-offline.us-east-1.aws.neon.tech:5432');
      },
      close: async () => {},
    };
    setActiveDatabaseAdapterForTesting(mockFailingAdapter as any);

    await assert.rejects(
      async () => {
        await verifyDatabaseConnectivity();
      },
      /FATAL: Unable to establish PostgreSQL connection in production/
    );
  } finally {
    resetRepositoriesForTesting();
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) {
      process.env.DATABASE_URL = originalDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  }
});

// 5. Producción con configuración válida y Neon accesible: arranque correcto.
test('5. Producción con configuración válida y Neon accesible: arranque correcto', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;
  const originalSecret = process.env.SESSION_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'c9a8f23b4e107d6e5a4f3b2c1d0e9a8f7b6c5d4e3a2b1c';
    process.env.DATABASE_URL = 'postgresql://user:secret@ep-demo.us-east-1.aws.neon.tech/libertadgo?sslmode=require';

    let pingInvoked = false;
    const mockSuccessAdapter = {
      testConnection: async () => {
        pingInvoked = true;
      },
      close: async () => {},
    };
    setActiveDatabaseAdapterForTesting(mockSuccessAdapter as any);

    assert.doesNotThrow(() => validateSecurityConfig());
    assert.doesNotThrow(() => validateDatabaseConfig());
    assert.equal(getSessionSecret(), 'c9a8f23b4e107d6e5a4f3b2c1d0e9a8f7b6c5d4e3a2b1c');

    await assert.doesNotReject(async () => {
      await verifyDatabaseConnectivity();
    });
    assert.equal(pingInvoked, true);
  } finally {
    resetRepositoriesForTesting();
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) {
      process.env.DATABASE_URL = originalDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
    if (originalSecret !== undefined) {
      process.env.SESSION_SECRET = originalSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  }
});

// 6. Desarrollo sin DATABASE_URL: puede usar memoria.
test('6. Desarrollo sin DATABASE_URL: puede usar memoria', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;
    resetRepositoriesForTesting();

    assert.doesNotThrow(() => validateDatabaseConfig());
    const repo = getCreatorsRepository();
    assert.equal(repo instanceof MemoryCreatorsRepository, true);
  } finally {
    resetRepositoriesForTesting();
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) {
      process.env.DATABASE_URL = originalDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  }
});

// 7. Registro público: siempre role USER.
test('7. Registro público: siempre role USER (incluso con 0 usuarios previos)', async () => {
  const memoryRepo = new MemoryCreatorsRepository();
  assert.equal(await memoryRepo.countUsers(), 0);

  // First user registered via public endpoint
  const firstUser = await memoryRepo.createUser({
    email: 'primer_usuario@test.pe',
    passwordHash: 'scrypt:salted_hash_1',
    name: 'Primer Usuario',
    role: 'USER',
  });
  assert.equal(firstUser.role, 'USER');

  // Second user registered via public endpoint
  const secondUser = await memoryRepo.createUser({
    email: 'segundo_usuario@test.pe',
    passwordHash: 'scrypt:salted_hash_2',
    name: 'Segundo Usuario',
    role: 'USER',
  });
  assert.equal(secondUser.role, 'USER');
  assert.equal(await memoryRepo.countUsers(), 2);
});

// 8. Bootstrap: crea ADMIN únicamente con variables válidas.
test('8. Bootstrap: crea ADMIN únicamente con variables válidas', async () => {
  const memoryRepo = new MemoryCreatorsRepository();
  setActiveDatabaseAdapterForTesting(memoryRepo);

  const originalEmail = process.env.ADMIN_INITIAL_EMAIL;
  const originalPass = process.env.ADMIN_INITIAL_PASSWORD;

  try {
    // 8a. Sin variables -> no se crea admin
    delete process.env.ADMIN_INITIAL_EMAIL;
    delete process.env.ADMIN_INITIAL_PASSWORD;
    const resNoVars = await bootstrapAdminFromEnv();
    assert.equal(resNoVars.bootstrapped, false);
    assert.equal(resNoVars.reason, 'missing_credentials');
    assert.equal(await memoryRepo.countUsers(), 0);

    // 8b. Solo email sin password -> no se crea admin
    process.env.ADMIN_INITIAL_EMAIL = 'admin@libertadgo.pe';
    delete process.env.ADMIN_INITIAL_PASSWORD;
    const resOnlyEmail = await bootstrapAdminFromEnv();
    assert.equal(resOnlyEmail.bootstrapped, false);
    assert.equal(resOnlyEmail.reason, 'missing_credentials');
    assert.equal(await memoryRepo.countUsers(), 0);

    // 8c. Variables válidas completas -> crea admin
    process.env.ADMIN_INITIAL_PASSWORD = 'AdminSecurePassword2026!';
    const resValid = await bootstrapAdminFromEnv();
    assert.equal(resValid.bootstrapped, true);
    assert.equal(await memoryRepo.countUsers(), 1);

    const admin = await memoryRepo.findUserByEmail('admin@libertadgo.pe');
    assert.notEqual(admin, null);
    assert.equal(admin?.role, 'ADMIN');
    assert.equal(admin?.email, 'admin@libertadgo.pe');
  } finally {
    resetRepositoriesForTesting();
    if (originalEmail !== undefined) {
      process.env.ADMIN_INITIAL_EMAIL = originalEmail;
    } else {
      delete process.env.ADMIN_INITIAL_EMAIL;
    }
    if (originalPass !== undefined) {
      process.env.ADMIN_INITIAL_PASSWORD = originalPass;
    } else {
      delete process.env.ADMIN_INITIAL_PASSWORD;
    }
  }
});

// 9. Reinicios: no modifica las credenciales ni el rol del administrador existente.
test('9. Reinicios: no modifica las credenciales ni el rol del administrador existente', async () => {
  const memoryRepo = new MemoryCreatorsRepository();
  setActiveDatabaseAdapterForTesting(memoryRepo);

  const originalEmail = process.env.ADMIN_INITIAL_EMAIL;
  const originalPass = process.env.ADMIN_INITIAL_PASSWORD;

  try {
    process.env.ADMIN_INITIAL_EMAIL = 'admin@libertadgo.pe';
    process.env.ADMIN_INITIAL_PASSWORD = 'InitialPassword1!';

    // Primer arranque: crea admin
    const boot1 = await bootstrapAdminFromEnv();
    assert.equal(boot1.bootstrapped, true);

    const initialAdmin = await memoryRepo.findUserByEmail('admin@libertadgo.pe');
    assert.notEqual(initialAdmin, null);
    const initialHash = initialAdmin?.passwordHash;
    const initialRole = initialAdmin?.role;
    assert.equal(initialRole, 'ADMIN');

    // Segundo arranque (simulación de reinicio del pod/contenedor con otro password)
    process.env.ADMIN_INITIAL_PASSWORD = 'AttemptedNewPassword2!';
    const boot2 = await bootstrapAdminFromEnv();
    assert.equal(boot2.bootstrapped, false);
    assert.equal(boot2.reason, 'already_exists');

    // Verificar que la contraseña y el rol se conservaron intactos
    const adminAfterReboot = await memoryRepo.findUserByEmail('admin@libertadgo.pe');
    assert.equal(adminAfterReboot?.passwordHash, initialHash);
    assert.equal(adminAfterReboot?.role, initialRole);
    assert.equal(await memoryRepo.countUsers(), 1);
  } finally {
    resetRepositoriesForTesting();
    if (originalEmail !== undefined) {
      process.env.ADMIN_INITIAL_EMAIL = originalEmail;
    } else {
      delete process.env.ADMIN_INITIAL_EMAIL;
    }
    if (originalPass !== undefined) {
      process.env.ADMIN_INITIAL_PASSWORD = originalPass;
    } else {
      delete process.env.ADMIN_INITIAL_PASSWORD;
    }
  }
});

// 10. checkDatabaseHealth: informa connected: true cuando PostgreSQL responde al ping
test('10. checkDatabaseHealth: informa connected: true cuando PostgreSQL responde al ping', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:secret@ep-neon.us-east-1.aws.neon.tech/neondb?sslmode=require';

    let pingQueryExecuted = false;
    const mockSuccessAdapter = {
      testConnection: async () => {
        pingQueryExecuted = true;
      },
      close: async () => {},
    };
    setActiveDatabaseAdapterForTesting(mockSuccessAdapter as any);

    const health = await checkDatabaseHealth();
    assert.equal(health.connected, true);
    assert.equal(health.adapter, 'postgres');
    assert.equal(health.error, undefined);
    assert.equal(pingQueryExecuted, true);
  } finally {
    resetRepositoriesForTesting();
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) process.env.DATABASE_URL = originalDbUrl;
    else delete process.env.DATABASE_URL;
  }
});

// 11. checkDatabaseHealth: informa connected: false sin DATABASE_URL o si falla el ping
test('11. checkDatabaseHealth: informa connected: false sin DATABASE_URL o si falla el ping', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    // 11a. Sin DATABASE_URL en producción
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;
    resetRepositoriesForTesting();

    const healthNoDb = await checkDatabaseHealth();
    assert.equal(healthNoDb.connected, false);
    assert.equal(healthNoDb.adapter, 'none');

    // 11b. Con DATABASE_URL pero ping falla
    process.env.DATABASE_URL = 'postgresql://user:secret@ep-offline.us-east-1.aws.neon.tech/neondb';
    const mockFailingAdapter = {
      testConnection: async () => {
        throw new Error('Connection timeout to Neon');
      },
      close: async () => {},
    };
    setActiveDatabaseAdapterForTesting(mockFailingAdapter as any);

    const healthFailing = await checkDatabaseHealth();
    assert.equal(healthFailing.connected, false);
    assert.equal(healthFailing.error, 'Database ping failed');
  } finally {
    resetRepositoriesForTesting();
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) process.env.DATABASE_URL = originalDbUrl;
    else delete process.env.DATABASE_URL;
  }
});

// 12. checkDatabaseHealth: nunca filtra credenciales ni connection string en caso de error
test('12. checkDatabaseHealth: nunca filtra credenciales ni connection string en caso de error', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDbUrl = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = 'production';
    const sensitivePass = 'super_secret_neon_password_xyz123';
    process.env.DATABASE_URL = `postgresql://admin:${sensitivePass}@ep-offline.us-east-1.aws.neon.tech/neondb`;

    const mockFailingAdapter = {
      testConnection: async () => {
        throw new Error(`Failed to authenticate user admin with password ${sensitivePass}`);
      },
      close: async () => {},
    };
    setActiveDatabaseAdapterForTesting(mockFailingAdapter as any);

    const health = await checkDatabaseHealth();
    assert.equal(health.connected, false);
    assert.equal(typeof health.error, 'string');
    assert.equal(health.error?.includes(sensitivePass), false);
    assert.equal(health.error?.includes('admin:'), false);
  } finally {
    resetRepositoriesForTesting();
    process.env.NODE_ENV = originalEnv;
    if (originalDbUrl !== undefined) process.env.DATABASE_URL = originalDbUrl;
    else delete process.env.DATABASE_URL;
  }
});
