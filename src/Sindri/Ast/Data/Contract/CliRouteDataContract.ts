/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { CliArgumentParameterDataContract } from './CliArgumentParameterDataContract.ts';
import type { CliOptionParameterDataContract } from './CliOptionParameterDataContract.ts';
import type { HandlerDataContract } from './HandlerDataContract.ts';

export interface CliRouteDataContract {
    readonly name: string;
    readonly description: string;
    readonly handler: HandlerDataContract | null;
    readonly helpText: HandlerDataContract | null;
    readonly routeMatchedMiddleware: readonly string[];
    readonly routeDispatchedMiddleware: readonly string[];
    readonly throwableCaughtMiddleware: readonly string[];
    readonly processExitingMiddleware: readonly string[];
    readonly arguments: readonly CliArgumentParameterDataContract[];
    readonly options: readonly CliOptionParameterDataContract[];
}
