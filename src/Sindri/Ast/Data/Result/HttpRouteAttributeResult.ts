/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

import type { HttpRouteData } from '../HttpRouteData.ts';

export class HttpRouteAttributeResult {
    constructor(
        readonly routes: Record<string, ts.Expression> = {},
        readonly routeData: Record<string, HttpRouteData> = {},
        /** Class short name → absolute file path for handler/middleware imports. */
        readonly importMap: Record<string, string> = {},
    ) {}
}
