/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ts from 'typescript';

import { RouteAttributeReader } from './Abstract/RouteAttributeReader.js';
import { HttpRouteData } from './Data/HttpRouteData.js';
import { HttpRouteAttributeResult } from './Data/Result/HttpRouteAttributeResult.js';
import { HttpRouteMiddlewareReader } from './HttpRouteMiddlewareReader.js';
import { HttpRouteParameterReader } from './HttpRouteParameterReader.js';

import type { ClassDeclaration, Decorator, MethodDeclaration } from 'ts-morph';

import type { HttpRouteAttributeReaderContract } from './Contract/HttpRouteAttributeReaderContract.js';
import type { HttpRouteMiddlewareReaderContract } from './Contract/HttpRouteMiddlewareReaderContract.js';
import type { HttpRouteParameterReaderContract } from './Contract/HttpRouteParameterReaderContract.js';

/**
 * Scans an HTTP controller class file for @Route / @DynamicRoute and related
 * sub-decorators and returns TypeScript compiler API Expr nodes ready for the data cache generator.
 *
 * Mirrors the logic of the framework's runtime AttributeRouteCollector but operates
 * entirely on AST without executing any TypeScript code.
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
            const value = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, currentFilePath, currentClass);

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
            const value = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, currentFilePath, currentClass);

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
                const data = this.buildRouteData(decorator, method, useMap, currentFilePath, currentClass, classPathPrefix, classNamePrefix, false);

                if (data !== null) {
                    routes[data.name] = this.buildRouteExpr(data);
                    routeData[data.name] = data;
                }
            }

            for (const decorator of this.findDecoratorsOnNode(method, 'DynamicRoute', useMap, currentFilePath)) {
                const data = this.buildRouteData(decorator, method, useMap, currentFilePath, currentClass, classPathPrefix, classNamePrefix, true);

                if (data !== null) {
                    routes[data.name] = this.buildRouteExpr(data);
                    routeData[data.name] = data;
                }
            }
        }

        return new HttpRouteAttributeResult(routes, routeData);
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
        const path = this.extractStringArg(decorator, 0, useMap, currentFilePath, currentClass);
        const name = this.extractStringArg(decorator, 1, useMap, currentFilePath, currentClass);

        if (path === '' || name === '') {
            return null;
        }

        const updatedPath = this.updatePath(path, classPathPrefix, method, useMap, currentFilePath, currentClass);
        const updatedName = this.updateName(name, classNamePrefix, method, useMap, currentFilePath, currentClass);

        const resolvedIsDynamic = isDynamic || updatedPath.includes('{');

        const decoratorArgs = decorator.getArguments().map((a) => a.compilerNode);

        const requestMethods = this.middlewareReader.updateRequestMethods(
            this.middlewareReader.extractInlineRequestMethods(decoratorArgs, useMap, currentFilePath, currentClass),
            method,
            useMap,
            currentFilePath,
            currentClass,
        );

        const [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, sendingResponseMiddleware, terminatedMiddleware] =
            this.middlewareReader.updateMiddleware(
                method,
                useMap,
                currentFilePath,
                currentClass,
                this.extractClassListArgFromDecorator(decorator, 5, useMap, currentFilePath, currentClass),
                this.extractClassListArgFromDecorator(decorator, 6, useMap, currentFilePath, currentClass),
                this.extractClassListArgFromDecorator(decorator, 7, useMap, currentFilePath, currentClass),
                this.extractClassListArgFromDecorator(decorator, 8, useMap, currentFilePath, currentClass),
                this.extractClassListArgFromDecorator(decorator, 9, useMap, currentFilePath, currentClass),
            );

        return new HttpRouteData(
            updatedPath,
            updatedName,
            this.updateHandler(method, useMap, currentFilePath, currentClass),
            requestMethods,
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            sendingResponseMiddleware,
            terminatedMiddleware,
            this.middlewareReader.updateRequestStruct(method, useMap, currentFilePath, currentClass),
            this.middlewareReader.updateResponseStruct(method, useMap, currentFilePath, currentClass),
            resolvedIsDynamic,
            resolvedIsDynamic ? this.updateParameters(decoratorArgs, method, useMap, currentFilePath, currentClass) : [],
        );
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
            const suffix = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, currentFilePath, currentClass);

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
            const suffix = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, currentFilePath, currentClass);

            if (typeof suffix === 'string' && suffix !== '') {
                name = name + '.' + suffix;
            }
        }

        return name;
    }

    protected buildRouteExpr(data: HttpRouteData): ts.Expression {
        const args: ts.Expression[] = [
            this.buildEnumCaseExpr(data.path),
            this.buildEnumCaseExpr(data.name),
        ];

        if (data.isDynamic && data.parameters.length > 0) {
            args.push(this.parameterReader.buildParameterListExpr([...data.parameters]));
        }

        if (data.handler !== null) {
            args.push(this.buildHandlerExpr(data.handler));
        } else {
            args.push(this.buildNullExpr());
        }

        if (data.requestMethods.length > 0) {
            args.push(this.buildEnumCaseArrayExpr(data.requestMethods));
        }

        args.push(...this.middlewareReader.buildRouteMiddlewareArgs(data));
        args.push(...this.middlewareReader.buildRouteStructArgs(data));

        const targetClass = data.isDynamic
            ? 'Valkyrja\\Http\\Routing\\Data\\DynamicRoute'
            : 'Valkyrja\\Http\\Routing\\Data\\Route';

        return this.buildNewExpr(targetClass, args);
    }

    protected updateParameters(
        decoratorArgs: ts.Expression[],
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): import('./Data/HttpParameterData.js').HttpParameterData[] {
        return this.parameterReader.updateParameters(decoratorArgs, method, useMap, currentFilePath, currentClass);
    }
}