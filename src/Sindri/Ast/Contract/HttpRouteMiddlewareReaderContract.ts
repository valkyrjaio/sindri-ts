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

import type { HttpRouteData } from '../Data/HttpRouteData.js';

export interface HttpRouteMiddlewareReaderContract {
    extractInlineRequestMethods(
        decoratorArgs: ts.NodeArray<ts.Expression> | ts.Expression[],
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string[];

    updateRequestMethods(
        requestMethods: string[],
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string[];

    updateMiddleware(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
        routeMatchedMiddleware: string[],
        routeDispatchedMiddleware: string[],
        throwableCaughtMiddleware: string[],
        sendingResponseMiddleware: string[],
        terminatedMiddleware: string[],
    ): [string[], string[], string[], string[], string[]];

    updateRequestStruct(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string | null;

    updateResponseStruct(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string | null;

    buildRouteMiddlewareArgs(data: HttpRouteData): ts.Expression[];

    buildRouteStructArgs(data: HttpRouteData): ts.Expression[];
}
