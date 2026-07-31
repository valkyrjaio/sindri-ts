// Fixture parsed by ts-morph (never executed). Names a known base class, but the
// base cannot be resolved to a file, so no defaults can be read from it.
/* eslint-disable */
// @ts-nocheck

export class TestUnresolvedBaseConfigFixture extends HttpConfig {
    constructor() {
        super('App', process.cwd(), '1.0.0');
    }
}
