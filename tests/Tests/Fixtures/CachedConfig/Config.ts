// Fixture parsed by ts-morph (never executed). Stands in for the framework
// Config. `namespace` deliberately has no default, so a config that omits it
// contributes no value for that field.
/* eslint-disable */
// @ts-nocheck
import { SomeFrameworkThing } from '@valkyrjaio/valkyrja/Application/Constant/ApplicationInfo.ts';

export class Config {
    constructor(
        public readonly namespace: string,
        public readonly dir: string = process.cwd(),
        public readonly version: string = '0.0.0',
        public readonly environment: string = 'production',
        public readonly debugMode: boolean = false,
        public readonly timezone: string = 'UTC',
        public readonly key: string = 'default_key',
        public readonly dataPath: string = 'App/Data',
        public readonly dataNamespace: string = 'App/Data',
        public readonly providers: ComponentProviderContract[] = [],
        public readonly callbacks: ((app: ApplicationContract) => void)[] = [],
        public readonly untyped = SomeFrameworkThing.VALUE,
    ) {}
}
