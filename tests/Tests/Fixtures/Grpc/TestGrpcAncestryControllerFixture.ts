// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { Service } from '@valkyrjaio/valkyrja/Grpc/Routing/Attribute/Service.ts';
import { Method } from '@valkyrjaio/valkyrja/Grpc/Routing/Attribute/Method.ts';
import { Middleware } from '@valkyrjaio/valkyrja/Grpc/Routing/Attribute/Method/Middleware.ts';
import { GrpcBaseMiddlewareFixture } from './GrpcBaseMiddlewareFixture.ts';
import { GrpcSubContractMiddlewareFixture } from './GrpcSubContractMiddlewareFixture.ts';
import { GrpcAliasedMiddlewareFixture } from './GrpcAliasedMiddlewareFixture.ts';
import { GrpcHttpMiddlewareFixture } from './GrpcHttpMiddlewareFixture.ts';

@Service('test.Alias')
export class TestGrpcAncestryControllerFixture {
    @Method({
        name: 'Run',
        middleware: [
            () => GrpcBaseMiddlewareFixture,
            () => GrpcSubContractMiddlewareFixture,
            () => GrpcHttpMiddlewareFixture,
            () => SameFileMiddlewareFixture,
        ],
    })
    @Middleware(() => GrpcAliasedMiddlewareFixture)
    run() {}
}

import { SendingResponseMiddlewareContract } from '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/SendingResponseMiddlewareContract.ts';

export class SameFileMiddlewareFixture implements SendingResponseMiddlewareContract {}
