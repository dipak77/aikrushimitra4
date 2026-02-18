import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// =============================================================================
// API KEY SETUP
// =============================================================================
const cleanKey = (key) => key ? key.trim().replace(/^["']|["']$/g, '') : '';
const RAW_API_KEY = process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const API_KEY = cleanKey(RAW_API_KEY);

// Environment Detection
const isProduction = process.env.NODE_ENV === 'production';

// =============================================================================
// PERSISTENCE SETUP
// =============================================================================
const DATA_DIR = path.join(__dirname, 'data_store');
const LOG_FILE = path.join(DATA_DIR, 'activity_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created data directory: ${DATA_DIR}`);
  } catch (e) {
    console.error('❌ Failed to create data dir:', e);
  }
}

// In-memory store
let GLOBAL_ACTIVITY_LOGS = [];
const MAX_LOGS = 5000;

// Load logs on startup
if (fs.existsSync(LOG_FILE)) {
  try {
    const fileData = fs.readFileSync(LOG_FILE, 'utf8');
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed)) {
      GLOBAL_ACTIVITY_LOGS = parsed;
      console.log(`📂 Loaded ${GLOBAL_ACTIVITY_LOGS.length} activity logs from disk.`);
    }
  } catch (e) {
    console.error('❌ Failed to load logs from disk:', e.message);
    // Backup corrupted file and start fresh
    try {
      fs.renameSync(LOG_FILE, `${LOG_FILE}.corrupt_${Date.now()}`);
      console.warn('⚠️ Corrupted log file backed up. Starting fresh.');
    } catch (backupErr) {
      console.error('❌ Could not backup corrupted log file:', backupErr.message);
    }
  }
}

// Debounced save - prevents hammering disk on rapid log writes
let saveTimeout = null;
const saveLogsToDisk = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFile(
        LOG_FILE,
        JSON.stringify(GLOBAL_ACTIVITY_LOGS, null, 2),
        'utf8',
        (err) => {
          if (err) console.error('❌ Error writing logs to disk:', err.message);
        }
      );
    } catch (e) {
      console.error('❌ Sync write error:', e.message);
    }
  }, 500); // Wait 500ms before writing to batch rapid requests
};

// =============================================================================
// STARTUP LOGS
// =============================================================================
console.log('🚀 Starting server...');
console.log(`📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`🔑 API Key configured: ${API_KEY ? '✅ YES' : '❌ NO'}`);
if (!API_KEY) {
  console.error('❌ CRITICAL: No API key found! Check API_KEY / GOOGLE_API_KEY / GEMINI_API_KEY env vars.');
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

// HTTPS Redirect (Production only)
app.use((req, res, next) => {
  if (isProduction && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// CORS & Cache Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  res.removeHeader('X-Powered-By');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Body Parser
app.use(express.json({ limit: '10mb' }));

// Request Logger (Development only)
if (!isProduction) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`📥 ${req.method} ${req.path}`);
    }
    next();
  });
}

// =============================================================================
// AI CLIENT FACTORY
// =============================================================================
const getAIClient = () => {
  if (!API_KEY) {
    throw new Error('API_KEY not configured on server. Check environment variables.');
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// =============================================================================
// HEALTH CHECK
// =============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!API_KEY,
    environment: isProduction ? 'production' : 'development',
    logsCount: GLOBAL_ACTIVITY_LOGS.length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// ACTIVITY / ANALYTICS ROUTES
// =============================================================================

const handleLogActivity = (req, res) => {
  try {
    const logData = req.body;

    // Validate minimum required fields
    if (!logData || typeof logData !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    if (!logData.sessionId) {
      return res.status(400).json({ error: 'Missing required field: sessionId' });
    }

    if (!logData.userEmail) {
      return res.status(400).json({ error: 'Missing required field: userEmail' });
    }

    // FIX: Parse IP correctly for multi-proxy environments
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ip = rawIp.split(',')[0].trim();

    const enrichedLog = {
      ...logData,
      serverTimestamp: Date.now(),   // Authoritative server time
      ip,
      userAgent: logData.userAgent || req.headers['user-agent'] || 'unknown'
    };

    // Add to beginning of array (newest first), trim if over limit
    GLOBAL_ACTIVITY_LOGS.unshift(enrichedLog);
    if (GLOBAL_ACTIVITY_LOGS.length > MAX_LOGS) {
      GLOBAL_ACTIVITY_LOGS.pop();
    }

    saveLogsToDisk();

    return res.status(200).json({ success: true, id: logData.id });
  } catch (e) {
    console.error('❌ Activity Write Error:', e.message);
    return res.status(500).json({ error: 'Failed to log activity', details: e.message });
  }
};

const handleGetStats = (req, res) => {
  try {
    // FIX: Explicit Content-Type to prevent SPA fallback returning HTML
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(GLOBAL_ACTIVITY_LOGS);
  } catch (e) {
    console.error('❌ Stats Read Error:', e.message);
    return res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};

// Register both new and legacy endpoints
app.post('/api/activity/log', handleLogActivity);
app.post('/api/analytics/log', handleLogActivity);

app.get('/api/activity/stats', handleGetStats);
app.get('/api/analytics/stats', handleGetStats);

// =============================================================================
// AI ROUTES
// =============================================================================

// --- Chat ---
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    const ai = getAIClient();

    const requestConfig = {};
    if (systemInstruction) {
      requestConfig.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      ...(Object.keys(requestConfig).length > 0 && { config: requestConfig })
    });

    return res.json({ text: response.text });
  } catch (error) {
    console.error('❌ Chat API Error:', error.message);
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({ error: 'API key invalid or not configured.' });
    }
    return res.status(500).json({ error: 'Failed to generate response.', details: error.message });
  }
});

// --- Vision ---
app.post('/api/vision', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing required field: imageBase64' });
    }

    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          {
            inlineData: {
              // FIX: Allow dynamic mimeType instead of hardcoding jpeg
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    return res.json({ text: response.text });
  } catch (error) {
    console.error('❌ Vision API Error:', error.message);
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({ error: 'API key invalid or not configured.' });
    }
    return res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
  }
});

// --- Updates (with Google Search grounding) ---
// FIX: This was causing 500 errors due to:
//   1. responseMimeType: "application/json" is incompatible with googleSearch tool
//   2. No fallback when search grounding fails
//   3. response.text may not be valid JSON when using grounding
app.post('/api/updates', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    const ai = getAIClient();

    // FIX: Remove responseMimeType when using googleSearch tool.
    // Google Search grounding is incompatible with forced JSON mime type.
    // The model returns plain text/markdown with citations when grounding is active.
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
        // ❌ REMOVED: responseMimeType: "application/json"
        // Reason: Grounding tool responses are NOT valid JSON.
        // Forcing JSON mime type causes the API to return 500/invalid response.
      }
    });

    // FIX: response.text is a string (possibly markdown).
    // Try to parse as JSON if client expects it, otherwise wrap it.
    const rawText = response.text || '';

    // Attempt to extract JSON if model wrapped response in markdown code block
    let parsedData = null;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[1].trim());
      } catch {
        // Not valid JSON inside code block - that's fine
      }
    }

    // If no JSON block found, try parsing the raw text directly
    if (!parsedData) {
      try {
        parsedData = JSON.parse(rawText.trim());
      } catch {
        // Not JSON - return as plain text wrapped in object
        parsedData = null;
      }
    }

    // Return both raw text and parsed data (if available)
    return res.json({
      text: rawText,
      data: parsedData,
      // Include grounding metadata if available
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });

  } catch (error) {
    console.error('❌ Updates API Error:', error.message);

    // FIX: Specific error messages for common failures
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return res.status(401).json({
        error: 'API key invalid or not configured.',
        details: error.message
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later.',
        details: error.message
      });
    }

    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return res.status(404).json({
        error: 'AI model not found. Check model name.',
        details: error.message
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch updates.',
      details: error.message
    });
  }
});

// =============================================================================
// API 404 CATCH-ALL
// Must be AFTER all API routes, BEFORE static file serving
// =============================================================================
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.path,
    method: req.method
  });
});

// =============================================================================
// SERVER & WEBSOCKET SETUP
// =============================================================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 URL: ${isProduction ? 'https' : 'http'}://localhost:${PORT}`);
});

const wss = new WebSocketServer({
  server,
  path: '/ws/live',
  maxPayload: 20 * 1024 * 1024 // 20MB
});

// =============================================================================
// FRONTEND SERVING
// =============================================================================

if (!isProduction) {
  // DEVELOPMENT: Vite Middleware
  console.log('🔧 Initializing Vite middleware...');

  try {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: { server }
      },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    // Dev SPA Fallback
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;

      if (url.startsWith('/api') || url.startsWith('/ws')) return next();

      // Skip requests for static assets
      const ext = path.extname(url);
      if (ext && ext !== '.html') return next();

      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        if (!fs.existsSync(templatePath)) {
          return res.status(404).send('index.html not found');
        }
        const template = fs.readFileSync(templatePath, 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

  } catch (e) {
    console.error('❌ Failed to initialize Vite middleware:', e.message);
  }

} else {
  // PRODUCTION: Serve Built Assets
  const distPath = path.resolve(__dirname, 'dist');
  console.log(`🚀 Serving static assets from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error("❌ ERROR: 'dist' directory not found. Run 'npm run build' first.");
  }

  // Helper: Serve index.html with API key injection
  const serveIndexWithInjection = (req, res) => {
    const indexPath = path.resolve(distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send('Application not built. Run npm run build.');
    }

    try {
      let html = fs.readFileSync(indexPath, 'utf-8');

      // Inject ENV variables for frontend
      const envScript = `<script>
        window.ENV = {
          API_KEY: ${API_KEY ? `"${API_KEY}"` : 'null'}
        };
      </script>`;

      html = html.replace('</head>', `${envScript}</head>`);

      return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (e) {
      console.error('❌ Error serving index.html:', e.message);
      return res.status(500).send('Failed to load application.');
    }
  };

  // Serve static files (JS, CSS, images etc.) - exclude index.html
  app.use(express.static(distPath, { index: false }));

  // Return 404 for missing static assets (files with extensions)
  app.use((req, res, next) => {
    const ext = path.extname(req.path);
    if (ext.length > 0 && ext !== '.html') {
      return res.status(404).end();
    }
    next();
  });

  // SPA Fallback - serve index.html for all non-asset routes
  app.get('/', serveIndexWithInjection);
  app.get('/index.html', serveIndexWithInjection);
  app.get('*', serveIndexWithInjection);
}

// =============================================================================
// WEBSOCKET LOGIC
// =============================================================================
wss.on('connection', async (clientWs, req) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  console.log(`🔗 WS Connected: ${clientId} from ${clientIp}`);

  if (!API_KEY) {
    clientWs.send(JSON.stringify({
      type: 'error',
      error: 'Config Error',
      message: 'API_KEY missing on server'
    }));
    clientWs.close(1008, 'Missing API Key');
    return;
  }

  let ai = getAIClient();
  let session = null;
  let isAlive = true;

  // Heartbeat to detect dead connections
  const heartbeat = setInterval(() => {
    if (!isAlive) {
      console.log(`💀 WS ${clientId}: No heartbeat, terminating.`);
      clearInterval(heartbeat);
      clientWs.terminate();
      return;
    }
    isAlive = false;
    clientWs.ping();
  }, 30000);

  clientWs.on('pong', () => { isAlive = true; });

  clientWs.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      // --- SETUP ---
      if (parsed.type === 'setup') {
        if (session) {
          // Close existing session before creating new one
          try { session.close(); } catch (e) { /* ignore */ }
          session = null;
        }

        const config = parsed.config || {};
        console.log(`⚙️ WS ${clientId}: Setting up session with voice: ${config.voiceName || 'Puck'}`);

        try {
          session = await ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: config.voiceName || 'Puck'
                  }
                }
              },
              systemInstruction: {
                parts: [{
                  text: config.systemInstruction || 'You are a helpful assistant.'
                }]
              },
              ...(config.enableInputTranscription && { inputAudioTranscription: {} }),
              ...(config.enableOutputTranscription && { outputAudioTranscription: {} })
            },
            callbacks: {
              onopen: () => {
                console.log(`✅ WS ${clientId}: Gemini session opened`);
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'setup_complete' }));
                }
              },
              onmessage: (msg) => {
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify(msg));
                }
              },
              onclose: (evt) => {
                console.log(`🔒 WS ${clientId}: Gemini session closed`, evt?.code);
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.close(1000, 'Gemini session closed');
                }
              },
              onerror: (err) => {
                console.error(`❌ WS ${clientId}: Gemini error:`, err?.message || err);
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify({
                    type: 'error',
                    error: 'AI Error',
                    message: err?.message || 'Unknown Gemini error'
                  }));
                }
              }
            }
          });
        } catch (setupErr) {
          console.error(`❌ WS ${clientId}: Session setup failed:`, setupErr.message);
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              error: 'Setup Failed',
              message: setupErr.message
            }));
          }
        }
        return;
      }

      // --- REALTIME INPUT ---
      if (parsed.realtimeInput) {
        if (!session) {
          console.warn(`⚠️ WS ${clientId}: Received audio before setup complete`);
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              error: 'Not Ready',
              message: 'Session not initialized. Send setup first.'
            }));
          }
          return;
        }
        session.sendRealtimeInput(parsed.realtimeInput);
      }

    } catch (e) {
      console.error(`❌ WS ${clientId}: Message parse error:`, e.message);
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: 'Parse Error',
          message: 'Invalid message format. Expected JSON.'
        }));
      }
    }
  });

  clientWs.on('close', (code, reason) => {
    clearInterval(heartbeat);
    if (session) {
      try { session.close(); } catch (e) { /* ignore */ }
      session = null;
    }
    console.log(`🔌 WS ${clientId}: Disconnected (code: ${code}, reason: ${reason?.toString() || 'none'})`);
  });

  clientWs.on('error', (err) => {
    console.error(`❌ WS ${clientId}: Socket error:`, err.message);
    clearInterval(heartbeat);
    if (session) {
      try { session.close(); } catch (e) { /* ignore */ }
      session = null;
    }
  });
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

  // Save logs synchronously before exit
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(GLOBAL_ACTIVITY_LOGS, null, 2), 'utf8');
    console.log('💾 Logs saved to disk.');
  } catch (e) {
    console.error('❌ Failed to save logs on shutdown:', e.message);
  }

  // Close all WebSocket connections
  wss.clients.forEach(client => {
    try { client.close(1001, 'Server shutting down'); } catch (e) { /* ignore */ }
  });

  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error('❌ Forced exit after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught errors to prevent server crash
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});