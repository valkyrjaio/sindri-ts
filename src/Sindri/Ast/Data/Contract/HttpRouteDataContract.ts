/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { HandlerDataContract } from './HandlerDataContract.ts';
import type { HttpParameterDataContract } from './HttpParameterDataContract.ts';

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
    readonly responseSentMiddleware: readonly string[];
    readonly requestStruct: string | null;
    readonly responseStruct: string | null;
    readonly isDynamic: boolean;
    readonly parameters: readonly HttpParameterDataContract[];
}
