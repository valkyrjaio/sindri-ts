// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
@Path('/users')
@Name('users')
export class TestHttpControllerClass {
    @Route('/list', 'index')
    @RequestMethod('GET')
    @Middleware(SomeMiddleware)
    @RequestStruct(SomeRequestStruct)
    @ResponseStruct(SomeResponseStruct)
    @Parameter('id', '\\d+')
    index() {}

    @Route('', '')
    invalid() {}

    noDecorator() {}
}
