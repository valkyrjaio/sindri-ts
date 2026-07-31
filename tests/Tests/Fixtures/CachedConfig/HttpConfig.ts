// Fixture parsed by ts-morph (never executed). Stands in for the framework
// HttpConfig: the class name is what gives each positional super() argument its
// meaning, and the constructor defaults are what an application config omits.
/* eslint-disable */
// @ts-nocheck

export class HttpConfig {
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
        public readonly providers: ComponentProviderContract[] = [new HttpApplicationComponentProviderFixture()],
        public readonly callbacks: ((app: ApplicationContract) => void)[] = [],
        public readonly requestReceivedMiddleware: string[] = [],
        public readonly routeMatchedMiddleware: string[] = [],
        public readonly routeNotMatchedMiddleware: string[] = [],
        public readonly routeDispatchedMiddleware: string[] = [],
        public readonly throwableCaughtMiddleware: string[] = [],
        public readonly sendingResponseMiddleware: string[] = [],
        public readonly responseSentMiddleware: string[] = [],
    ) {}
}
