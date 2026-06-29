// Fixture parsed by ts-morph (never executed) — `Config` is intentionally
// unresolved; only the AST shape matters.
/* eslint-disable */
// @ts-nocheck
import { TestComponentProviderClass } from './Provider/TestComponentProviderClass.ts';

export class TestConfigClass extends Config {
    constructor() {
        super(
            'Sindri.Tests.Fixtures',
            '/app/src',
            '1.0.0',
            'production',
            false,
            'UTC',
            'secret',
            'Config/Data',
            'Sindri.Tests.Fixtures.Config.Data',
            'App.Provider.Data',
            [TestComponentProviderClass],
        );
    }
}
