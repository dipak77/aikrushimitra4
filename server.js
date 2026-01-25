import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

const getApiKey = () => process.env.API_KEY || '';
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  // 1️⃣ Serve public assets (videos, images) ALWAYS
  app.use(
    express.static(path.resolve(__dirname, 'public'), {
      setHeaders(res, filePath) {
        if (filePath.endsWith('.mp4')) {
          res.setHeader('Content-Type', 'video/mp4');
          res.setHeader('Accept-Ranges', 'bytes');
        }
      },
    })
  );

  if (!isProduction) {
    // 2️⃣ Development: Vite middleware
    console.log('Starting in DEVELOPMENT mode with Vite Middleware...');
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // 3️⃣ Production: Serve dist
    console.log('Starting in PRODUCTION mode serving ./dist folder...');
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

    // 4️⃣ SPA fallback with env injection
    app.get('*', (req, res) => {
      const indexPath = path.resolve(__dirname, 'dist', 'index.html');

      fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        if (err) {
          console.error('Error reading index.html', err);
          return res.status(500).send('Error loading app');
        }

        const injectedHtml = htmlData.replace(
          'API_KEY: ""',
          `API_KEY: "${getApiKey()}"`
        );

        res.send(injectedHtml);
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();