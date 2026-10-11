/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

export class ListenerAttributeResult {
    /**
     * @param listeners A Map, because an object reorders a key that reads as an integer
     */
    constructor(readonly listeners: ReadonlyMap<string, ts.Expression> = new Map()) {}
}
