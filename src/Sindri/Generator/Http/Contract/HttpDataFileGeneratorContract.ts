/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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

    generateClassContents(routes: Record<string, ts.Expression>, routeData: Record<string, HttpRouteData>): string;
}
