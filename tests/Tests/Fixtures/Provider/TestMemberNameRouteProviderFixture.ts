// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Route } from '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts';

const home = (container, route) => {};

export class TestMemberNameRouteProviderFixture {
    getRoutes() {
        // `TestMemberNameRouteProviderFixture.home` carries `home` as a member name, which declares
        // nothing, so the bare `home` is still a name the file declares for itself.
        return [new Route('/', 'home', TestMemberNameRouteProviderFixture.home, { help: home })];
    }
}
