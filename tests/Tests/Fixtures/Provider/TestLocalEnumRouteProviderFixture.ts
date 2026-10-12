// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
// A route name the provider declares for itself. The generated data file emits the reference as a
// computed map key, so it reaches the enum as an unbound name.
enum Paths {
    Home = '/',
}

export class TestLocalEnumRouteProviderFixture {
    getRoutes() {
        return [new Route(Paths.Home, 'home', TestLocalEnumRouteProviderFixture.handle)];
    }
}
