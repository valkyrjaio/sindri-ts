/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

import type { HttpRouteData } from '../../../Ast/Data/HttpRouteData.ts';
import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export interface HttpDataFileGeneratorContract {
    /** Map of class name → module specifier for the provider imports the data cache references. */
    classImportMap: Record<string, string>;

    generateFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
    ): GenerateStatus;

    generateFileFromRoutes(
        directory: string,
        className: string,
        namespace: string,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus;

    generateMergedFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus;

    generateClassContents(routes: Record<string, ts.Expression>, routeData: Record<string, HttpRouteData>): string;
}
