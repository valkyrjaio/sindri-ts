/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { CliArgumentParameterDataContract } from './CliArgumentParameterDataContract.js';
import type { CliOptionParameterDataContract } from './CliOptionParameterDataContract.js';
import type { HandlerDataContract } from './HandlerDataContract.js';

export interface CliRouteDataContract {
    readonly name: string;
    readonly description: string;
    readonly handler: HandlerDataContract | null;
    readonly helpText: HandlerDataContract | null;
    readonly routeMatchedMiddleware: readonly string[];
    readonly routeDispatchedMiddleware: readonly string[];
    readonly throwableCaughtMiddleware: readonly string[];
    readonly exitedMiddleware: readonly string[];
    readonly arguments: readonly CliArgumentParameterDataContract[];
    readonly options: readonly CliOptionParameterDataContract[];
}