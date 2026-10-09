/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { GrpcRouteData } from './Data/GrpcRouteData.ts';
import { HandlerData } from './Data/HandlerData.ts';
import { GrpcRouteAttributeResult } from './Data/Result/GrpcRouteAttributeResult.ts';

import type { ClassDeclaration, Decorator, MethodDeclaration } from 'ts-morph';

import type { GrpcRouteAttributeReaderContract } from './Contract/GrpcRouteAttributeReaderContract.ts';

export class GrpcRouteAttributeReader extends AstReader implements GrpcRouteAttributeReaderContract {
    protected static readonly STAGE_CONTRACTS = {
        routeMatched: '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/RouteMatchedMiddlewareContract',
        routeDispatched: '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/RouteDispatchedMiddlewareContract',
        throwableCaught: '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/ThrowableCaughtMiddlewareContract',
        sendingResponse: '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/SendingResponseMiddlewareContract',
        responseSent: '@valkyrjaio/valkyrja/Grpc/Middleware/Contract/ResponseSentMiddlewareContract',
    } as const;

    readFile(filePath: string): GrpcRouteAttributeResult {
        const context = this.parseClassFile(filePath);

        if (context === undefined) {
            return new GrpcRouteAttributeResult();
        }

        const { classDecl, useMap, currentClass } = context;
        const service = this.readService(classDecl, useMap, filePath, currentClass);

        // A controller without a `@Service` decorator names no service, so it can key no route.
        if (service === '') {
            return new GrpcRouteAttributeResult();
        }

        const routes: Record<string, ts.Expression> = {};
        const routeData: GrpcRouteData[] = [];

        for (const method of classDecl.getMethods()) {
            for (const decorator of this.findDecoratorsOnNode(method, 'Method', useMap, filePath)) {
                const data = this.buildRouteData(decorator, method, service, useMap, filePath, currentClass);

                if (data !== null) {
                    routes[data.method] = this.buildRouteExpr(data);
                    routeData.push(data);
                }
            }
        }

        return new GrpcRouteAttributeResult(routes, this.buildImportMap(routeData, useMap, filePath, currentClass));
    }

    /** Read the service name the `@Service` class decorator declares. */
    protected readService(
        classDecl: ClassDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        for (const decorator of this.findDecoratorsOnNode(classDecl, 'Service', useMap, currentFilePath)) {
            const value = this.extractExprValue(
                this.getDecoratorArg(decorator, 0),
                useMap,
                currentFilePath,
                currentClass,
            );

            if (typeof value === 'string' && value !== '') {
                return value;
            }
        }

        return '';
    }

    protected buildRouteData(
        decorator: Decorator,
        method: MethodDeclaration,
        service: string,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): GrpcRouteData | null {
        const obj = this.getDecoratorObjectArg(decorator);

        if (obj === undefined) {
            return null;
        }

        const name = this.getObjectStringProp(obj, 'name', useMap, currentFilePath, currentClass);

        if (name === '') {
            return null;
        }

        const [routeMatched, routeDispatched, throwableCaught, sendingResponse, responseSent] = this.readMiddleware(
            obj,
            method,
            useMap,
            currentFilePath,
            currentClass,
        );

        return new GrpcRouteData(
            `/${service}/${name}`,
            this.resolveHandler(obj, method, useMap, currentFilePath, currentClass),
            this.getObjectBoolProp(obj, 'clientStreaming', useMap, currentFilePath, currentClass),
            this.getObjectBoolProp(obj, 'serverStreaming', useMap, currentFilePath, currentClass),
            routeMatched,
            routeDispatched,
            throwableCaught,
            sendingResponse,
            responseSent,
        );
    }

    /**
     * Resolve the handler for a method.
     *
     * A `@Method` decorator that names no handler falls back to the static method of the same name
     * on the controller. The framework runtime collector applies the same fallback, so the cached
     * path and the debug path resolve one handler.
     */
    protected resolveHandler(
        obj: ts.ObjectLiteralExpression,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HandlerData {
        return (
            this.getObjectHandlerProp(obj, 'handler', useMap, currentFilePath, currentClass) ??
            new HandlerData(currentClass, method.getName())
        );
    }

    /**
     * Collect the middleware a method schedules, in the stage order the `Route` constructor takes.
     */
    protected readMiddleware(
        obj: ts.ObjectLiteralExpression,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): [string[], string[], string[], string[], string[]] {
        const byStage = this.groupMiddlewareByStage(
            this.readMiddlewareNames(obj, method, useMap, currentFilePath, currentClass),
            GrpcRouteAttributeReader.STAGE_CONTRACTS,
            useMap,
            currentFilePath,
        );

        return [
            byStage.routeMatched,
            byStage.routeDispatched,
            byStage.throwableCaught,
            byStage.sendingResponse,
            byStage.responseSent,
        ];
    }

    /** Read every middleware class name a method schedules, in declaration order. */
    protected readMiddlewareNames(
        obj: ts.ObjectLiteralExpression,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string[] {
        const names = this.getObjectClassListProp(obj, 'middleware', useMap, currentFilePath, currentClass);

        for (const decorator of this.findDecoratorsOnNode(method, 'Middleware', useMap, currentFilePath)) {
            // `@Middleware` takes a thunked class reference (`() => AuthMiddleware`).
            const name = this.extractExprValue(
                this.unwrapClassThunk(this.getDecoratorArg(decorator, 0)),
                useMap,
                currentFilePath,
                currentClass,
            );

            if (typeof name === 'string' && name !== '') {
                names.push(name);
            }
        }

        return names;
    }

    /**
     * Build the route construction the generated service map holds.
     *
     * The gRPC `Route` constructor takes the service and the method name after the handler, and both
     * default from the fully-qualified method. The reader passes them anyway, because the streaming
     * flags that follow them are positional.
     */
    protected buildRouteExpr(data: GrpcRouteData): ts.Expression {
        const separator = data.method.lastIndexOf('/');

        return this.buildNewExpr('Valkyrja\\Grpc\\Routing\\Data\\Route', [
            this.buildStringExpr(data.method),
            this.buildHandlerExpr(data.handler),
            this.buildStringExpr(data.method.slice(1, separator)),
            this.buildStringExpr(data.method.slice(separator + 1)),
            this.buildNullExpr(),
            this.buildNullExpr(),
            this.buildBoolExpr(data.clientStreaming),
            this.buildBoolExpr(data.serverStreaming),
            this.buildClassIdentifierArrayExpr(data.routeMatchedMiddleware),
            this.buildClassIdentifierArrayExpr(data.routeDispatchedMiddleware),
            this.buildClassIdentifierArrayExpr(data.throwableCaughtMiddleware),
            this.buildClassIdentifierArrayExpr(data.sendingResponseMiddleware),
            this.buildClassIdentifierArrayExpr(data.responseSentMiddleware),
        ]);
    }

    /**
     * Build the class-name to absolute-file-path map for every handler class and middleware class
     * the generated data cache references, so the generator emits the matching import statements.
     */
    protected buildImportMap(
        routeData: readonly GrpcRouteData[],
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): Record<string, string> {
        const importMap: Record<string, string> = {};

        for (const data of routeData) {
            this.addClassImport(importMap, data.handler.class, useMap, currentFilePath, currentClass);

            for (const middleware of [
                ...data.routeMatchedMiddleware,
                ...data.routeDispatchedMiddleware,
                ...data.throwableCaughtMiddleware,
                ...data.sendingResponseMiddleware,
                ...data.responseSentMiddleware,
            ]) {
                this.addClassImport(importMap, middleware, useMap, currentFilePath, currentClass);
            }
        }

        return importMap;
    }

    protected addClassImport(
        importMap: Record<string, string>,
        className: string,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): void {
        const shortName = className.slice(className.lastIndexOf('\\') + 1);
        const filePath = this.resolveClassImportPath(shortName, useMap, currentFilePath, currentClass);

        if (filePath !== '') {
            importMap[shortName] = filePath;
        }
    }

    /**
     * Resolve the file that declares a referenced class.
     *
     * A middleware the controller file declares itself is in no import map, so the read file is
     * where the generated import statement points. The generator emits an identifier for every
     * class it references, and an identifier with no import does not compile.
     */
    protected resolveClassImportPath(
        shortName: string,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        if (shortName === currentClass) {
            return currentFilePath;
        }

        const importedPath = this.resolveImportToFilePath(shortName, useMap, currentFilePath);

        if (importedPath !== '') {
            return importedPath;
        }

        const sourceFile = this.parseAncestorSourceFile(currentFilePath);

        return sourceFile?.getClass(shortName) === undefined ? '' : currentFilePath;
    }
}
