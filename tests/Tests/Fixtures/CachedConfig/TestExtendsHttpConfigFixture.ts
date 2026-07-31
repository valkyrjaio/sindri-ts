// Fixture parsed by ts-morph (never executed). An application config that
// extends a framework config and passes only the arguments it changes, so the
// rest must come from the base's constructor defaults.
/* eslint-disable */
// @ts-nocheck
import { HttpConfig } from './HttpConfig.ts';
import { ComponentProviderFixture } from './ComponentProviderFixture.ts';

export class TestExtendsHttpConfigFixture extends HttpConfig {
    constructor() {
        super(
            'App',
            process.cwd(),
            '1.0.0',
            'production',
            true,
            'UTC',
            process.env['APP_KEY'] ?? '',
            'src/App/Http/Data',
            'App/Http/Data',
            [new ComponentProviderFixture()],
        );
    }
}
