// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { RouteMatchedMiddlewareContract } from '@valkyrjaio/valkyrja/Http/Middleware/Contract/RouteMatchedMiddlewareContract.ts';
import { RouteDispatchedMiddlewareContract } from '@valkyrjaio/valkyrja/Http/Middleware/Contract/RouteDispatchedMiddlewareContract.ts';
import { ThrowableCaughtMiddlewareContract } from '@valkyrjaio/valkyrja/Http/Middleware/Contract/ThrowableCaughtMiddlewareContract.ts';
import { SendingResponseMiddlewareContract } from '@valkyrjaio/valkyrja/Http/Middleware/Contract/SendingResponseMiddlewareContract.ts';
import { ResponseSentMiddlewareContract } from '@valkyrjaio/valkyrja/Http/Middleware/Contract/ResponseSentMiddlewareContract.ts';
export class AllMiddlewareFixture
    implements
        RouteMatchedMiddlewareContract,
        RouteDispatchedMiddlewareContract,
        ThrowableCaughtMiddlewareContract,
        SendingResponseMiddlewareContract,
        ResponseSentMiddlewareContract {}
