/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

export class GrpcRouteAttributeResult {
    constructor(
        readonly routes: Record<string, ts.Expression> = {},
        /** Class short name → absolute file path for handler and middleware imports. */
        readonly importMap: Record<string, string> = {},
    ) {}
}
