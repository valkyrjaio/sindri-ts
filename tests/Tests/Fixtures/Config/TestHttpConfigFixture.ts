// Fixture parsed by ts-morph (never executed) — `Config` is intentionally
// unresolved; only the AST shape matters. Mirrors the framework HttpConfig
// argument layout, where the providers array is the 10th argument (index 9)
// and each provider is a `new X()` instance.
/* eslint-disable */
// @ts-nocheck
import { TestComponentProviderFixture } from './Provider/TestComponentProviderFixture.ts';

export class TestHttpConfigFixture extends ConfigFixture {
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
            [new TestComponentProviderFixture()],
        );
    }
}
