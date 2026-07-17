import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base matches the GitHub Pages URL: https://tmrk.github.io/cartoon-eyes/
export default defineConfig({
  plugins: [react()],
  base: '/cartoon-eyes/',
  resolve: {
    // src/components has its own node_modules (react gets auto-installed there as a
    // peer dep); without dedupe the production bundle ships two React copies and
    // crashes with a null hook dispatcher
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
  },
});
