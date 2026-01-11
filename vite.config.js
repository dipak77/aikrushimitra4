
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173,      // Standard port
      strictPort: false,
      allowedHosts: true, // Allow all hosts for cloud previews
      watch: {
        usePolling: true, // Fix for container/cloud file watching
      }
    }
  };
});
