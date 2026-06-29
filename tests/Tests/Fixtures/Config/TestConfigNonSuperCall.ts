// Fixture parsed by ts-morph (never executed) — the constructor body contains a
// non-super() call statement before super(), exercising the "callee is not the
// super keyword" branch.
/* eslint-disable */
// @ts-nocheck
export class TestConfigNonSuperCall extends Config {
    constructor() {
        doSomethingFirst();
        super(
            'App.NonSuper',
            '/dir',
            '1.0.0',
            'production',
            false,
            'UTC',
            'secret',
            'Config/Data',
            'App.NonSuper.Data',
            'App.Provider.Data',
            [],
        );
    }
}
