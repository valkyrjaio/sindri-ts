// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Route } from '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts';

// A handler the provider declares for itself. The generated data file sits in another module, so
// it cannot reach this name.
const homeHandler = (container, route) => {};

export class TestLocalHandlerRouteProviderFixture {
    getRoutes() {
        return [new Route('/', 'home', homeHandler)];
    }
}
