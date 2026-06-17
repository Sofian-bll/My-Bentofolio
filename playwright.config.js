import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.js',
  use: {
    baseURL: 'http://localhost:5173',
  },
});
