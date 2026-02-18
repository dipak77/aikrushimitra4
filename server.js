
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

// API Key Logic
const cleanKey = (key) => key ? key.trim().replace(/^["']|["']$/g, '') : '';
const RAW_API_KEY = process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const API_KEY = cleanKey(RAW_API_KEY);

// Environment Detection
const isProduction = process.env.NODE_ENV === 'production';

// --- CENTRAL ANALYTICS STORE ---
// Persistence file path
const DATA_DIR = path.join(__dirname, 'data_store');
const LOG_FILE = path.join(DATA_DIR, 'activity_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create data dir:", e);
  }
}

// In-memory store backed by file
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
    console.error("❌ Failed to load logs from disk:", e.message);
  }
}

// Helper to persist logs (Throttled/Debounced could be added here for high traffic)
const saveLogsToDisk = () => {
  try {
    fs.writeFile(LOG_FILE, JSON.stringify(GLOBAL_ACTIVITY_LOGS, null, 2), (err) => {
      if (err) console.error("Error writing logs:", err);
    });
  } catch (e) {
    console.error("Sync write error:", e);
  }
};

console.log('🚀 Starting server...');
console.log('📍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

// Middleware
app.use((req, res, next) => {
  if (isProduction && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // Prevent Caching for API routes
  res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.removeHeader("X-Powered-By");
  next();
});

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    apiKeyConfigured: !!API_KEY,
    environment: isProduction ? 'production' : 'development',
    logsCount: GLOBAL_ACTIVITY_LOGS.length,
    timestamp: new Date().toISOString()
  });
});

// AI Client Factory
const getAIClient = () => {
  if (!API_KEY) {
    console.error('❌ CRITICAL: API_KEY not found in environment');
    throw new Error("API_KEY not configured on server");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- ACTIVITY ROUTES ---
// Defined with both names to prevent 404s if client/server versions mismatch

const handleLogActivity = (req, res) => {
  try {
    const logData = req.body;
    
    // Enrich with server-side details for better tracking
    const enrichedLog = {
      ...logData,
      serverTimestamp: Date.now(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: logData.userAgent || req.headers['user-agent']
    };

    // Add to beginning, keep limit
    GLOBAL_ACTIVITY_LOGS.unshift(enrichedLog);
    if (GLOBAL_ACTIVITY_LOGS.length > MAX_LOGS) {
      GLOBAL_ACTIVITY_LOGS.pop();
    }
    
    // Persist to disk
    saveLogsToDisk();

    res.status(200).json({ success: true });
  } catch (e) {
    console.error("Activity Write Error:", e);
    res.status(500).json({ error: "Failed to log activity" });
  }
};

const handleGetStats = (req, res) => {
  res.json(GLOBAL_ACTIVITY_LOGS);
};

// Register endpoints (both new 'activity' and legacy 'analytics')
// Using separate calls to ensure registration
app.post('/api/activity/log', handleLogActivity);
app.post('/api/analytics/log', handleLogActivity);

app.get('/api/activity/stats', handleGetStats);
app.get('/api/analytics/stats', handleGetStats);


// --- AI API Routes ---
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: { systemInstruction }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat API Error:", error.message);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

app.post('/api/vision', async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: prompt }
        ]
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Vision API Error:", error.message);
    res.status(500).json({ error: "Failed to analyze image." });
  }
});

app.post('/api/updates', async (req, res) => {
  try {
    const { prompt } = req.body;
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Updates API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch updates." });
  }
});

// --- API 404 Catch-All ---
// Prevents API requests from falling through to Vite/React router
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// --- Server & WebSocket Setup ---
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ 
  server, 
  path: '/ws/live',
  maxPayload: 20 * 1024 * 1024
});

// --- Frontend Serving Logic ---

if (!isProduction) {
  // DEVELOPMENT: Use Vite Middleware
  console.log('🔧 Initializing Vite middleware for hot-reloading...');
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { 
      middlewareMode: true, 
      hmr: { server }
    },
    appType: 'custom',
  });
  
  app.use(vite.middlewares);

  // Dev SPA Fallback
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    if (url.startsWith('/api') || url.startsWith('/ws')) {
        return next();
    }

    if (path.extname(url) && !url.endsWith('.html')) {
        return next(); 
    }

    try {
      const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

} else {
  // PRODUCTION: Serve Built Assets
  const distPath = path.resolve(__dirname, 'dist');
  console.log(`🚀 Serving static assets from: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
      console.error("❌ ERROR: 'dist' directory not found. Did you run 'npm run build'?");
  }

  // Helper to serve index.html with API key injection
  const serveIndexWithInjection = (req, res) => {
    const indexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      // Inject API Key into window.ENV for frontend to use
      if (API_KEY) {
        html = html.replace(
          '</head>', 
          `<script>window.ENV = { API_KEY: "${API_KEY}" };</script></head>`
        );
      }
      
      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } else {
      res.status(404).send('Index not found');
    }
  };

  // 1. Serve Static Assets (exclude index.html to allow injection)
  app.use(express.static(distPath, { index: false }));

  // 2. Strict 404 for missing assets (files with extensions)
  app.use((req, res, next) => {
    if (path.extname(req.path).length > 0) {
      res.status(404).end();
    } else {
      next();
    }
  });

  // 3. Serve Root and SPA Fallback with Injection
  app.get('/', serveIndexWithInjection);
  app.get('/index.html', serveIndexWithInjection);
  app.get('*', serveIndexWithInjection);
}

// --- WebSocket Logic ---
wss.on('connection', async (clientWs) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  console.log(`🔗 NEW CONNECTION: ${clientId}`);
  
  if (!API_KEY) {
    clientWs.send(JSON.stringify({ error: 'Config Error', message: 'API_KEY missing on server' }));
    clientWs.close(1008);
    return;
  }
  
  let ai = getAIClient();
  let session = null;

  clientWs.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      
      if (parsed.type === 'setup') {
        const config = parsed.config || {};
        session = await ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: { 
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Puck' } } },
            systemInstruction: { parts: [{ text: config.systemInstruction || 'You are a helpful assistant.' }] },
            ...(config.enableInputTranscription && { inputAudioTranscription: {} }),
            ...(config.enableOutputTranscription && { outputAudioTranscription: {} })
          },
          callbacks: {
            onopen: () => clientWs.send(JSON.stringify({ type: 'setup_complete' })),
            onmessage: (msg) => clientWs.send(JSON.stringify(msg)),
            onclose: () => clientWs.close(1000),
            onerror: (err) => {
                console.error("Gemini Error:", err);
                clientWs.send(JSON.stringify({ error: 'AI Error', message: err.message }));
            }
          }
        });
        return;
      }

      if (parsed.realtimeInput && session) {
        session.sendRealtimeInput(parsed.realtimeInput);
      }
    } catch (e) {
      console.error(`❌ ${clientId}: Error`, e.message);
    }
  });

  clientWs.on('close', () => {
    if (session) session.close(); 
    console.log(`🔌 ${clientId}: Disconnected`);
  });
});

process.on('SIGINT', () => {
  wss.clients.forEach(client => client.close());
  server.close(() => process.exit(0));
});
