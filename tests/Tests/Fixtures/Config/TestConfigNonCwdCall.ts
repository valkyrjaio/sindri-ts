// Fixture parsed by ts-morph (never executed) — the dir argument is a
// property-access call that is not process.cwd(), exercising the false side of
// the process.cwd() detection branch.
/* eslint-disable */
// @ts-nocheck
export class TestConfigNonCwdCall extends Config {
    constructor() {
        super(
            'App.NonCwd',
            path.resolve(),
            '1.0.0',
            'production',
            false,
            'UTC',
            'secret',
            'Config/Data',
            'App.NonCwd.Data',
            'App.Provider.Data',
            [],
        );
    }
}
