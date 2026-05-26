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
import { CliRouteData } from './Data/CliRouteData.js';
import { CliRouteAttributeResult } from './Data/Result/CliRouteAttributeResult.js';
import { CliRouteParameterReader } from './CliRouteParameterReader.js';

import type { Decorator, MethodDeclaration } from 'ts-morph';

import type { CliRouteAttributeReaderContract } from './Contract/CliRouteAttributeReaderContract.js';
import type { CliRouteParameterReaderContract } from './Contract/CliRouteParameterReaderContract.js';

/**
 * Scans a CLI controller class file for @Route and related sub-decorators and
 * returns TypeScript compiler API Expr nodes ready for the data cache generator.
 *
 * Mirrors the logic of the framework's runtime attribute collector but operates
 * entirely on AST without executing any TypeScript code.
 */
export class CliRouteAttributeReader extends RouteAttributeReader implements CliRouteAttributeReaderContract {
    constructor(
        protected readonly parameterReader: CliRouteParameterReaderContract = new CliRouteParameterReader(),
    ) {
        super();
    }

    readFile(filePath: string): CliRouteAttributeResult {
        const context = this.parseClassFile(filePath);

        if (context === undefined) {
            return new CliRouteAttributeResult();
        }

        const { classDecl, useMap, currentClass } = context;
        const routes: Record<string, ts.Expression> = {};

        for (const method of classDecl.getMethods()) {
            for (const decorator of this.findDecoratorsOnNode(method, 'Route', useMap, filePath)) {
                const data = this.buildRouteData(decorator, method, useMap, filePath, currentClass);

                if (data !== null) {
                    routes[data.name] = this.buildRouteExpr(data);
                }
            }
        }

        return new CliRouteAttributeResult(routes);
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
        const name = this.extractStringArg(decorator, 0, useMap, currentFilePath, currentClass);
        const description = this.extractStringArg(decorator, 1, useMap, currentFilePath, currentClass);

        if (name === '' || description === '') {
            return null;
        }

        const updatedName = this.updateName(name, method, useMap, currentFilePath, currentClass);
        const [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, exitedMiddleware] =
            this.updateMiddleware(
                method,
                useMap,
                currentFilePath,
                currentClass,
                this.extractClassListArgFromDecorator(decorator, 4, useMap, currentFilePath, currentClass),
                this.extractClassListArgFromDecorator(decorator, 5, useMap, currentFilePath, currentClass),
                this.extractClassListArgFromDecorator(decorator, 6, useMap, currentFilePath, currentClass),
                this.extractClassListArgFromDecorator(decorator, 7, useMap, currentFilePath, currentClass),
            );

        return new CliRouteData(
            updatedName,
            description,
            this.updateHandler(method, useMap, currentFilePath, currentClass),
            null,
            routeMatchedMiddleware,
            routeDispatchedMiddleware,
            throwableCaughtMiddleware,
            exitedMiddleware,
            this.parameterReader.updateArguments(method, useMap, currentFilePath, currentClass),
            this.parameterReader.updateOptions(method, useMap, currentFilePath, currentClass),
        );
    }

    protected updateName(
        name: string,
        method: MethodDeclaration,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string {
        for (const decorator of this.findDecoratorsOnNode(method, 'Name', useMap, currentFilePath)) {
            const override = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, currentFilePath, currentClass);

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
        routeMatchedMiddleware: string[],
        routeDispatchedMiddleware: string[],
        throwableCaughtMiddleware: string[],
        exitedMiddleware: string[],
    ): [string[], string[], string[], string[]] {
        for (const decorator of this.findDecoratorsOnNode(method, 'Middleware', useMap, currentFilePath)) {
            const mwName = this.extractExprValue(this.getDecoratorArg(decorator, 0), useMap, currentFilePath, currentClass);

            if (typeof mwName !== 'string' || mwName === '') {
                continue;
            }

            [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, exitedMiddleware] =
                this.classifyMiddleware(mwName, useMap, currentFilePath, routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, exitedMiddleware);
        }

        return [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, exitedMiddleware];
    }

    protected classifyMiddleware(
        mwName: string,
        useMap: Record<string, string>,
        currentFilePath: string,
        routeMatchedMiddleware: string[],
        routeDispatchedMiddleware: string[],
        throwableCaughtMiddleware: string[],
        exitedMiddleware: string[],
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

        if (this.classImplementsInterface(mwName, 'ExitedMiddlewareContract', useMap, currentFilePath)) {
            exitedMiddleware = [...exitedMiddleware, mwName];
        }

        return [routeMatchedMiddleware, routeDispatchedMiddleware, throwableCaughtMiddleware, exitedMiddleware];
    }

    protected buildRouteExpr(data: CliRouteData): ts.Expression {
        const args: ts.Expression[] = [
            this.buildEnumCaseExpr(data.name),
            this.buildStringExpr(data.description),
        ];

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
            this.buildClassArrayExpr(data.exitedMiddleware),
        ];
    }
}