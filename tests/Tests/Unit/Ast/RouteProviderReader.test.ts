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

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
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

    it('extracts routes declared as builder chains, not just bare constructions', () => {
        // A gRPC streaming method is declared `new Route(...).withServerStreaming(true)`. Matching
        // only the bare `new` form drops every chained route from the generated cache silently,
        // which surfaces at runtime as UNIMPLEMENTED for a method that plainly exists in source.
        const result = new RouteProviderReader().readFile(fixture('Provider/TestChainedRouteProviderFixture'));

        expect(result.routes).toHaveLength(3);
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
});
