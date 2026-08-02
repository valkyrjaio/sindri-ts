/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { CliArgumentParameterData } from './CliArgumentParameterData.ts';
import type { CliOptionParameterData } from './CliOptionParameterData.ts';
import type { CliRouteDataContract } from './Contract/CliRouteDataContract.ts';
import type { HandlerData } from './HandlerData.ts';

export class CliRouteData implements CliRouteDataContract {
    readonly arguments: readonly CliArgumentParameterData[];

    constructor(
        readonly name: string,
        readonly description: string,
        readonly handler: HandlerData | null = null,
        readonly helpText: HandlerData | null = null,
        readonly routeMatchedMiddleware: readonly string[] = [],
        readonly routeDispatchedMiddleware: readonly string[] = [],
        readonly throwableCaughtMiddleware: readonly string[] = [],
        readonly processExitingMiddleware: readonly string[] = [],
        args: readonly CliArgumentParameterData[] = [],
        readonly options: readonly CliOptionParameterData[] = [],
    ) {
        this.arguments = args;
    }
}
