import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Determine environment
// Cloud Run sets NODE_ENV=production automatically.
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    // Development: Use Vite middleware for Hot Module Replacement (HMR)
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa', 
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static assets built by 'npm run build'
    console.log("Starting in PRODUCTION mode serving ./dist folder...");
    
    // Serve static files from the dist directory
    app.use(express.static(path.resolve(__dirname, 'dist')));

    // SPA Fallback: For any route not handled by static files, send index.html
    // This allows React Router to handle client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();