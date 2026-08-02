/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export interface GrpcDataFileGeneratorContract {
    /** Map of class name → module specifier for the provider imports the data cache references. */
    classImportMap: Record<string, string>;

    generateFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
    ): GenerateStatus;

    generateFileFromRoutes(
        directory: string,
        className: string,
        namespace: string,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus;

    generateClassContents(routes: Record<string, ts.Expression>): string;
}
