// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { AllMiddlewareFixture } from './AllMiddlewareFixture.ts';

@Path('/users')
@Name('users')
export class TestHttpControllerFixture {
    @Route({
        path: '/{id}',
        name: 'index',
        requestMethods: [RequestMethod.GET],
        middleware: [AllMiddlewareFixture],
        requestStruct: SomeRequestStruct,
        responseStruct: SomeResponseStruct,
        parameters: [{ name: 'id', regex: '\\d+' }],
    })
    index() {}

    @DynamicRoute({
        path: '/{post}',
        name: 'show',
        parameters: [{ name: 'post', regex: '\\d+', cast: 'int', isOptional: true, shouldCapture: false, default: 'p' }],
    })
    show() {}

    @Route({ path: '/by', name: 'byHandler', handler: [OtherController, 'byHandler'] })
    byHandler() {}

    @Route({ path: '', name: '' })
    invalid() {}

    @DynamicRoute({ path: '', name: '' })
    invalidDynamic() {}

    @Route('not-an-object')
    nonObject() {}

    noDecorator() {}
}
