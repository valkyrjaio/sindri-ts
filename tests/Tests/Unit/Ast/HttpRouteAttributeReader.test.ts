/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { HttpRouteAttributeReader } from '../../../../src/Sindri/Ast/HttpRouteAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Classes/${name}.ts`, import.meta.url));
}

describe('HttpRouteAttributeReader', () => {
    it('reads @Route decorators with the class @Name prefix, skipping invalid routes', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerClass'));

        expect(Object.keys(result.routes)).toStrictEqual(['users.index']);
        expect(result.routeData['users.index']).toBeDefined();
    });

    it('returns an empty result when there is no class', () => {
        const result = new HttpRouteAttributeReader().readFile(fixture('Config/TestConfigNoClass'));

        expect(Object.keys(result.routes)).toHaveLength(0);
    });
});
