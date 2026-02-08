
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

// --- API Routes ---
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

    // 1. Pass API/WS requests to next handlers
    if (url.startsWith('/api') || url.startsWith('/ws')) {
        return next();
    }

    // 2. Prevent serving index.html for missing JS/CSS/Images
    // If it has an extension and isn't .html, assume it's a missing asset -> 404
    // This prevents the "MIME type text/html" error for missing .js files
    if (path.extname(url) && !url.endsWith('.html')) {
        return next(); 
    }

    // 3. Serve index.html for SPA routes (e.g. /dashboard)
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
  console.log('🚀 Serving static assets from dist/...');
  const distPath = path.resolve(__dirname, 'dist');
  
  // 1. Serve Static Assets (JS, CSS, Images)
  app.use(express.static(distPath));

  // 2. Strict 404 for missing assets
  // If a request asks for a file with an extension (e.g. /assets/main.js) and it wasn't found by express.static, return 404.
  // This prevents the server from returning index.html for missing JS files.
  app.use((req, res, next) => {
    if (path.extname(req.path).length > 0) {
      res.status(404).end();
    } else {
      next();
    }
  });

  // 3. SPA Fallback for all other routes (e.g. /dashboard -> index.html)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
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
