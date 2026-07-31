// Fixture parsed by ts-morph (never executed). Has a constructor whose
// statements include a call that is not super(), and no super() call at all.
/* eslint-disable */
// @ts-nocheck
import { HttpConfig } from './HttpConfig.ts';

export class TestNoSuperConfigFixture extends HttpConfig {
    constructor() {
        doSomething();
        const unused = 1;
    }
}
