// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Route } from '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts';
import { CliA } from './CliA.ts';
import { CompA } from './CompA.ts';

// A module-level name for each slot that declares or keys the name it carries, so a route reaching
// one of those slots is read rather than stopped.
const handler = 1;
const Handler = 1;
const help = 1;
const prefix = 1;
const LIST = 1;
const middleware = 1;

export class TestDeclaredNameRouteProviderFixture {
    getRoutes() {
        return [
            new Route('/function', 'function', function handler(container, route) {
                return handler;
            }),
            new Route('/class', 'class', class Handler {
                run() {
                    return Handler;
                }
            }),
            new Route('/anonymous', 'anonymous', function () {}),
            new Route('/keys', 'keys', () => undefined, {
                help() {
                    return 'h';
                },
                get prefix() {
                    return '/a';
                },
                set prefix(value) {},
                [CompA.KEY]: 1,
            }),
            new Route(CliA.LIST, 'member', CliA.handle),
            new Route('/options', 'options', CliA.handle, { middleware: [CliA] }),
        ];
    }
}
