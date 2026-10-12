/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

export class ListenerProviderResult {
    /**
     * @param listenerImports Local name → absolute file path for every class the `listeners`
     *                        expressions reference
     */
    constructor(
        readonly listenerClasses: readonly string[] = [],
        readonly listeners: readonly ts.Expression[] = [],
        readonly listenerImports: Readonly<Record<string, string>> = {},
    ) {}

    merge(other: ListenerProviderResult): ListenerProviderResult {
        return new ListenerProviderResult(
            [...new Set([...this.listenerClasses, ...other.listenerClasses])],
            [...this.listeners, ...other.listeners],
            { ...this.listenerImports, ...other.listenerImports },
        );
    }
}
