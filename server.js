import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Helper to get API Key safely - REMOVED LEAKED KEY FALLBACK
const getApiKey = () => process.env.API_KEY || '';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    // Development: Use Vite middleware
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa', 
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static assets
    console.log("Starting in PRODUCTION mode serving ./dist folder...");
    
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

    // Intercept requests to index.html to inject Env Vars
    app.get('*', (req, res) => {
      const indexPath = path.resolve(__dirname, 'dist', 'index.html');
      
      fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        if (err) {
          console.error('Error reading index.html', err);
          return res.status(500).send('Error loading app');
        }

        // Inject the API KEY into the window.ENV object
        // This replaces the placeholder or empty string in index.html
        const injectedHtml = htmlData.replace(
          'API_KEY: ""',
          `API_KEY: "${getApiKey()}"`
        );

        res.send(injectedHtml);
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();