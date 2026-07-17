import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base matches the GitHub Pages URL: https://tmrk.github.io/cartoon-eyes/
export default defineConfig({
  plugins: [react()],
  base: '/cartoon-eyes/',
  server: {
    port: 3000,
  },
});
