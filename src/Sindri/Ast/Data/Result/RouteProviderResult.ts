/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

export class RouteProviderResult {
    /**
     * @param routeImports Local name → absolute file path for every class the
     *                     imperative `routes` expressions reference, so the
     *                     generated data cache can import them.
     */
    constructor(
        readonly controllerClasses: readonly string[] = [],
        readonly routes: readonly ts.Expression[] = [],
        readonly routeImports: Readonly<Record<string, string>> = {},
    ) {}

    merge(other: RouteProviderResult): RouteProviderResult {
        return new RouteProviderResult(
            [...new Set([...this.controllerClasses, ...other.controllerClasses])],
            [...this.routes, ...other.routes],
            { ...this.routeImports, ...other.routeImports },
        );
    }
}
