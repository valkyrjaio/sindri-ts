/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { RouteProviderReader } from '../../../../src/Sindri/Ast/RouteProviderReader.ts';
import { AstUnreadableRouteException } from '../../../../src/Sindri/Ast/Throwable/Exception/AstUnreadableRouteException.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

/** Exposes the names the reader reads as the provider's own. */
class ExposedRouteProviderReader extends RouteProviderReader {
    public providerLocalNames(filePath: string): ReadonlySet<string> {
        const sourceFile = this.parseFileToSourceFile(filePath);
        const classDecl = this.findClass(sourceFile);
        const methods = this.indexMethods(classDecl!);

        return this.collectProviderLocalNames(sourceFile, methods['getRoutes'], filePath);
    }
}

describe('RouteProviderReader', () => {
    it('extracts the controller classes', () => {
        const result = new RouteProviderReader().readFile(fixture('Provider/TestRouteProviderFixture'));

        expect(result.controllerClasses).toHaveLength(2);
        expect(result.routes).toHaveLength(0);
    });

    it('extracts the imperative routes returned by getRoutes()', () => {
        const result = new RouteProviderReader().readFile(fixture('Provider/TestImperativeRouteProviderFixture'));

        expect(result.controllerClasses).toHaveLength(0);
        expect(result.routes).toHaveLength(2);
    });

    it('returns an empty result when there is no class', () => {
        expect(new RouteProviderReader().readFile(fixture('Config/TestConfigNoClassFixture')).controllerClasses).toHaveLength(
            0,
        );
    });

    it('returns no routes when the provider has no getRoutes() method', () => {
        // CompA is a bare class with neither getControllerClasses nor getRoutes.
        const result = new RouteProviderReader().readFile(fixture('Provider/CompA'));

        expect(result.controllerClasses).toHaveLength(0);
        expect(result.routes).toHaveLength(0);
    });

    it('returns no routes when getRoutes() does not return an array literal', () => {
        expect(new RouteProviderReader().readFile(fixture('Provider/TestNonArrayRouteProviderFixture')).routes).toHaveLength(
            0,
        );
    });

    describe('routeImports', () => {
        it('resolves the classes the route expressions reference', () => {
            const result = new RouteProviderReader().readFile(fixture('Provider/TestConstantNamedRouteProviderFixture'));

            expect(result.routeImports).toStrictEqual({ CliA: fixture('Provider/CliA') });
        });

        it('is empty when the provider registers no imperative routes', () => {
            expect(new RouteProviderReader().readFile(fixture('Provider/TestRouteProviderFixture')).routeImports).toStrictEqual(
                {},
            );
        });
    });

    describe('a name the generated data file cannot import', () => {
        it('stops on a handler the provider declares for itself', () => {
            expect(() =>
                new RouteProviderReader().readFile(fixture('Provider/TestLocalHandlerRouteProviderFixture')),
            ).toThrow(AstUnreadableRouteException);
        });

        it('stops on a route name an enum the provider declares holds', () => {
            expect(() =>
                new RouteProviderReader().readFile(fixture('Provider/TestLocalEnumRouteProviderFixture')),
            ).toThrow(AstUnreadableRouteException);
        });

        it('stops on an import that resolves to no TypeScript file', () => {
            expect(() =>
                new RouteProviderReader().readFile(fixture('Provider/TestUnresolvedImportRouteProviderFixture')),
            ).toThrow(AstUnreadableRouteException);
        });

        it('reads a global, a shadowed name, the provider itself, and an imported handler', () => {
            const result = new RouteProviderReader().readFile(
                fixture('Provider/TestGlobalHandlerRouteProviderFixture'),
            );

            expect(result.routes).toHaveLength(4);
            expect(Object.keys(result.routeImports)).toContain('CliA');
            expect(Object.keys(result.routeImports)).not.toContain('console');
            expect(Object.keys(result.routeImports)).not.toContain('route');
            expect(Object.keys(result.routeImports)).not.toContain('prefix');
            expect(Object.keys(result.routeImports)).not.toContain('TestGlobalHandlerRouteProviderFixture');
        });
    });

    describe('the names the provider declares for itself', () => {
        it('holds every kind of declaration, and not the name the provider file is imported by', () => {
            const names = new ExposedRouteProviderReader().providerLocalNames(
                fixture('Provider/TestProviderLocalNamesRouteProviderFixture'),
            );

            expect([...names].sort()).toStrictEqual([
                'MethodClass',
                'ModuleClass',
                'ModuleEnum',
                'ModuleNamespace',
                'methodConstant',
                'methodFunction',
                'moduleConstant',
                'moduleFunction',
            ]);
        });
    });
});
