// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Route } from '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts';

const help = (container, route) => {};

export class TestShorthandNameRouteProviderFixture {
    getRoutes() {
        // The `help` of `{ help }` references the value, so the shorthand property declares nothing.
        return [new Route('/', 'home', TestShorthandNameRouteProviderFixture.handle, { help })];
    }
}
