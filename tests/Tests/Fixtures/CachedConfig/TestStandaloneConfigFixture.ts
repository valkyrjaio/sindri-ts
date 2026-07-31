// Fixture parsed by ts-morph (never executed). A standalone config that
// implements the contract directly and declares its own properties.
/* eslint-disable */
// @ts-nocheck
import { MiddlewareIdFixture } from './MiddlewareIdFixture.ts';

export class TestStandaloneConfigFixture implements HttpConfigContract {
    static readonly id = 'ignored.static';

    readonly namespace: string = 'App';
    readonly dir = process.cwd();
    readonly version: string = '2.0.0';
    readonly environment: string = 'production';
    readonly debugMode: boolean = true;
    readonly timezone: string = 'UTC';
    readonly key: string = 'secret';
    readonly dataPath: string = 'src/App/Http/Data';
    readonly dataNamespace: string = 'App/Http/Data';
    readonly providers = [];
    readonly callbacks = [];
    readonly requestReceivedMiddleware: string[] = [MiddlewareIdFixture.CheckCommandForTypo];
    readonly uninitialized: string;
}
