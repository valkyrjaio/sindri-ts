/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.js';

import type { MethodDeclaration } from 'ts-morph';

import type { HttpRouteData } from './Data/HttpRouteData.js';
import type { HttpRouteMiddlewareReaderContract } from './Contract/HttpRouteMiddlewareReaderContract.js';

/**
 * Reads middleware, request methods, and struct decorators for HTTP routes, and builds
 * their corresponding AST expressions.
 *
 * Extracted from HttpRouteAttributeReader to keep each class under the
 * complexity threshold; injected as a constructor argument.
 */
export class HttpRouteMiddlewareReader extends AstReader implements HttpRouteMiddlewareReaderContract {
    extractInlineRequestMethods(
        decoratorArgs: ts.NodeArray<ts.Expression> | ts.Expression[],
        useMap: Record<string, string>,
        namespace: string,
        currentClass: string,
    ): string[] {
        const requestMethodsArg = decoratorArgs[3];

        if (requestMethodsArg === undefined || !ts.isArrayLiteralExpression(requestMethodsArg)) {
            return [];
        }

        return this.extractClassListFromArrayExpr(requestMethodsArg, useMap, namespace, currentClass);
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
        routeMatchedMiddleware: string[],
        routeDispatchedMiddleware: string[],
        throwableCaughtMiddleware: string[],
        sendingResponseMiddleware: string[],
        terminatedMiddleware: string[],
    ): [string[], string[], string[], string[], string[]] {
        for (const decorator of this.findDecoratorsOnNode(method, 'Middleware', useMap, namespace)) {
            const mwName = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, namespace, currentClass);

            if (typeof mwName !== 'string' || mwName === '') {
                continue;
            }

            [
                routeMatchedMiddleware,
                routeDispatchedMiddleware,
                throwableCaughtMiddleware,
                sendingResponseMiddleware,
                terminatedMiddleware,
            ] = this.classifyMiddleware(
                mwName,
                useMap,
                namespace,
                routeMatchedMiddleware,
                routeDispatchedMiddleware,
                throwableCaughtMiddleware,
                sendingResponseMiddleware,
                terminatedMiddleware,
            );
        }

        return [
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            sendingResponseMiddleware,
            terminatedMiddleware,
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
            this.buildClassIdentifierArrayExpr(data.terminatedMiddleware),
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
        terminatedMiddleware: string[],
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

        if (this.classImplementsInterface(mwName, 'TerminatedMiddlewareContract', useMap, currentFilePath)) {
            terminatedMiddleware = [...terminatedMiddleware, mwName];
        }

        return [
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            sendingResponseMiddleware,
            terminatedMiddleware,
        ];
    }
}
