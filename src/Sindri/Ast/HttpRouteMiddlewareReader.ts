/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';

import type { MethodDeclaration } from 'ts-morph';

import type { HttpRouteData } from './Data/HttpRouteData.ts';
import type { HttpRouteMiddlewareReaderContract } from './Contract/HttpRouteMiddlewareReaderContract.ts';

/**
 * Reads middleware, request methods, and struct decorators for HTTP routes, and builds
 * their corresponding AST expressions.
 *
 * Extracted from HttpRouteAttributeReader to keep each class under the
 * complexity threshold; injected as a constructor argument.
 */
export class HttpRouteMiddlewareReader extends AstReader implements HttpRouteMiddlewareReaderContract {
    extractObjectRequestMethods(
        obj: ts.ObjectLiteralExpression,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string[] {
        return this.getObjectClassListProp(obj, 'requestMethods', useMap, namespace, currentClass);
    }

    updateRequestMethods(
        requestMethods: string[],
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string[] {
        for (const decorator of this.findDecoratorsOnNode(method, 'RequestMethod', useMap, namespace)) {
            for (const arg of decorator.getArguments()) {
                const value = this.extractExprValue(arg, useMap, namespace, currentClass);

                if (typeof value === 'string' && value !== '') {
                    requestMethods = [...requestMethods, value];
                }
            }
        }

        if (requestMethods.length === 0) {
            requestMethods = [
                'Valkyrja\\Http\\Message\\Enum\\RequestMethod::HEAD',
                'Valkyrja\\Http\\Message\\Enum\\RequestMethod::GET',
            ];
        }

        return requestMethods;
    }

    updateMiddleware(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
        middleware: string[],
    ): [string[], string[], string[], string[], string[]] {
        let routeMatchedMiddleware: string[] = [];
        let routeDispatchedMiddleware: string[] = [];
        let throwableCaughtMiddleware: string[] = [];
        let sendingResponseMiddleware: string[] = [];
        let responseSentMiddleware: string[] = [];

        for (const mwName of middleware) {
            [
                routeMatchedMiddleware,
                routeDispatchedMiddleware,
                throwableCaughtMiddleware,
                sendingResponseMiddleware,
                responseSentMiddleware,
            ] = this.classifyMiddleware(
                mwName,
                useMap,
                namespace,
                routeMatchedMiddleware,
                routeDispatchedMiddleware,
                throwableCaughtMiddleware,
                sendingResponseMiddleware,
                responseSentMiddleware,
            );
        }

        for (const decorator of this.findDecoratorsOnNode(method, 'Middleware', useMap, namespace)) {
            // `@Middleware` takes a thunked class reference (`() => AuthMiddleware`).
            const mwName = this.extractExprValue(
                this.unwrapClassThunk(this.getDecoratorArg(decorator, 0)),
                useMap,
                namespace,
                currentClass,
            );

            if (typeof mwName !== 'string' || mwName === '') {
                continue;
            }

            [
                routeMatchedMiddleware,
                routeDispatchedMiddleware,
                throwableCaughtMiddleware,
                sendingResponseMiddleware,
                responseSentMiddleware,
            ] = this.classifyMiddleware(
                mwName,
                useMap,
                namespace,
                routeMatchedMiddleware,
                routeDispatchedMiddleware,
                throwableCaughtMiddleware,
                sendingResponseMiddleware,
                responseSentMiddleware,
            );
        }

        return [
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            sendingResponseMiddleware,
            responseSentMiddleware,
        ];
    }

    updateRequestStruct(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string | null {
        for (const decorator of this.findDecoratorsOnNode(method, 'RequestStruct', useMap, namespace)) {
            const value = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, namespace, currentClass);

            if (typeof value === 'string' && value !== '') {
                return value;
            }
        }

        return null;
    }

    updateResponseStruct(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string | null {
        for (const decorator of this.findDecoratorsOnNode(method, 'ResponseStruct', useMap, namespace)) {
            const value = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, namespace, currentClass);

            if (typeof value === 'string' && value !== '') {
                return value;
            }
        }

        return null;
    }

    buildRouteMiddlewareArgs(data: HttpRouteData): ts.Expression[] {
        return [
            this.buildClassIdentifierArrayExpr(data.routeMatchedMiddleware),
            this.buildClassIdentifierArrayExpr(data.routeDispatchedMiddleware),
            this.buildClassIdentifierArrayExpr(data.throwableCaughtMiddleware),
            this.buildClassIdentifierArrayExpr(data.sendingResponseMiddleware),
            this.buildClassIdentifierArrayExpr(data.responseSentMiddleware),
        ];
    }

    buildRouteStructArgs(data: HttpRouteData): ts.Expression[] {
        const args: ts.Expression[] = [];

        if (data.requestStruct !== null) {
            args.push(this.buildClassConstExpr(data.requestStruct));
        } else {
            args.push(this.buildNullExpr());
        }

        if (data.responseStruct !== null) {
            args.push(this.buildClassConstExpr(data.responseStruct));
        } else {
            args.push(this.buildNullExpr());
        }

        return args;
    }

    protected classifyMiddleware(
        mwName: string,
        useMap: Record<string, string>,
        currentFilePath: string,
        routeMatchedMiddleware: string[],
        routeDispatchedMiddleware: string[],
        throwableCaughtMiddleware: string[],
        sendingResponseMiddleware: string[],
        responseSentMiddleware: string[],
    ): [string[], string[], string[], string[], string[]] {
        if (this.classImplementsInterface(mwName, 'RouteMatchedMiddlewareContract', useMap, currentFilePath)) {
            routeMatchedMiddleware = [...routeMatchedMiddleware, mwName];
        }

        if (this.classImplementsInterface(mwName, 'RouteDispatchedMiddlewareContract', useMap, currentFilePath)) {
            routeDispatchedMiddleware = [...routeDispatchedMiddleware, mwName];
        }

        if (this.classImplementsInterface(mwName, 'ThrowableCaughtMiddlewareContract', useMap, currentFilePath)) {
            throwableCaughtMiddleware = [...throwableCaughtMiddleware, mwName];
        }

        if (this.classImplementsInterface(mwName, 'SendingResponseMiddlewareContract', useMap, currentFilePath)) {
            sendingResponseMiddleware = [...sendingResponseMiddleware, mwName];
        }

        if (this.classImplementsInterface(mwName, 'ResponseSentMiddlewareContract', useMap, currentFilePath)) {
            responseSentMiddleware = [...responseSentMiddleware, mwName];
        }

        return [
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            sendingResponseMiddleware,
            responseSentMiddleware,
        ];
    }
}
