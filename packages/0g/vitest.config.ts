import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Other configuration options...

  // Specify the test environment
  test: {
    environment: 'jsdom',
    mockReset: true,
  },
});
