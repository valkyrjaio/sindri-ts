/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

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
