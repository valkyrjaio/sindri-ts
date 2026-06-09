/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ts } from 'ts-morph';

import type { HttpRouteData } from '../../../Ast/Data/HttpRouteData.js';
import type { GenerateStatus } from '../../Enum/GenerateStatus.js';

export interface HttpDataFileGeneratorContract {
    generateFile(
        directory: string,
        className: string,
        namespace: string,
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
    ): GenerateStatus;

    generateClassContents(routes: Record<string, ts.Expression>, routeData: Record<string, HttpRouteData>): string;
}
