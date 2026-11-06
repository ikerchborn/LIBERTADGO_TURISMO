
import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Cloud Run proporciona PORT automáticamente.
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';

  const distPath = path.resolve(__dirname, 'dist');
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    fs.existsSync(path.join(distPath, 'index.html'));

  app.use(express.json());

  // API
  app.use('/api', apiRouter);

  // Archivos públicos
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');

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

  app.listen(PORT, HOST, () => {
    console.log(
      `[LibertadGO] Server running on ${HOST}:${PORT}`
    );
    console.log(
      `[LibertadGO] Environment: ${isProduction ? 'production' : 'development'}`
    );
  });
}

startServer().catch((err) => {
  console.error('[LibertadGO] Failed to start server:', err);
  process.exit(1);
});
