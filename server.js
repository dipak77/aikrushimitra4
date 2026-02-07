import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

const cleanKey = (key) => key ? key.trim().replace(/^["']|["']$/g, '') : '';
const RAW_API_KEY = process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const API_KEY = cleanKey(RAW_API_KEY);

console.log('🚀 Starting server...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] === 'http') {
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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    apiKeyConfigured: !!API_KEY,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

const getAIClient = () => {
  if (!API_KEY) {
    console.error('❌ CRITICAL: API_KEY not found in environment');
    throw new Error("API_KEY not configured on server");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// API Routes
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

// Server & WebSocket Setup
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ 
  server, 
  path: '/ws/live',
  maxPayload: 20 * 1024 * 1024
});

// Configure Frontend Serving
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log('🔧 Starting in DEVELOPMENT mode with Vite...');
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { 
      middlewareMode: true, 
      hmr: { server }
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  console.log('🚀 Starting in PRODUCTION mode...');
  const distPath = path.resolve(__dirname, 'dist');
  
  // 1. Serve Static Assets
  app.use(express.static(distPath));

  // 2. IMPORTANT: Return 404 for missing assets (files with dots in name)
  // This prevents the SPA fallback from serving index.html for missing .js/.css files
  // which causes the "MIME type text/html" error.
  app.use((req, res, next) => {
    if (path.extname(req.path).length > 0) {
      res.status(404).end();
    } else {
      next();
    }
  });

  // 3. SPA Fallback for routes (no extension)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// WebSocket Logic
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
        // Initialize Gemini Session
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