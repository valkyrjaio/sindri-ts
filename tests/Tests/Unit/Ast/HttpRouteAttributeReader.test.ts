/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url';

import { ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { HttpParameterData } from '../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteData } from '../../../../src/Sindri/Ast/Data/HttpRouteData.ts';
import { HttpRouteAttributeReader } from '../../../../src/Sindri/Ast/HttpRouteAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

class TestHttpRouteAttributeReader extends HttpRouteAttributeReader {
    public build(data: HttpRouteData): ts.Expression {
        return this.buildRouteExpr(data);
    }

    public imports(
        routeData: Record<string, HttpRouteData>,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): Record<string, string> {
        return this.buildImportMap(routeData, useMap, currentFilePath, currentClass);
    }
}

describe('HttpRouteAttributeReader', () => {
    it('reads @Route/@DynamicRoute options objects with the class @Name prefix, skipping invalid/non-object routes', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerFixture'));

        expect(Object.keys(result.routes)).toStrictEqual(['users.index', 'users.show', 'users.byHandler']);
        // A plain @Route with a `{parameter}` path auto-promotes to a dynamic route and reads
        // its `parameters` option off the same object (matching the framework's PHP-style promotion).
        expect(result.routeData['users.index'].isDynamic).toBe(true);
        expect(result.routeData['users.index'].parameters).toStrictEqual([new HttpParameterData('id', '\\d+')]);
        expect(result.routeData['users.index'].requestStruct).toBe('SomeRequestStruct');
        expect(result.routeData['users.index'].responseStruct).toBe('SomeResponseStruct');
        expect(result.routeData['users.show'].parameters).toStrictEqual([
            new HttpParameterData('post', '\\d+', 'int', true, false, 'p'),
        ]);
    });

    it('resolves handlers from the object handler prop and populates the import map', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerFixture'));

        // The object handler prop wins over the default [Controller, method].
        expect(result.routeData['users.byHandler'].handler).toEqual({ class: 'OtherController', method: 'byHandler' });
        // Handler (controller) and middleware classes are imported; the unresolvable one is skipped.
        expect(Object.keys(result.importMap).sort()).toStrictEqual(['AllMiddlewareFixture', 'TestHttpControllerFixture']);
        expect(result.importMap.OtherController).toBeUndefined();
    });

    it('returns an empty result when there is no class', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Config/TestConfigNoClassFixture'));

        expect(Object.keys(result.routes)).toHaveLength(0);
    });

    it('applies method-level @Path/@Name suffixes and method sub-decorators when there is no class prefix', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerNoPrefixFixture'));

        expect(Object.keys(result.routes)).toStrictEqual(['list.all']);
        expect(result.routeData['list.all'].path).toBe('/items/extra');
        // Handler comes from @RouteHandler; structs fall through to the method decorators.
        expect(result.routeData['list.all'].handler).toEqual({ class: 'UnresolvedHandler', method: 'handle' });
        expect(result.routeData['list.all'].requestStruct).toBe('MethodReq');
        expect(result.routeData['list.all'].responseStruct).toBe('MethodRes');
    });

    it('builds a null handler argument when the route has no handler', () => {
        const expr = new TestHttpRouteAttributeReader().build(new HttpRouteData('/p', 'name', null));

        expect(ts.isNewExpression(expr)).toBe(true);
    });

    it('ignores non-string class and method @Path/@Name decorators', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerNonStringFixture'));

        // Non-string prefixes/suffixes are skipped, leaving the bare route name and path.
        expect(Object.keys(result.routes)).toStrictEqual(['list']);
        expect(result.routeData['list'].path).toBe('/items');
        expect(result.routeData['list'].requestStruct).toBeNull();
    });

    it('skips a null handler and unresolvable middleware when building the import map', () => {
        const reader = new TestHttpRouteAttributeReader();

        const importMap = reader.imports(
            { x: new HttpRouteData('/x', 'x', null, [], ['Unknown']) },
            {},
            fixture('Http/AllMiddlewareFixture'),
            'C',
        );

        expect(importMap).toStrictEqual({});
    });
});
