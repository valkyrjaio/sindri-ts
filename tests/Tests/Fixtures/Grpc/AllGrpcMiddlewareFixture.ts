// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { RouteMatchedMiddlewareContract } from '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/RouteMatchedMiddlewareContract.ts';
import { RouteDispatchedMiddlewareContract } from '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/RouteDispatchedMiddlewareContract.ts';
import { ThrowableCaughtMiddlewareContract } from '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/ThrowableCaughtMiddlewareContract.ts';
import { SendingResponseMiddlewareContract } from '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/SendingResponseMiddlewareContract.ts';
import { ResponseSentMiddlewareContract } from '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/ResponseSentMiddlewareContract.ts';
export class AllGrpcMiddlewareFixture
    implements
        RouteMatchedMiddlewareContract,
        RouteDispatchedMiddlewareContract,
        ThrowableCaughtMiddlewareContract,
        SendingResponseMiddlewareContract,
        ResponseSentMiddlewareContract {}
