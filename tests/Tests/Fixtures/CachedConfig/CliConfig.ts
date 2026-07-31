// Fixture parsed by ts-morph (never executed). Stands in for the framework
// CliConfig, which inserts two fields ahead of `providers` and defaults several
// middleware lists to non-empty values.
/* eslint-disable */
// @ts-nocheck
import { MiddlewareIdFixture } from './MiddlewareIdFixture.ts';

export class CliConfig {
    constructor(
        public readonly namespace: string = 'App',
        public readonly dir: string = process.cwd(),
        public readonly version: string = '0.0.0',
        public readonly environment: string = 'production',
        public readonly debugMode: boolean = false,
        public readonly timezone: string = 'UTC',
        public readonly key: string = 'default_key',
        public readonly dataPath: string = 'App/Data',
        public readonly dataNamespace: string = 'App/Data',
        public readonly applicationName: string = 'valkyrja',
        public readonly defaultCommandName: string = 'list',
        public readonly providers: ComponentProviderContract[] = [new CliApplicationComponentProviderFixture()],
        public readonly callbacks: ((app: ApplicationContract) => void)[] = [],
        public readonly inputReceivedMiddleware: string[] = [],
        public readonly routeMatchedMiddleware: string[] = [],
        public readonly routeNotMatchedMiddleware: string[] = [MiddlewareIdFixture.CheckCommandForTypo],
        public readonly routeDispatchedMiddleware: string[] = [],
        public readonly throwableCaughtMiddleware: string[] = [],
        public readonly processExitingMiddleware: string[] = [],
    ) {}
}
