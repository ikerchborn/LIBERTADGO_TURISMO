/**
 * Repository Factory & Infrastructure Detector
 * Selects PostgreSQL or Memory Adapter based on environment variables.
 * Enforces strict fail-fast validation in production without credential leaks.
 */

import type { IAuthRepository, ICreatorsRepository } from './interfaces.ts';
import { MemoryCreatorsRepository } from './memoryCreatorsRepository.ts';
import { PostgresCreatorsRepository } from './postgresCreatorsRepository.ts';

let authRepoInstance: IAuthRepository | null = null;
let creatorsRepoInstance: ICreatorsRepository | null = null;
let activeDatabaseAdapter: PostgresCreatorsRepository | MemoryCreatorsRepository | null = null;

export function isValidPostgresUrl(rawUrl: string): boolean {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed.startsWith('postgres://') && !trimmed.startsWith('postgresql://')) {
      return false;
    }
    const parsed = new URL(trimmed);
    return parsed.protocol === 'postgres:' || parsed.protocol === 'postgresql:';
  } catch {
    return false;
  }
}

function getSanitizedHost(databaseUrl: string): string {
  try {
    const parsed = new URL(databaseUrl.trim());
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return 'PostgreSQL Endpoint';
  }
}

export function validateDatabaseConfig(): void {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!databaseUrl) {
      throw new Error(
        '[Storage Architecture] FATAL: DATABASE_URL is missing in production environment. Refusing to start without persistent PostgreSQL.'
      );
    }
    if (!isValidPostgresUrl(databaseUrl)) {
      throw new Error(
        '[Storage Architecture] FATAL: DATABASE_URL has an invalid PostgreSQL format in production environment.'
      );
    }
  }
}

function initializeRepositories(): {
  auth: IAuthRepository;
  creators: ICreatorsRepository;
  adapter: PostgresCreatorsRepository | MemoryCreatorsRepository;
} {
  validateDatabaseConfig();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (databaseUrl) {
    if (!isValidPostgresUrl(databaseUrl)) {
      if (isProduction) {
        throw new Error(
          '[Storage Architecture] FATAL: DATABASE_URL has an invalid PostgreSQL format.'
        );
      } else {
        console.warn(
          '[Storage Architecture] WARNING: DATABASE_URL provided is not a valid PostgreSQL URL. Falling back to development In-Memory Adapter.'
        );
      }
    } else {
      const sanitized = getSanitizedHost(databaseUrl);
      console.log(`[Storage Architecture] Activating PostgreSQL RDBMS adapter (${sanitized}).`);
      const postgresAdapter = new PostgresCreatorsRepository(databaseUrl);
      return {
        auth: postgresAdapter,
        creators: postgresAdapter,
        adapter: postgresAdapter,
      };
    }
  }

  // Development Fallback
  if (isProduction) {
    throw new Error(
      '[Storage Architecture] FATAL: Silent in-memory fallback is strictly forbidden in production.'
    );
  }

  console.log(
    '[Storage Architecture] DATABASE_URL is not set. Operating in development In-Memory Adapter. All interfaces match PostgreSQL 1:1.'
  );
  const memoryAdapter = new MemoryCreatorsRepository();
  return {
    auth: memoryAdapter,
    creators: memoryAdapter,
    adapter: memoryAdapter,
  };
}

export function getAuthRepository(): IAuthRepository {
  if (!authRepoInstance) {
    const initialized = initializeRepositories();
    authRepoInstance = initialized.auth;
    creatorsRepoInstance = initialized.creators;
    activeDatabaseAdapter = initialized.adapter;
  }
  return authRepoInstance;
}

export function getCreatorsRepository(): ICreatorsRepository {
  if (!creatorsRepoInstance) {
    const initialized = initializeRepositories();
    authRepoInstance = initialized.auth;
    creatorsRepoInstance = initialized.creators;
    activeDatabaseAdapter = initialized.adapter;
  }
  return creatorsRepoInstance;
}

export async function verifyDatabaseConnectivity(): Promise<void> {
  // Ensure repositories are initialized
  getCreatorsRepository();
  if (activeDatabaseAdapter && typeof activeDatabaseAdapter.testConnection === 'function') {
    await activeDatabaseAdapter.testConnection();
    console.log('[Storage Architecture] Database connectivity verified successfully.');
  }
}

export async function closeDatabaseConnections(): Promise<void> {
  if (activeDatabaseAdapter && typeof activeDatabaseAdapter.close === 'function') {
    await activeDatabaseAdapter.close();
    console.log('[Storage Architecture] Database connections closed cleanly.');
  }
}

export type { IAuthRepository, ICreatorsRepository };
