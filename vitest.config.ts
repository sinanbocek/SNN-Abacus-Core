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
      // Eşikler son ölçümün biraz altına çekilmiştir (2026-09-19, TB-003 sonrası:
      // statements 93.42 / branches 89.89 / functions 100 / lines 98.39; önceki tur 2026-08-24: 91.08 / 86.05 / 99.04 / 96.46).
      // Amaç gerilemeyi yakalamak; kapsam arttıkça eşikler yukarı çekilmelidir.
      thresholds: {
        statements: 93,
        branches: 89,
        functions: 100,
        lines: 98,
      },
    },
  },
});
