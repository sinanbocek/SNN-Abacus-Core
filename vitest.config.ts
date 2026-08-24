import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      include: ['src/abacus/**/*.ts'],
      // Yalnız barrel dosyaları hariç: kendi mantıkları yok, sadece re-export.
      exclude: ['src/**/*.test.ts', 'src/abacus/index.ts', 'src/abacus/trading-math/index.ts'],
      all: true,
      // Eşikler son ölçümün biraz altına çekilmiştir (2026-08-24:
      // statements 91.08 / branches 86.05 / functions 99.04 / lines 96.46).
      // Amaç gerilemeyi yakalamak; kapsam arttıkça eşikler yukarı çekilmelidir.
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 98,
        lines: 95,
      },
    },
  },
});
