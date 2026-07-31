// Fixture parsed by ts-morph (never executed). Extends a known base whose class
// declares no constructor.
/* eslint-disable */
// @ts-nocheck
import { Config } from './NoConstructorBase/Config.ts';

export class TestNoBaseConstructorConfigFixture extends Config {
    constructor() {
        super('App');
    }
}
