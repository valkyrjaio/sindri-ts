// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
export class TestImperativeRouteProviderFixture {
    getControllerClasses() {
        return [];
    }
    getRoutes() {
        return [
            new Route('/', 'home', TestImperativeRouteProviderFixture.homeHandler),
            new DynamicRoute('/users/{id}', 'users.show', '/users/([0-9]+)', [new Parameter('id', '[0-9]+')], TestImperativeRouteProviderFixture.showHandler, [RequestMethod.GET]),
        ];
    }
}
