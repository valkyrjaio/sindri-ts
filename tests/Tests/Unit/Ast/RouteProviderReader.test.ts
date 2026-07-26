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

    it('returns an empty result when there is no class', () => {
        expect(new RouteProviderReader().readFile(fixture('Config/TestConfigNoClassFixture')).controllerClasses).toHaveLength(
            0,
        );
    });
});
