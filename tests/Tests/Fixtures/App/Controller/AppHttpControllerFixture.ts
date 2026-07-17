// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
@Path('/users')
@Name('users')
export class AppHttpControllerFixture {
    @Route('/{id}', 'show')
    @RequestMethod('GET')
    @Parameter('id', '\d+')
    show() {}
}
