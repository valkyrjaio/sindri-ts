/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ts } from 'ts-morph';

export class CliRouteAttributeResult {
    constructor(
        readonly routes: Record<string, ts.Expression> = {},
        /** Class short name → absolute file path for handler/help-text imports. */
        readonly importMap: Record<string, string> = {},
    ) {}
}
