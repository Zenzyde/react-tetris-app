
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/react-tetris-app/',
  plugins: [react()],
  optimizeDeps: {
    include: ['react-countup'],
    needsInterop: ['react-countup']
  }
});
