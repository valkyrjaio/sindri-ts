/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type ts from 'typescript';

export class ListenerProviderResult {
    constructor(
        readonly listenerClasses: readonly string[] = [],
        readonly listeners: readonly ts.Expression[] = [],
    ) {}

    merge(other: ListenerProviderResult): ListenerProviderResult {
        return new ListenerProviderResult(
            [...new Set([...this.listenerClasses, ...other.listenerClasses])],
            [...this.listeners, ...other.listeners],
        );
    }
}
