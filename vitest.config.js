import { defineConfig } from 'vitest/config';

// https://vitest.dev/config
export default defineConfig({
  test: {
    watch: false,
    reporters: [['default', { summary: false }]],
    coverage: { provider: 'v8' },
  },
});
