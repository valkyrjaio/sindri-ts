/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { RouteAttributeReader } from './Abstract/RouteAttributeReader.ts';
import { HttpRouteData } from './Data/HttpRouteData.ts';
import { HttpRouteAttributeResult } from './Data/Result/HttpRouteAttributeResult.ts';
import { HttpRouteMiddlewareReader } from './HttpRouteMiddlewareReader.ts';
import { HttpRouteParameterReader } from './HttpRouteParameterReader.ts';

import type { ClassDeclaration, Decorator, MethodDeclaration } from 'ts-morph';

import type { HttpRouteAttributeReaderContract } from './Contract/HttpRouteAttributeReaderContract.ts';
import type { HttpRouteMiddlewareReaderContract } from './Contract/HttpRouteMiddlewareReaderContract.ts';
import type { HttpRouteParameterReaderContract } from './Contract/HttpRouteParameterReaderContract.ts';
import type { HandlerData } from './Data/HandlerData.ts';

/**
 * Scans an HTTP controller class file for @Route / @DynamicRoute and related
 * sub-decorators and returns TypeScript compiler API Expr nodes ready for the data cache generator.
 *
 * The shipped decorators accept a single options object
 * (`@Route({ path, name, ... })`), so this reader parses object-literal
 * properties rather than positional arguments. It mirrors the logic of the
 * framework's runtime AttributeRouteCollector but operates entirely on AST
 * without executing any TypeScript code.
 */
export class HttpRouteAttributeReader extends RouteAttributeReader implements HttpRouteAttributeReaderContract {
    constructor(
        protected readonly parameterReader: HttpRouteParameterReaderContract = new HttpRouteParameterReader(),
        protected readonly middlewareReader: HttpRouteMiddlewareReaderContract = new HttpRouteMiddlewareReader(),
    ) {
        super();
    }

    readFile(filePath: string): HttpRouteAttributeResult {
        const context = this.parseClassFile(filePath);

        if (context === undefined) {
            return new HttpRouteAttributeResult();
        }

        const { classDecl, useMap, currentClass } = context;

        const classPathPrefix = this.extractClassPathPrefix(classDecl, useMap, filePath, currentClass);
        const classNamePrefix = this.extractClassNamePrefix(classDecl, useMap, filePath, currentClass);

        return this.buildRouteResult(classDecl, useMap, filePath, currentClass, classPathPrefix, classNamePrefix);
    }

    protected getRouteHandlerDecoratorName(): string {
        return 'RouteHandler';
    }

    protected extractClassPathPrefix(
        classDecl: ClassDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        for (const decorator of this.findDecoratorsOnNode(classDecl, 'Path', useMap, currentFilePath)) {
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

    protected extractClassNamePrefix(
        classDecl: ClassDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        for (const decorator of this.findDecoratorsOnNode(classDecl, 'Name', useMap, currentFilePath)) {
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

    protected buildRouteResult(
        classDecl: ClassDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        classPathPrefix: string,
        classNamePrefix: string,
    ): HttpRouteAttributeResult {
        const routes: Record<string, ts.Expression> = {};
        const routeData: Record<string, HttpRouteData> = {};

        for (const method of classDecl.getMethods()) {
            for (const decorator of this.findDecoratorsOnNode(method, 'Route', useMap, currentFilePath)) {
                this.collectRoute(
                    decorator,
                    method,
                    useMap,
                    currentFilePath,
                    currentClass,
                    classPathPrefix,
                    classNamePrefix,
                    false,
                    routes,
                    routeData,
                );
            }

            for (const decorator of this.findDecoratorsOnNode(method, 'DynamicRoute', useMap, currentFilePath)) {
                this.collectRoute(
                    decorator,
                    method,
                    useMap,
                    currentFilePath,
                    currentClass,
                    classPathPrefix,
                    classNamePrefix,
                    true,
                    routes,
                    routeData,
                );
            }
        }

        const importMap = this.buildImportMap(routeData, useMap, currentFilePath, currentClass);

        return new HttpRouteAttributeResult(routes, routeData, importMap);
    }

    protected collectRoute(
        decorator: Decorator,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        classPathPrefix: string,
        classNamePrefix: string,
        isDynamic: boolean,
        routes: Record<string, ts.Expression>,
        routeData: Record<string, HttpRouteData>,
    ): void {
        const data = this.buildRouteData(
            decorator,
            method,
            useMap,
            currentFilePath,
            currentClass,
            classPathPrefix,
            classNamePrefix,
            isDynamic,
        );

        if (data !== null) {
            routes[data.name] = this.buildRouteExpr(data);
            routeData[data.name] = data;
        }
    }

    protected buildRouteData(
        decorator: Decorator,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        classPathPrefix: string,
        classNamePrefix: string,
        isDynamic: boolean,
    ): HttpRouteData | null {
        const obj = this.getDecoratorObjectArg(decorator);

        if (obj === undefined) {
            return null;
        }

        const path = this.getObjectStringProp(obj, 'path', useMap, currentFilePath, currentClass);
        const name = this.getObjectStringProp(obj, 'name', useMap, currentFilePath, currentClass);

        if (path === '' || name === '') {
            return null;
        }

        const updatedPath = this.updatePath(path, classPathPrefix, method, useMap, currentFilePath, currentClass);
        const updatedName = this.updateName(name, classNamePrefix, method, useMap, currentFilePath, currentClass);

        const resolvedIsDynamic = isDynamic || updatedPath.includes('{');

        const requestMethods = this.middlewareReader.updateRequestMethods(
            this.middlewareReader.extractObjectRequestMethods(obj, useMap, currentFilePath, currentClass),
            method,
            useMap,
            currentFilePath,
            currentClass,
        );

        const [
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            sendingResponseMiddleware,
            responseSentMiddleware,
        ] = this.middlewareReader.updateMiddleware(
            method,
            useMap,
            currentFilePath,
            currentClass,
            this.getObjectClassListProp(obj, 'middleware', useMap, currentFilePath, currentClass),
        );

        return new HttpRouteData(
            updatedPath,
            updatedName,
            this.resolveHandler(obj, method, useMap, currentFilePath, currentClass),
            requestMethods,
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            sendingResponseMiddleware,
            responseSentMiddleware,
            this.resolveRequestStruct(obj, method, useMap, currentFilePath, currentClass),
            this.resolveResponseStruct(obj, method, useMap, currentFilePath, currentClass),
            resolvedIsDynamic,
            resolvedIsDynamic ? this.parameterReader.updateParameters(obj, useMap, currentFilePath, currentClass) : [],
        );
    }

    protected resolveHandler(
        obj: ts.ObjectLiteralExpression,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): HandlerData {
        const fromObj = this.getObjectHandlerProp(obj, 'handler', useMap, currentFilePath, currentClass);

        if (fromObj !== undefined) {
            return fromObj;
        }

        return this.updateHandler(method, useMap, currentFilePath, currentClass);
    }

    protected resolveRequestStruct(
        obj: ts.ObjectLiteralExpression,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string | null {
        const value = this.extractExprValue(
            this.getObjectProp(obj, 'requestStruct'),
            useMap,
            currentFilePath,
            currentClass,
        );

        if (typeof value === 'string' && value !== '') {
            return value;
        }

        return this.middlewareReader.updateRequestStruct(method, useMap, currentFilePath, currentClass);
    }

    protected resolveResponseStruct(
        obj: ts.ObjectLiteralExpression,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string | null {
        const value = this.extractExprValue(
            this.getObjectProp(obj, 'responseStruct'),
            useMap,
            currentFilePath,
            currentClass,
        );

        if (typeof value === 'string' && value !== '') {
            return value;
        }

        return this.middlewareReader.updateResponseStruct(method, useMap, currentFilePath, currentClass);
    }

    protected updatePath(
        path: string,
        classPathPrefix: string,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        if (classPathPrefix !== '') {
            path = classPathPrefix.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
        }

        for (const decorator of this.findDecoratorsOnNode(method, 'Path', useMap, currentFilePath)) {
            const suffix = this.extractExprValue(
                this.getDecoratorArg(decorator, 0),
                useMap,
                currentFilePath,
                currentClass,
            );

            if (typeof suffix === 'string' && suffix !== '') {
                path = path.replace(/\/$/, '') + '/' + suffix.replace(/^\//, '');
            }
        }

        return path;
    }

    protected updateName(
        name: string,
        classNamePrefix: string,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        if (classNamePrefix !== '') {
            name = classNamePrefix + '.' + name;
        }

        for (const decorator of this.findDecoratorsOnNode(method, 'Name', useMap, currentFilePath)) {
            const suffix = this.extractExprValue(
                this.getDecoratorArg(decorator, 0),
                useMap,
                currentFilePath,
                currentClass,
            );

            if (typeof suffix === 'string' && suffix !== '') {
                name = name + '.' + suffix;
            }
        }

        return name;
    }

    /**
     * Emit `new DynamicRoute(path, name, regex, parameters, handler,
     * requestMethods, ...5 middleware, requestStruct, responseStruct)` or
     * `new Route(path, name, handler, requestMethods, ...5 middleware,
     * requestStruct, responseStruct)`, matching the framework constructor order.
     *
     * For dynamic routes the regex slot is emitted as an empty-string
     * placeholder; the generator computes and injects the real regex (it owns
     * the routing `Processor`), and the parameters array is always emitted (`[]`
     * when empty).
     */
    protected buildRouteExpr(data: HttpRouteData): ts.Expression {
        const args: ts.Expression[] = [this.buildEnumCaseExpr(data.path), this.buildEnumCaseExpr(data.name)];

        if (data.isDynamic) {
            args.push(this.buildStringExpr(''));
            args.push(this.parameterReader.buildParameterListExpr([...data.parameters]));
        }

        args.push(data.handler !== null ? this.buildHandlerExpr(data.handler) : this.buildNullExpr());
        args.push(this.buildEnumCaseArrayExpr(data.requestMethods));
        args.push(...this.middlewareReader.buildRouteMiddlewareArgs(data));
        args.push(...this.middlewareReader.buildRouteStructArgs(data));

        const targetClass = data.isDynamic
            ? 'Valkyrja\\Http\\Routing\\Data\\DynamicRoute'
            : 'Valkyrja\\Http\\Routing\\Data\\Route';

        return this.buildNewExpr(targetClass, args);
    }

    /**
     * Build the class-name → absolute-file-path map for every handler and
     * middleware class the generated data cache references, so the generator can
     * emit the matching import statements.
     */
    protected buildImportMap(
        routeData: Record<string, HttpRouteData>,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): Record<string, string> {
        const importMap: Record<string, string> = {};

        for (const data of Object.values(routeData)) {
            if (data.handler !== null) {
                this.addClassImport(importMap, data.handler.class, useMap, currentFilePath, currentClass);
            }

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

        const filePath =
            shortName === currentClass
                ? currentFilePath
                : this.resolveImportToFilePath(shortName, useMap, currentFilePath);

        if (filePath !== '') {
            importMap[shortName] = filePath;
        }
    }
}
