import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
      coverage: {
        provider: 'v8',
        include: ['src/domain/**/*.ts'],
        exclude: ['**/*.test.ts', '**/types.ts', '**/index.ts'],
        thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
      },
    },
  }),
);
