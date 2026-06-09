/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ts } from 'ts-morph';

export class RouteProviderResult {
    constructor(
        readonly controllerClasses: readonly string[] = [],
        readonly routes: readonly ts.Expression[] = [],
    ) {}

    merge(other: RouteProviderResult): RouteProviderResult {
        return new RouteProviderResult(
            [...new Set([...this.controllerClasses, ...other.controllerClasses])],
            [...this.routes, ...other.routes],
        );
    }
}
