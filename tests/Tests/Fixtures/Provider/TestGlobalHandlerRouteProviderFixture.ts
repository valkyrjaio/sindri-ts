// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Route } from '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts';
import { CliA } from './CliA.ts';

// Two module-level names a route reaches without the generated data file importing them: one an
// inline handler's own parameter shadows, one a destructured property renames.
const route = {};
const prefix = '/api';

// An anonymous declaration carries no name, so no route can reference it.
export default function () {}

export class TestGlobalHandlerRouteProviderFixture {
    static readonly PREFIX = '/api';

    getRoutes() {
        return [
            // `console` is a global, so the generated data file needs no import for it, and the
            // inline handler declares the names it takes.
            new Route('/logged', 'logged', ({ container }, route) => console.log(container, route)),
            new Route('/renamed', 'renamed', ({ prefix: p = CliA.PREFIX }) => p),
            new Route('/static', 'static', TestGlobalHandlerRouteProviderFixture.handle, {
                prefix: TestGlobalHandlerRouteProviderFixture.PREFIX,
            }),
            new Route('/imported', 'imported', CliA.handle),
        ];
    }
}
