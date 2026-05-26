/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpRouteDataContract } from './Contract/HttpRouteDataContract.js';
import type { HandlerData } from './HandlerData.js';
import type { HttpParameterData } from './HttpParameterData.js';

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
        readonly terminatedMiddleware: readonly string[] = [],
        readonly requestStruct: string | null = null,
        readonly responseStruct: string | null = null,
        readonly isDynamic: boolean = false,
        readonly parameters: readonly HttpParameterData[] = [],
    ) {}
}