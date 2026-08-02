/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { HttpRouteDataContract } from './Contract/HttpRouteDataContract.ts';
import type { HandlerData } from './HandlerData.ts';
import type { HttpParameterData } from './HttpParameterData.ts';

export class HttpRouteData implements HttpRouteDataContract {
    constructor(
        readonly path: string,
        readonly name: string,
        readonly handler: HandlerData | null = null,
        readonly requestMethods: readonly string[] = [],
        readonly routeMatchedMiddleware: readonly string[] = [],
        readonly routeDispatchedMiddleware: readonly string[] = [],
        readonly throwableCaughtMiddleware: readonly string[] = [],
        readonly sendingResponseMiddleware: readonly string[] = [],
        readonly responseSentMiddleware: readonly string[] = [],
        readonly requestStruct: string | null = null,
        readonly responseStruct: string | null = null,
        readonly isDynamic: boolean = false,
        readonly parameters: readonly HttpParameterData[] = [],
    ) {}
}
