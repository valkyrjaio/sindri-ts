/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

import type { MethodDeclaration } from 'ts-morph';

import type { CliArgumentParameterData } from '../Data/CliArgumentParameterData.ts';
import type { CliOptionParameterData } from '../Data/CliOptionParameterData.ts';
import type { CliRouteData } from '../Data/CliRouteData.ts';

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
