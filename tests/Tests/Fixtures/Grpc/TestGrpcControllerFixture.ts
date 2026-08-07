// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { AllGrpcMiddlewareFixture } from './AllGrpcMiddlewareFixture.ts';

@Service('test.Ping')
export class TestGrpcControllerFixture {
    @Method({
        name: 'Ping',
        handler: [() => PingProvider, 'pingHandler'],
        middleware: [() => AllGrpcMiddlewareFixture, () => UnknownMiddleware],
    })
    @Middleware(() => AllGrpcMiddlewareFixture)
    @Middleware(() => UnknownMiddleware)
    @Middleware()
    ping() {}

    @Method({ name: 'Echo', clientStreaming: true, serverStreaming: true })
    echo() {}

    @Method({ name: 'Alias' })
    @Method({ name: 'AliasTwo' })
    alias() {}

    @Method({ name: '' })
    invalid() {}

    @Method('not-an-object')
    nonObject() {}

    noDecorator() {}
}
