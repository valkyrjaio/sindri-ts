// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Route } from '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts';

namespace Handlers {
    export function home(container, route) {}
}

export class TestLocalNamespaceRouteProviderFixture {
    getRoutes() {
        return [new Route('/', 'home', Handlers.home)];
    }
}
