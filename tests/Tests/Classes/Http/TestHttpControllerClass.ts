// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
@Path('/users')
@Name('users')
export class TestHttpControllerClass {
    @Route('/{id}', 'index')
    @RequestMethod('GET')
    @Middleware(SomeMiddleware)
    @RequestStruct(SomeRequestStruct)
    @ResponseStruct(SomeResponseStruct)
    @Parameter('id', '\\d+')
    index(@Parameter('slug', '[a-z]+') slug) {}

    @DynamicRoute('/{post}', 'show')
    @Parameter('post', '\\d+')
    show() {}

    @Route('', '')
    invalid() {}

    noDecorator() {}
}
