
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Security: Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security: CORS & Headers
app.use((req, res, next) => {
  // Allow same origin
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.removeHeader("X-Powered-By"); // Hide server info
  next();
});

// Parse JSON bodies (increased limit for images)
app.use(express.json({ limit: '10mb' }));

// --- SECURE GEMINI PROXY ENDPOINTS ---

const getAIClient = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("Server API_KEY not configured");
  return new GoogleGenAI({ apiKey: key });
};

// 1. Text/Chat Generation Proxy
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction }
    });
    
    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// 2. Vision/Image Analysis Proxy
app.post('/api/vision', async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;
    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: prompt }
        ]
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Vision API Error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

// 3. Live Updates (Search Grounding) Proxy
app.post('/api/updates', async (req, res) => {
  try {
    const { prompt } = req.body;
    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Updates API Error:", error);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

// --- ASSET SERVING ---

const isProduction = process.env.NODE_ENV === 'production';

// 1. Serve public assets (videos, images)
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
  // 2. Development: Vite middleware
  console.log('Starting in DEVELOPMENT mode with Vite Middleware...');
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // 3. Production: Serve dist
  console.log('Starting in PRODUCTION mode serving ./dist folder...');
  app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

  // 4. SPA fallback (No Key Injection anymore!)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
