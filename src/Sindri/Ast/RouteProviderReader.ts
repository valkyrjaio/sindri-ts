/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import * as path from 'path';

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { RouteProviderResult } from './Data/Result/RouteProviderResult.ts';
import { AstUnreadableRouteException } from './Throwable/Exception/AstUnreadableRouteException.ts';

import type { MethodDeclaration, SourceFile } from 'ts-morph';

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
        const routesMethod = methods[RouteProviderReader.METHOD_ROUTES];
        const routes = this.extractRoutes(routesMethod, useMap, filePath);
        const routeImports = this.extractRouteImports(routes, useMap, filePath);

        this.validateRouteImports(
            routes,
            routeImports,
            useMap,
            this.collectProviderLocalNames(sourceFile, routesMethod, filePath),
        );

        return new RouteProviderResult(
            this.extractClassListFromValues(methods[RouteProviderReader.METHOD_CONTROLLER_CLASSES], useMap, filePath),
            routes,
            routeImports,
        );
    }

    /**
     * Resolve every class the imperative route expressions reference to its absolute file path, so
     * the generated data cache can import them.
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

    /** Stop on a name a route references that the generated data file, in another module, cannot reach. */
    protected validateRouteImports(
        routes: readonly ts.Expression[],
        routeImports: Readonly<Record<string, string>>,
        useMap: Record<string, string>,
        providerLocalNames: ReadonlySet<string>,
    ): void {
        for (const route of routes) {
            const declaredNames = this.collectDeclaredNames(route);

            for (const name of this.collectReferencedIdentifiers(route)) {
                if (routeImports[name] !== undefined || declaredNames.has(name)) {
                    continue;
                }

                if (providerLocalNames.has(name)) {
                    throw new AstUnreadableRouteException(
                        `Cannot read the route '${route.getText()}': the generated data cannot import '${name}', which the provider declares for itself.`,
                    );
                }

                // An import the reader resolves to no TypeScript file leaves the generated data no
                // path to import the name from. Every name left is a global.
                if (useMap[name] !== undefined) {
                    throw new AstUnreadableRouteException(
                        `Cannot read the route '${route.getText()}': the import of '${name}' resolves to no TypeScript file.`,
                    );
                }
            }
        }
    }

    /**
     * The names the provider declares at its own module level and in its `getRoutes()` body, less
     * the file's own base name, which is the name the generated data file imports the provider by.
     */
    protected collectProviderLocalNames(
        sourceFile: SourceFile,
        routesMethod: MethodDeclaration | undefined,
        filePath: string,
    ): Set<string> {
        const names = new Set<string>();

        for (const declaration of [
            ...sourceFile.getVariableDeclarations(),
            ...(routesMethod?.getVariableDeclarations() ?? []),
        ]) {
            names.add(declaration.getName());
        }

        for (const declaration of [
            ...sourceFile.getFunctions(),
            ...sourceFile.getClasses(),
            ...sourceFile.getEnums(),
            ...sourceFile.getModules(),
            ...(routesMethod?.getFunctions() ?? []),
            ...(routesMethod?.getClasses() ?? []),
        ]) {
            names.add(declaration.getName() ?? '');
        }

        names.delete(path.basename(filePath, '.ts'));
        names.delete('');

        return names;
    }

    /**
     * The names an expression declares for itself, such as an inline handler's parameters, counted
     * throughout the expression so a shadowed module-local name reads as declared.
     */
    protected collectDeclaredNames(node: ts.Node, names: Set<string> = new Set<string>()): Set<string> {
        const declared: ts.Node | undefined = 'name' in node ? (node.name as ts.Node | undefined) : undefined;

        if (declared !== undefined && ts.isIdentifier(declared)) {
            names.add(declared.text);
        }

        ts.forEachChild(node, (child: ts.Node): void => {
            this.collectDeclaredNames(child, names);
        });

        return names;
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

        return array.elements.filter((element): element is ts.NewExpression => ts.isNewExpression(element));
    }
}
