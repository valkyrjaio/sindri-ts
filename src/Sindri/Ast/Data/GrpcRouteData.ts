/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { GrpcRouteDataContract } from './Contract/GrpcRouteDataContract.ts';
import type { HandlerData } from './HandlerData.ts';

export class GrpcRouteData implements GrpcRouteDataContract {
    constructor(
        readonly method: string,
        readonly handler: HandlerData,
        readonly clientStreaming: boolean = false,
        readonly serverStreaming: boolean = false,
        readonly routeMatchedMiddleware: readonly string[] = [],
        readonly routeDispatchedMiddleware: readonly string[] = [],
        readonly throwableCaughtMiddleware: readonly string[] = [],
        readonly sendingResponseMiddleware: readonly string[] = [],
        readonly responseSentMiddleware: readonly string[] = [],
    ) {}
}
