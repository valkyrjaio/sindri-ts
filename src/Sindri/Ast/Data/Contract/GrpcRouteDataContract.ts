/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { HandlerDataContract } from './HandlerDataContract.ts';

export interface GrpcRouteDataContract {
    /** The fully-qualified method, for example `/pkg.Ping/Ping`. */
    readonly method: string;
    readonly handler: HandlerDataContract;
    readonly clientStreaming: boolean;
    readonly serverStreaming: boolean;
    readonly routeMatchedMiddleware: readonly string[];
    readonly routeDispatchedMiddleware: readonly string[];
    readonly throwableCaughtMiddleware: readonly string[];
    readonly sendingResponseMiddleware: readonly string[];
    readonly responseSentMiddleware: readonly string[];
}
