import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// CRITICAL: Log environment on startup
console.log('🚀 Starting server...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 API_KEY present:', !!process.env.API_KEY);
console.log('🔑 API_KEY length:', process.env.API_KEY?.length || 0);
console.log('🔌 PORT:', PORT);

// Security
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
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

// Health check with detailed info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    apiKeyConfigured: !!process.env.API_KEY,
    apiKeyLength: process.env.API_KEY?.length || 0,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const getAIClient = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error('❌ CRITICAL: API_KEY not found in environment');
    throw new Error("API_KEY not configured");
  }
  console.log(`✅ Creating AI client with key: ${key.substring(0, 10)}...`);
  return new GoogleGenAI({ apiKey: key });
};

// Text chat endpoint
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
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Vision endpoint
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
    console.error("Vision API Error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

// Updates endpoint
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
    console.error("Updates API Error:", error);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

const isProduction = process.env.NODE_ENV === 'production';

// Serve public assets
app.use(express.static(path.resolve(__dirname, 'public')));

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🎤 WebSocket endpoint: /ws/live`);
});

// WebSocket Server with EXTENSIVE logging
const wss = new WebSocketServer({ 
  server, 
  path: '/ws/live',
  clientTracking: true,
  perMessageDeflate: false,
  maxPayload: 10 * 1024 * 1024 // 10MB
});

console.log('🔌 WebSocket server created');

wss.on('connection', async (clientWs, req) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔗 NEW CONNECTION: ${clientId}`);
  console.log(`📍 Client IP: ${clientIp}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  let ai = null;
  let session = null;
  let isGeminiConnected = false;
  let connectionStartTime = Date.now();

  const sendToClient = (data) => {
    if (clientWs.readyState === clientWs.OPEN) {
      try {
        clientWs.send(JSON.stringify(data));
      } catch (e) {
        console.error(`❌ ${clientId}: Send error:`, e.message);
      }
    }
  };

  try {
    // Step 1: Verify API key
    console.log(`🔑 ${clientId}: Checking API key...`);
    ai = getAIClient();
    console.log(`✅ ${clientId}: AI client created`);
    
    sendToClient({ type: 'proxy_ready', message: 'Proxy initialized' });

    // Step 2: Connect to Gemini with detailed logging
    console.log(`⏳ ${clientId}: Connecting to Gemini Live API...`);
    console.log(`📊 ${clientId}: Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    
    const connectStartTime = Date.now();
    
    try {
      session = await Promise.race([
        ai.live.connect({
          model: 'gemini-2.0-flash-exp',
          config: { 
            responseModalities: ['AUDIO'],
            speechConfig: { 
              voiceConfig: { 
                prebuiltVoiceConfig: { 
                  voiceName: 'Kore'
                } 
              } 
            },
            systemInstruction: {
              parts: [{
                text: `You are AI Krushi Mitra (AI कृषी मित्र), a helpful agricultural assistant for farmers in Maharashtra, India. 

Your role:
- Provide farming advice in Marathi, Hindi, or English based on user's language
- Help with crop management, pest control, weather guidance, market prices
- Be concise, practical, and encouraging
- Use simple language that farmers can understand
- Speak naturally in a conversational tone

Keep responses short (2-3 sentences) unless asked for detailed information.`
              }]
            }
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini connection timeout after 45 seconds')), 45000)
        )
      ]);

      const connectDuration = Date.now() - connectStartTime;
      console.log(`✅ ${clientId}: Connected to Gemini in ${connectDuration}ms`);
      
      isGeminiConnected = true;
      sendToClient({ setupComplete: true });

      // Handle Gemini messages
      session.on('message', (msg) => {
        try {
          sendToClient(msg);
          if (msg.serverContent?.modelTurn) {
            console.log(`🤖 ${clientId}: Model response received`);
          }
        } catch (e) {
          console.error(`❌ ${clientId}: Error forwarding:`, e.message);
        }
      });

      session.on('close', () => {
        console.log(`🔌 ${clientId}: Gemini upstream closed`);
        isGeminiConnected = false;
        sendToClient({ type: 'upstream_closed' });
        setTimeout(() => {
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.close(1000, 'Upstream closed');
          }
        }, 100);
      });

      session.on('error', (err) => {
        console.error(`❌ ${clientId}: Gemini error:`, err);
        isGeminiConnected = false;
        sendToClient({ 
          error: 'AI service error', 
          message: err.message,
          details: err.stack
        });
        setTimeout(() => {
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.close(1011, 'Upstream error');
          }
        }, 100);
      });

      // Handle client messages
      let messageCount = 0;
      clientWs.on('message', async (data) => {
        if (!session || !isGeminiConnected) {
          console.warn(`⚠️  ${clientId}: Message ignored - not ready`);
          return;
        }

        try {
          const parsed = JSON.parse(data.toString());
          
          if (parsed.realtimeInput) {
            session.send(parsed);
            messageCount++;
            if (messageCount % 100 === 0) {
              console.log(`📊 ${clientId}: Sent ${messageCount} audio chunks`);
            }
          }
          
          if (parsed.clientContent) {
            session.send(parsed);
            console.log(`📤 ${clientId}: Text input sent`);
          }
        } catch (e) {
          console.error(`❌ ${clientId}: Parse error:`, e.message);
        }
      });

      clientWs.on('close', (code, reason) => {
        const duration = Date.now() - connectionStartTime;
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🔌 ${clientId}: Disconnected`);
        console.log(`📊 Code: ${code}, Reason: ${reason || 'none'}`);
        console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
        console.log(`📨 Messages: ${messageCount}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        if (session && isGeminiConnected) {
          try {
            if (typeof session.close === 'function') {
              session.close();
            }
          } catch (e) {
            console.error(`❌ ${clientId}: Session close error:`, e.message);
          }
        }
      });

      clientWs.on('error', (error) => {
        console.error(`❌ ${clientId}: Client error:`, error.message);
      });

    } catch (geminiError) {
      console.error(`❌ ${clientId}: Gemini connection failed:`, geminiError);
      throw geminiError;
    }

  } catch (err) {
    const duration = Date.now() - connectionStartTime;
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`❌ ${clientId}: INITIALIZATION FAILED`);
    console.error(`⏱️  Failed after: ${duration}ms`);
    console.error(`💥 Error: ${err.message}`);
    console.error(`📚 Stack: ${err.stack}`);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    sendToClient({
      error: 'Server initialization failed',
      message: err.message,
      hint: !process.env.API_KEY 
        ? 'API_KEY not configured' 
        : 'Gemini Live API connection failed. Check server logs.'
    });
    
    setTimeout(() => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.close(1011, 'Init failed');
      }
    }, 200);
  }
});

wss.on('error', (error) => {
  console.error('❌ WebSocket Server error:', error);
});

// Static files
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
  app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.close(1001, 'Server shutting down');
    }
  });
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
