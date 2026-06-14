/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Project page is served from https://globalanomalyindex.github.io/carplay-siri-contacts/,
// so production assets resolve under that subpath. Dev and tests stay at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/carplay-siri-contacts/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    passWithNoTests: true,
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
  },
}))
