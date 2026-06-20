import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const reportsDirectory = fileURLToPath(new URL('./coverage', import.meta.url));

export default defineConfig({
    test: {
        root,
        include         : ['tests/**/*.test.ts'],
        passWithNoTests : true,
        coverage        : {
            provider: 'v8',
            reporter : ['text', 'lcov'],
            all      : true,
            include  : ['src/**/*.ts'],
            exclude  : ['src/**/*.test.ts'],
            reportsDirectory,
        },
    },
});
