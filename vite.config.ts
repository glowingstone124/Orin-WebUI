import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:9912',
        changeOrigin: true,
      },
      '/remote': {
        target: 'http://localhost:9912',
        changeOrigin: true,
      },
    },
  },
});
