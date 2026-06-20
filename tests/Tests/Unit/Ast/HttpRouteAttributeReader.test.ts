/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url';

import { ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { HttpRouteData } from '../../../../src/Sindri/Ast/Data/HttpRouteData.ts';
import { HttpRouteAttributeReader } from '../../../../src/Sindri/Ast/HttpRouteAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Classes/${name}.ts`, import.meta.url));
}

class TestHttpRouteAttributeReader extends HttpRouteAttributeReader {
    public build(data: HttpRouteData): ts.Expression {
        return this.buildRouteExpr(data);
    }
}

describe('HttpRouteAttributeReader', () => {
    it('reads @Route decorators with the class @Name prefix, skipping invalid routes', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerClass'));

        expect(Object.keys(result.routes)).toStrictEqual(['users.index', 'users.show']);
        expect(result.routeData['users.index']).toBeDefined();
    });

    it('returns an empty result when there is no class', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Config/TestConfigNoClass'));

        expect(Object.keys(result.routes)).toHaveLength(0);
    });

    it('applies method-level @Path and @Name suffixes when there is no class prefix', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerNoPrefix'));

        expect(Object.keys(result.routes)).toStrictEqual(['list.all']);
        expect(result.routeData['list.all'].path).toBe('/items/extra');
    });

    it('builds a null handler argument when the route has no handler', () => {
        const expr = new TestHttpRouteAttributeReader().build(new HttpRouteData('/p', 'name', null));

        expect(ts.isNewExpression(expr)).toBe(true);
    });

    it('ignores non-string class and method @Path/@Name decorators', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerNonString'));

        // Non-string prefixes/suffixes are skipped, leaving the bare route name and path.
        expect(Object.keys(result.routes)).toStrictEqual(['list']);
        expect(result.routeData['list'].path).toBe('/items');
    });
});
