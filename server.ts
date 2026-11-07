import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Server } from 'http';
import { apiRouter } from './src/server/routes.ts';
import { bootstrapAdminFromEnv, validateSecurityConfig } from './src/server/authService.ts';
import {
  validateDatabaseConfig,
  verifyDatabaseConnectivity,
  closeDatabaseConnections,
} from './src/server/repositories/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isShuttingDown = false;

function registerGracefulShutdown(server: Server): void {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      console.log(`[LibertadGO] Shutdown already in progress. Signal ${signal} ignored.`);
      return;
    }
    isShuttingDown = true;
    console.log(`[LibertadGO] Received ${signal}. Initiating graceful shutdown...`);

    // Safety timer: force exit if termination takes longer than 10 seconds
    const forcedTimeout = setTimeout(() => {
      console.error('[LibertadGO] Graceful shutdown timed out after 10s. Forcing exit.');
      process.exit(1);
    }, 10000);
    forcedTimeout.unref();

    try {
      // 1. Stop accepting new incoming HTTP connections
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log('[LibertadGO] HTTP server stopped accepting new requests.');
          resolve();
        });
      });

      // 2. Gracefully close persistent PostgreSQL connection pool
      await closeDatabaseConnections();

      console.log('[LibertadGO] Graceful shutdown completed cleanly.');
      clearTimeout(forcedTimeout);
      process.exit(0);
    } catch (err) {
      console.error('[LibertadGO] Error during graceful shutdown:', err);
      clearTimeout(forcedTimeout);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

async function startServer() {
  const app = express();

  // Cloud Run proporciona PORT automáticamente.
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';

  let configError: string | null = null;

  try {
    // 1. Fail-fast security and database configuration checks
    validateSecurityConfig();
    validateDatabaseConfig();

    // 2. Verify database connectivity before declaring server ready
    await verifyDatabaseConnectivity();

    // 3. Bootstrap initial admin if environment variables are provided
    await bootstrapAdminFromEnv();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    configError = errorMsg;
    console.error(`[LibertadGO Configuration Alert] ${errorMsg}`);
    console.warn(
      `[LibertadGO] The server will listen on ${HOST}:${PORT} to maintain Cloud Run service health. Database-dependent endpoints will return 503 until configuration is set.`
    );
  }

  const distPath = path.resolve(__dirname, 'dist');
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    fs.existsSync(path.join(distPath, 'index.html'));

  app.use(express.json());

  // Cloud Run & Uptime health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: configError ? 'degraded' : 'healthy',
      database: configError ? 'not_configured' : 'connected',
      error: configError || null,
      environment: isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // If production security or database configuration is incomplete, protect database endpoints
  if (configError) {
    app.use(['/api/auth', '/api/creators', '/api/admin'], (_req, res) => {
      res.status(503).json({
        success: false,
        error: 'Servicio no disponible: configuración de producción incompleta en Cloud Run.',
        detail: configError,
      });
    });
  }

  // API Router (destinations, places, and catalog routes remain accessible)
  app.use('/api', apiRouter);

  // Archivos públicos
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (isProduction) {
    // Frontend compilado por Vite
    app.use(express.static(distPath));

    // Rutas de React
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Servidor de desarrollo Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(
      `[LibertadGO] Server running on ${HOST}:${PORT}`
    );
    console.log(
      `[LibertadGO] Environment: ${isProduction ? 'production' : 'development'}`
    );
    if (configError) {
      console.warn(
        `[LibertadGO] Running in setup/catalog-only mode due to missing production configuration.`
      );
    }
  });

  // 4. Register orderly shutdown handlers for Cloud Run SIGTERM / SIGINT
  registerGracefulShutdown(server);
}

startServer().catch((err) => {
  console.error('[LibertadGO] Failed to start server:', err?.message || err);
  process.exit(1);
});
