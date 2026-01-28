
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env to prevent browser crashes
      'process.env': {},
      // Inject API_KEY if available (from .env or system)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173,      // Standard port
      strictPort: false,
      allowedHosts: true, // Allow all hosts for cloud previews
      proxy: {
        // Proxy API requests to backend server (port 8080) when running Vite standalone
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
          changeOrigin: true,
        }
      },
      watch: {
        usePolling: true, // Fix for container/cloud file watching
      }
    }
  };
});
