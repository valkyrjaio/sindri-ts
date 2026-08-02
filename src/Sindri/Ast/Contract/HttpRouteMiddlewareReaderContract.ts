/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

import type { MethodDeclaration } from 'ts-morph';

import type { HttpRouteData } from '../Data/HttpRouteData.ts';

export interface HttpRouteMiddlewareReaderContract {
    extractObjectRequestMethods(
        obj: ts.ObjectLiteralExpression,
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
        middleware: string[],
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
