
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for parsing JSON bodies
app.use(express.json());

const getApiKey = () => process.env.API_KEY || '';
const isProduction = process.env.NODE_ENV === 'production';

// --- LOGGING SYSTEM ---
const LOGS_FILE = path.resolve(__dirname, 'server_logs.json');

const getLogs = () => {
  if (!fs.existsSync(LOGS_FILE)) return [];
  try {
    const data = fs.readFileSync(LOGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveLogs = (logs) => {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs.slice(0, 5000), null, 2));
  } catch (e) {
    console.error('Failed to write logs', e);
  }
};

// --- API ENDPOINTS ---

// Track user activity
app.post('/api/analytics/track', (req, res) => {
  const log = req.body;
  if (!log.view) return res.status(400).send('Invalid log');

  const logs = getLogs();
  const enhancedLog = {
    ...log,
    id: log.id || Math.random().toString(36).substr(2, 9),
    serverTimestamp: Date.now(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  };

  logs.unshift(enhancedLog);
  saveLogs(logs);
  res.status(200).json({ success: true });
});

// Fetch activity stats
app.get('/api/analytics/stats', (req, res) => {
  const logs = getLogs();
  res.json(logs);
});

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
    console.log(`Analytics active. Logs saved to: ${LOGS_FILE}`);
  });
}

startServer();
