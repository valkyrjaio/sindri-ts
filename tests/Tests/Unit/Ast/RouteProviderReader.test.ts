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
    return fileURLToPath(new URL(`../../Classes/${name}.ts`, import.meta.url));
}

describe('RouteProviderReader', () => {
    it('extracts the controller classes', () => {
        const result = new RouteProviderReader().readFile(fixture('Provider/TestRouteProviderClass'));

        expect(result.controllerClasses).toHaveLength(2);
        expect(result.routes).toHaveLength(0);
    });

    it('returns an empty result when there is no class', () => {
        expect(new RouteProviderReader().readFile(fixture('Config/TestConfigNoClass')).controllerClasses).toHaveLength(
            0,
        );
    });
});
