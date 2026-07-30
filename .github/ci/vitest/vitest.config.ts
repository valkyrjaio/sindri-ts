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
            // The gate's floor. The architecture guide's definition of done is 100% line *and*
            // branch, per file, and nothing enforced it before: the report was generated and then
            // ignored, so a run at 55% passed exactly like one at 100%.
            thresholds : {
                lines      : 100,
                branches   : 100,
                functions  : 100,
                statements : 100,
            },
        },
    },
});
