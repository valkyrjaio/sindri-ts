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

import { CliRouteAttributeReader } from '../../../../src/Sindri/Ast/CliRouteAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Classes/${name}.ts`, import.meta.url));
}

describe('CliRouteAttributeReader', () => {
    it('reads @Route decorators, applying @Name and skipping invalid routes', () => {
        const result = new CliRouteAttributeReader().readFile(fixture('Cli/TestCliControllerClass'));

        // @Name overrides the route key to build:app.
        expect(Object.keys(result.routes)).toStrictEqual(['build:app']);
    });

    it('returns an empty result when there is no class', () => {
        const result = new CliRouteAttributeReader().readFile(fixture('Config/TestConfigNoClass'));

        expect(Object.keys(result.routes)).toHaveLength(0);
    });
});
