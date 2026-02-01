import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Prioritize env file, then system env, checking common key names for AI Studio/Vercel/Local
  const apiKey = env.API_KEY || env.GOOGLE_API_KEY || env.GEMINI_API_KEY || 
                 process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Prevents "process is not defined" in browser
      'process.env': {},
      // Injects the resolved key directly as a string literal
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      allowedHosts: true, // Allow all hosts (needed for Cloud IDEs)
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
          changeOrigin: true,
          secure: false,
          // Important: Handle websocket upgrade events
          configure: (proxy, options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Proxy error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📤 Proxying request:', req.url);
            });
            proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
              console.log('🔌 WebSocket proxy connection established');
              socket.on('error', (err) => {
                console.error('❌ WebSocket socket error:', err.message);
              });
            });
            proxy.on('close', () => {
              console.log('🔌 WebSocket proxy closed');
            });
          },
        }
      },
      watch: {
        usePolling: true,
      }
    }
  };
});
