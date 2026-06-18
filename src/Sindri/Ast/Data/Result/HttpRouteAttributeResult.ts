/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ts } from 'ts-morph';

import type { HttpRouteData } from '../HttpRouteData.ts';

export class HttpRouteAttributeResult {
    constructor(
        readonly routes: Record<string, ts.Expression> = {},
        readonly routeData: Record<string, HttpRouteData> = {},
    ) {}
}
