// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
@Path('/users')
@Name('users')
export class AppHttpControllerFixture {
    @DynamicRoute({
        path: '/{id}',
        name: 'show',
        requestMethods: [RequestMethod.GET],
        parameters: [{ name: 'id', regex: '\\d+' }],
    })
    show() {}
}
