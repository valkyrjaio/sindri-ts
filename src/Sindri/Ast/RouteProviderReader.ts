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

import type { SourceFile } from 'ts-morph';

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
        const routeImports = this.extractRouteImports(routes, useMap, filePath);

        this.validateRouteImports(routes, routeImports, this.collectModuleLocalNames(sourceFile, filePath));

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

    /** Stop on a name a route references that no import resolves and the provider declares itself. */
    protected validateRouteImports(
        routes: readonly ts.Expression[],
        routeImports: Readonly<Record<string, string>>,
        moduleLocalNames: ReadonlySet<string>,
    ): void {
        for (const route of routes) {
            const declaredNames = this.collectDeclaredNames(route);

            for (const name of this.collectReferencedIdentifiers(route)) {
                // A name the provider file declares for itself is one the generated data file, in
                // another module, cannot reach. Every other unresolved name is a global.
                if (routeImports[name] === undefined && moduleLocalNames.has(name) && !declaredNames.has(name)) {
                    throw new AstUnreadableRouteException(
                        `Cannot read the route '${route.getText()}': the generated data cannot import '${name}', which the provider declares for itself.`,
                    );
                }
            }
        }
    }

    /**
     * The names the provider file declares at its own module level, less the file's own base name,
     * which is the name the generated data file imports the provider by.
     */
    protected collectModuleLocalNames(sourceFile: SourceFile, filePath: string): Set<string> {
        const names = new Set<string>();

        for (const declaration of sourceFile.getVariableDeclarations()) {
            names.add(declaration.getName());
        }

        for (const declaration of [...sourceFile.getFunctions(), ...sourceFile.getClasses()]) {
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
