/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { CliArgumentParameterData } from './CliArgumentParameterData.js';
import type { CliOptionParameterData } from './CliOptionParameterData.js';
import type { CliRouteDataContract } from './Contract/CliRouteDataContract.js';
import type { HandlerData } from './HandlerData.js';

export class CliRouteData implements CliRouteDataContract {
    constructor(
        readonly name: string,
        readonly description: string,
        readonly handler: HandlerData | null = null,
        readonly helpText: HandlerData | null = null,
        readonly routeMatchedMiddleware: readonly string[] = [],
        readonly routeDispatchedMiddleware: readonly string[] = [],
        readonly throwableCaughtMiddleware: readonly string[] = [],
        readonly exitedMiddleware: readonly string[] = [],
        readonly arguments: readonly CliArgumentParameterData[] = [],
        readonly options: readonly CliOptionParameterData[] = [],
    ) {}
}
