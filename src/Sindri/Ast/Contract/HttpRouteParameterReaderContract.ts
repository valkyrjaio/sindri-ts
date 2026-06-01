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

import type { HttpParameterData } from '../Data/HttpParameterData.js';

export interface HttpRouteParameterReaderContract {
    updateParameters(
        decoratorArgs: ts.NodeArray<ts.Expression> | ts.Expression[],
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): HttpParameterData[];

    buildParameterListExpr(parameters: HttpParameterData[]): ts.ArrayLiteralExpression;
}
