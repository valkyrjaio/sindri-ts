/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { RouteProviderResult } from './Data/Result/RouteProviderResult.ts';

import type { RouteProviderReaderContract } from './Contract/RouteProviderReaderContract.ts';

export class RouteProviderReader extends AstReader implements RouteProviderReaderContract {
    protected static readonly METHOD_CONTROLLER_CLASSES = 'getControllerClasses';
    protected static readonly METHOD_ROUTES = 'getRoutes';

    readFile(filePath: string): RouteProviderResult {
        const sourceFile = this.parseFileToSourceFile(filePath);
        const classDecl = this.findClass(sourceFile);

        if (classDecl === undefined) {
            return new RouteProviderResult();
        }

        const useMap = this.buildUseMap(sourceFile);
        const methods = this.indexMethods(classDecl);
        const routes = this.extractRoutes(methods[RouteProviderReader.METHOD_ROUTES], useMap, filePath);

        return new RouteProviderResult(
            this.extractClassListFromValues(methods[RouteProviderReader.METHOD_CONTROLLER_CLASSES], useMap, filePath),
            routes,
            this.extractRouteImports(routes, useMap, filePath),
        );
    }

    /**
     * Resolve every class the imperative route expressions reference to its
     * absolute file path, so the generated data cache can import them.
     *
     * Names that are not imported by the provider file — locals, globals, and
     * the provider's own class (which the generator imports separately) — have
     * no entry in the use map and are skipped.
     */
    protected extractRouteImports(
        routes: readonly ts.Expression[],
        useMap: Record<string, string>,
        filePath: string,
    ): Record<string, string> {
        const imports: Record<string, string> = {};

        for (const route of routes) {
            for (const name of this.collectReferencedIdentifiers(route)) {
                const resolved = this.resolveImportToFilePath(name, useMap, filePath);

                if (resolved !== '') {
                    imports[name] = resolved;
                }
            }
        }

        return imports;
    }

    /**
     * Extract the route objects returned by a provider's `getRoutes()` method.
     *
     * TS route providers register routes imperatively — `getRoutes()` returns
     * the concrete `new Route(...)` / `new DynamicRoute(...)` (or CLI
     * `new Route(...)`) instances. Those expressions are returned verbatim for
     * the data-cache generator to emit as route closures and to derive the
     * path/regex lookup maps from. (Attribute/decorator scanning — the other,
     * optional source of routes — is handled separately via
     * {@link readFile}'s controller-class list.)
     */
    protected extractRoutes(
        method: ReturnType<typeof this.indexMethods>[string] | undefined,
        _useMap: Record<string, string>,
        _filePath: string,
    ): ts.Expression[] {
        if (method === undefined) {
            return [];
        }

        const array = this.findReturnedArray(method);

        if (array === undefined) {
            return [];
        }

        return array.elements.filter((element) => RouteProviderReader.isRouteExpression(element));
    }

    /**
     * Whether an array element declares a route.
     *
     * A route is frequently declared as a builder chain rather than a bare construction — gRPC spells
     * a streaming method `new Route(...).withServerStreaming(true)` — so the chain is walked back to
     * its base before deciding. Matching only the bare `new` form drops every chained route from the
     * generated cache without a word, which reads at runtime as the method simply not existing.
     */
    protected static isRouteExpression(expression: ts.Expression): boolean {
        let current: ts.Expression = expression;

        while (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)) {
            current = current.expression.expression;
        }

        return ts.isNewExpression(current);
    }
}
