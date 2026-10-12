// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Route } from '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts';

export class TestMethodLocalHandlerRouteProviderFixture {
    getRoutes() {
        const homeHandler = (container, route) => {};

        return [new Route('/', 'home', homeHandler)];
    }
}
