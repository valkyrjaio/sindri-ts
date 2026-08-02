/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ts } from 'ts-morph';

import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export interface CliDataFileGeneratorContract {
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

    generateMergedFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
        routeExprs: readonly ts.Expression[],
    ): GenerateStatus;

    generateClassContents(routes: Record<string, ts.Expression>): string;
}
