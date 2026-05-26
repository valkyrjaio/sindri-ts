/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type ts from 'typescript';

import type { MethodDeclaration } from 'ts-morph';

import type { CliArgumentParameterData } from '../Data/CliArgumentParameterData.js';
import type { CliOptionParameterData } from '../Data/CliOptionParameterData.js';
import type { CliRouteData } from '../Data/CliRouteData.js';

export interface CliRouteParameterReaderContract {
    buildParameterArgs(data: CliRouteData): ts.Expression[];

    updateArguments(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): CliArgumentParameterData[];

    updateOptions(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): CliOptionParameterData[];
}