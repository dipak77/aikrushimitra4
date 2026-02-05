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
console.log('🔑 API_KEY detected:', !!API_KEY);


if (API_KEY) {
    console.log('🔑 API_KEY length:', API_KEY.length);
    console.log('🔑 API_KEY prefix:', API_KEY.substring(0, 4) + '...');
} else {
    console.error('\n⛔ FATAL ERROR: API_KEY is missing!');
    console.error('💡 Solution: Create a .env file with: API_KEY=your_gemini_api_key');
    console.error('📖 Get your key from: https://aistudio.google.com/apikey\n');
}


console.log('🔌 PORT:', PORT);


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
    res.status(500).json({ error: "Failed to generate response. Check server logs." });
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
    res.status(500).json({ error: "Failed to analyze image. Check server logs." });
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
    res.status(500).json({ error: "Failed to fetch updates. Check server logs." });
  }
});


const isProduction = process.env.NODE_ENV === 'production';
app.use(express.static(path.resolve(__dirname, 'public')));


const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🎤 WebSocket endpoint: /ws/live`);
});


const wss = new WebSocketServer({ 
  server, 
  path: '/ws/live',
  clientTracking: true,
  perMessageDeflate: false,
  maxPayload: 20 * 1024 * 1024
});


console.log('🔌 WebSocket server created');


wss.on('connection', async (clientWs, req) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔗 NEW CONNECTION: ${clientId}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🔑 API Key Status: ${API_KEY ? 'PRESENT' : 'MISSING'}`);
  
  if (!API_KEY || API_KEY.length < 10) {
    console.error(`❌ ${clientId}: API_KEY invalid or missing`);
    const errorMsg = {
      error: 'Server Configuration Error',
      message: 'API_KEY not configured on server',
      hint: 'Check your .env file and ensure API_KEY is set correctly'
    };
    
    if (clientWs.readyState === clientWs.OPEN) {
      clientWs.send(JSON.stringify(errorMsg));
    }
    
    setTimeout(() => {
      clientWs.close(1008, 'API_KEY not configured');
    }, 500);
    return;
  }
  
  let ai = null;
  let session = null;
  let isGeminiConnected = false;
  let connectionStartTime = Date.now();
  let clientConfig = null; // Store client configuration


  const sendToClient = (data) => {
    if (clientWs.readyState === clientWs.OPEN) {
      try {
        clientWs.send(JSON.stringify(data));
      } catch (e) {
        console.error(`❌ ${clientId}: Send error:`, e.message);
      }
    }
  };


  const pingInterval = setInterval(() => {
    if (clientWs.readyState === clientWs.OPEN) {
        // Keep alive
    }
  }, 30000);


  try {
    ai = getAIClient();
    sendToClient({ type: 'proxy_ready', message: 'Proxy initialized' });

    // Handle client messages
    clientWs.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        
        // **Handle setup message from frontend**
        if (parsed.type === 'setup' && parsed.config) {
          console.log(`⚙️ ${clientId}: Received setup config:`, {
            language: parsed.config.language,
            voiceName: parsed.config.voiceName,
            hasSystemInstruction: !!parsed.config.systemInstruction
          });
          
          clientConfig = parsed.config;
          
          // Now connect to Gemini with the configuration
          console.log(`⏳ ${clientId}: Connecting to Gemini Live API with config...`);
          
          const connectStartTime = Date.now();
          
          try {
            const callbacks = {
              onopen: () => {
                const connectDuration = Date.now() - connectStartTime;
                console.log(`✅ ${clientId}: Connected to Gemini in ${connectDuration}ms`);
                isGeminiConnected = true;
                sendToClient({ type: 'setup_complete', setupComplete: true });
              },
              onmessage: (msg) => {
                try {
                  sendToClient(msg);
                } catch (e) {
                  console.error(`❌ ${clientId}: Error forwarding:`, e.message);
                }
              },
              onclose: () => {
                console.log(`🔌 ${clientId}: Gemini upstream closed`);
                isGeminiConnected = false;
                sendToClient({ type: 'upstream_closed' });
                setTimeout(() => {
                  if (clientWs.readyState === clientWs.OPEN) {
                    clientWs.close(1000, 'Upstream closed');
                  }
                }, 500);
              },
              onerror: (err) => {
                console.error(`❌ ${clientId}: Gemini error:`, err);
                isGeminiConnected = false;
                sendToClient({ 
                  error: 'AI service error', 
                  message: err.message || "Unknown error",
                  details: 'The AI model refused the connection. Check billing/quota.'
                });
                setTimeout(() => {
                  if (clientWs.readyState === clientWs.OPEN) {
                    clientWs.close(1011, 'Upstream error');
                  }
                }, 1000);
              }
            };

            // Build speech config
            const voiceName = clientConfig.voiceName || 'Puck';
            
            // Connect with client configuration
            session = await Promise.race([
              ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: { 
                  responseModalities: ['AUDIO'],
                  speechConfig: { 
                    voiceConfig: { 
                      prebuiltVoiceConfig: { 
                        voiceName: voiceName
                      } 
                    } 
                  },
                  systemInstruction: {
                    parts: [{
                      text: clientConfig.systemInstruction || `You are AI Krushi Mitra, a helpful agricultural assistant.`
                    }]
                  },
                  // **Enable transcriptions**
                  ...(clientConfig.enableInputTranscription && {
                    inputAudioTranscription: {}
                  }),
                  ...(clientConfig.enableOutputTranscription && {
                    outputAudioTranscription: {}
                  })
                },
                callbacks: callbacks
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Gemini connection timeout after 45 seconds')), 45000)
              )
            ]);

          } catch (geminiError) {
            console.error(`❌ ${clientId}: Gemini connection failed:`, geminiError.message);
            throw geminiError;
          }
          
          return; // Setup handled
        }
        
        // Respond to ping
        if (parsed.type === 'ping') return;
        
        if (!session || !isGeminiConnected) {
          console.warn(`⚠️ ${clientId}: Received data but session not ready`);
          return;
        }

        // Forward audio input to Gemini
        if (parsed.realtimeInput) {
          session.sendRealtimeInput(parsed.realtimeInput);
        }
        
        if (parsed.clientContent) {
          // For other content types if needed
        }
      } catch (e) {
        console.error(`❌ ${clientId}: Parse error:`, e.message);
      }
    });


    clientWs.on('close', (code, reason) => {
      clearInterval(pingInterval);
      const duration = Date.now() - connectionStartTime;
      console.log(`🔌 ${clientId}: Disconnected (${code}) after ${Math.round(duration / 1000)}s`);
      
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


  } catch (err) {
    console.error(`❌ ${clientId}: INITIALIZATION FAILED`, err.message);
    
    sendToClient({
      error: 'Server initialization failed',
      message: err.message,
      hint: !API_KEY 
        ? 'API_KEY not configured on server' 
        : 'Model might be unavailable or key is invalid. Check Server Logs.'
    });
    
    setTimeout(() => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.close(1011, 'Init failed');
      }
    }, 500);
  }
});


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


process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  wss.clients.forEach(client => client.close());
  server.close(() => process.exit(0));
});
