// Fixture parsed by ts-morph (never executed) — `Config` is intentionally
// unresolved; only the AST shape matters.
/* eslint-disable */
// @ts-nocheck
import { TestComponentProviderFixture } from './Provider/TestComponentProviderFixture.ts';

export class TestConfigFixture extends ConfigFixture {
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
            [TestComponentProviderFixture],
        );
    }
}
