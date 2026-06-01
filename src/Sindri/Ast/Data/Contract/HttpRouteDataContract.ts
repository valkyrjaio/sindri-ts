/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HandlerDataContract } from './HandlerDataContract.js';
import type { HttpParameterDataContract } from './HttpParameterDataContract.js';

export interface HttpRouteDataContract {
    readonly path: string;
    readonly name: string;
    readonly handler: HandlerDataContract | null;
    /** "FQN::CASE" strings for RequestMethod enum values */
    readonly requestMethods: readonly string[];
    readonly routeMatchedMiddleware: readonly string[];
    readonly routeDispatchedMiddleware: readonly string[];
    readonly throwableCaughtMiddleware: readonly string[];
    readonly sendingResponseMiddleware: readonly string[];
    readonly terminatedMiddleware: readonly string[];
    readonly requestStruct: string | null;
    readonly responseStruct: string | null;
    readonly isDynamic: boolean;
    readonly parameters: readonly HttpParameterDataContract[];
}
