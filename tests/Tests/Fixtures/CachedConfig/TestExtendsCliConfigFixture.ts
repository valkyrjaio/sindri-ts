// Fixture parsed by ts-morph (never executed). Exercises the CliConfig argument
// order, where applicationName and defaultCommandName precede providers.
/* eslint-disable */
// @ts-nocheck
import { CliConfig } from './CliConfig.ts';
import { ComponentProviderFixture } from './ComponentProviderFixture.ts';

export class TestExtendsCliConfigFixture extends CliConfig {
    constructor() {
        super(
            'App',
            process.cwd(),
            '1.0.0',
            'production',
            false,
            'UTC',
            'secret',
            'src/App/Cli/Data',
            'App/Cli/Data',
            'cli',
            'list',
            [new ComponentProviderFixture()],
        );
    }
}
