// Fixture parsed by ts-morph (never executed). Passes more super() arguments
// than the base field order names, so the surplus has nowhere to map.
/* eslint-disable */
// @ts-nocheck
import { Config } from './Config.ts';

export class TestExtraArgsConfigFixture extends Config {
    constructor() {
        super(
            'App',
            process.cwd(),
            '1.0.0',
            'production',
            false,
            'UTC',
            'secret',
            'App/Data',
            'App.Data',
            [],
            [],
            'surplus argument',
        );
    }
}
