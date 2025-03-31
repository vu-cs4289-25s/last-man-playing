//frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Forces Vite to always run on port 3000
    strictPort: true, // Prevents switching to a different port if 3000 is occupied
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Redirect API calls to backend
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true, // WebSocket support for Socket.IO
      }
    }
  },
});