/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { RouteAttributeReader } from './Abstract/RouteAttributeReader.ts';
import { CliRouteData } from './Data/CliRouteData.ts';
import { CliRouteAttributeResult } from './Data/Result/CliRouteAttributeResult.ts';
import { CliRouteParameterReader } from './CliRouteParameterReader.ts';

import type { Decorator, MethodDeclaration } from 'ts-morph';

import type { CliRouteAttributeReaderContract } from './Contract/CliRouteAttributeReaderContract.ts';
import type { CliRouteParameterReaderContract } from './Contract/CliRouteParameterReaderContract.ts';
import type { HandlerData } from './Data/HandlerData.ts';

/**
 * Scans a CLI controller class file for @Route and related sub-decorators and
 * returns TypeScript compiler API Expr nodes ready for the data cache generator.
 *
 * Mirrors the logic of the framework's runtime attribute collector but operates
 * entirely on AST without executing any TypeScript code.
 */
export class CliRouteAttributeReader extends RouteAttributeReader implements CliRouteAttributeReaderContract {
    constructor(protected readonly parameterReader: CliRouteParameterReaderContract = new CliRouteParameterReader()) {
        super();
    }

    readFile(filePath: string): CliRouteAttributeResult {
        const context = this.parseClassFile(filePath);

        if (context === undefined) {
            return new CliRouteAttributeResult();
        }

        const { classDecl, useMap, currentClass } = context;
        const routes: Record<string, ts.Expression> = {};
        const routeData: Record<string, CliRouteData> = {};

        for (const method of classDecl.getMethods()) {
            for (const decorator of this.findDecoratorsOnNode(method, 'Route', useMap, filePath)) {
                const data = this.buildRouteData(decorator, method, useMap, filePath, currentClass);

                if (data !== null) {
                    routes[data.name] = this.buildRouteExpr(data);
                    routeData[data.name] = data;
                }
            }
        }

        const importMap = this.buildImportMap(routeData, useMap, filePath, currentClass);

        return new CliRouteAttributeResult(routes, importMap);
    }

    protected getRouteHandlerDecoratorName(): string {
        return 'RouteHandler';
    }

    protected buildRouteData(
        decorator: Decorator,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): CliRouteData | null {
        const obj = this.getDecoratorObjectArg(decorator);

        if (obj === undefined) {
            return null;
        }

        const name = this.getObjectStringProp(obj, 'name', useMap, currentFilePath, currentClass);
        const description = this.getObjectStringProp(obj, 'description', useMap, currentFilePath, currentClass);

        if (name === '' || description === '') {
            return null;
        }

        const updatedName = this.updateName(name, method, useMap, currentFilePath, currentClass);
        const [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, processExitingMiddleware] =
            this.updateMiddleware(
                method,
                useMap,
                currentFilePath,
                currentClass,
                this.getObjectClassListProp(obj, 'middleware', useMap, currentFilePath, currentClass),
            );

        return new CliRouteData(
            updatedName,
            description,
            this.resolveHandler(obj, method, useMap, currentFilePath, currentClass),
            this.getObjectHandlerProp(obj, 'helpText', useMap, currentFilePath, currentClass) ?? null,
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            processExitingMiddleware,
            this.parameterReader.updateArguments(method, useMap, currentFilePath, currentClass),
            this.parameterReader.updateOptions(method, useMap, currentFilePath, currentClass),
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

    protected updateName(
        name: string,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        for (const decorator of this.findDecoratorsOnNode(method, 'Name', useMap, currentFilePath)) {
            const override = this.extractExprValue(
                this.getDecoratorArg(decorator, 0),
                useMap,
                currentFilePath,
                currentClass,
            );

            if (typeof override === 'string' && override !== '') {
                name = override;
            }
        }

        return name;
    }

    protected updateMiddleware(
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        middleware: string[],
    ): [string[], string[], string[], string[]] {
        let routeMatchedMiddleware: string[] = [];
        let routeDispatchedMiddleware: string[] = [];
        let throwableCaughtMiddleware: string[] = [];
        let processExitingMiddleware: string[] = [];

        for (const mwName of middleware) {
            [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, processExitingMiddleware] =
                this.classifyMiddleware(
                    mwName,
                    useMap,
                    currentFilePath,
                    routeMatchedMiddleware,
                    routeDispatchedMiddleware,
                    throwableCaughtMiddleware,
                    processExitingMiddleware,
                );
        }

        for (const decorator of this.findDecoratorsOnNode(method, 'Middleware', useMap, currentFilePath)) {
            // `@Middleware` takes a thunked class reference (`() => AuthMiddleware`).
            const mwName = this.extractExprValue(
                this.unwrapClassThunk(this.getDecoratorArg(decorator, 0)),
                useMap,
                currentFilePath,
                currentClass,
            );

            if (typeof mwName !== 'string' || mwName === '') {
                continue;
            }

            [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, processExitingMiddleware] =
                this.classifyMiddleware(
                    mwName,
                    useMap,
                    currentFilePath,
                    routeMatchedMiddleware,
                    routeDispatchedMiddleware,
                    throwableCaughtMiddleware,
                    processExitingMiddleware,
                );
        }

        return [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, processExitingMiddleware];
    }

    protected classifyMiddleware(
        mwName: string,
        useMap: Record<string, string>,
        currentFilePath: string,
        routeMatchedMiddleware: string[],
        routeDispatchedMiddleware: string[],
        throwableCaughtMiddleware: string[],
        processExitingMiddleware: string[],
    ): [string[], string[], string[], string[]] {
        if (this.classImplementsInterface(mwName, 'RouteMatchedMiddlewareContract', useMap, currentFilePath)) {
            routeMatchedMiddleware = [...routeMatchedMiddleware, mwName];
        }

        if (this.classImplementsInterface(mwName, 'RouteDispatchedMiddlewareContract', useMap, currentFilePath)) {
            routeDispatchedMiddleware = [...routeDispatchedMiddleware, mwName];
        }

        if (this.classImplementsInterface(mwName, 'ThrowableCaughtMiddlewareContract', useMap, currentFilePath)) {
            throwableCaughtMiddleware = [...throwableCaughtMiddleware, mwName];
        }

        if (this.classImplementsInterface(mwName, 'ProcessExitingMiddlewareContract', useMap, currentFilePath)) {
            processExitingMiddleware = [...processExitingMiddleware, mwName];
        }

        return [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, processExitingMiddleware];
    }

    protected buildRouteExpr(data: CliRouteData): ts.Expression {
        const args: ts.Expression[] = [this.buildEnumCaseExpr(data.name), this.buildStringExpr(data.description)];

        if (data.handler !== null) {
            args.push(this.buildHandlerExpr(data.handler));
        } else {
            args.push(this.buildNullExpr());
        }

        if (data.helpText !== null) {
            args.push(this.buildHandlerExpr(data.helpText));
        } else {
            args.push(this.buildNullExpr());
        }

        args.push(...this.buildRouteMiddlewareArgs(data));
        args.push(...this.parameterReader.buildParameterArgs(data));

        return this.buildNewExpr('Valkyrja\\Cli\\Routing\\Data\\Route', args);
    }

    protected buildRouteMiddlewareArgs(data: CliRouteData): ts.Expression[] {
        return [
            this.buildClassArrayExpr(data.routeMatchedMiddleware),
            this.buildClassArrayExpr(data.routeDispatchedMiddleware),
            this.buildClassArrayExpr(data.throwableCaughtMiddleware),
            this.buildClassArrayExpr(data.processExitingMiddleware),
        ];
    }

    /**
     * Build the class-name → absolute-file-path map for every handler and
     * help-text class the generated data cache references, so the generator can
     * emit the matching import statements. (Middleware are emitted as string
     * literals and therefore need no import.)
     */
    protected buildImportMap(
        routeData: Record<string, CliRouteData>,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): Record<string, string> {
        const importMap: Record<string, string> = {};

        for (const data of Object.values(routeData)) {
            if (data.handler !== null) {
                this.addClassImport(importMap, data.handler.class, useMap, currentFilePath, currentClass);
            }

            if (data.helpText !== null) {
                this.addClassImport(importMap, data.helpText.class, useMap, currentFilePath, currentClass);
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
