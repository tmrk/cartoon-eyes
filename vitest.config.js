import { defineConfig } from 'vitest/config';

// separate from vite.config.js so the test run doesn't inherit the GitHub Pages
// base path or the dev server settings
export default defineConfig({
  resolve: {
    // Match the production config: the package worktree can have its own React
    // peer dependency, but tests and the renderer must share one React instance.
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.{js,jsx,ts,tsx}'],
  },
});
