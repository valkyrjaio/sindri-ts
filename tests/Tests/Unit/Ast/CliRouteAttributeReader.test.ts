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

import { CliRouteData } from '../../../../src/Sindri/Ast/Data/CliRouteData.ts';
import { HandlerData } from '../../../../src/Sindri/Ast/Data/HandlerData.ts';
import { CliRouteAttributeReader } from '../../../../src/Sindri/Ast/CliRouteAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

class TestCliRouteAttributeReader extends CliRouteAttributeReader {
    public build(data: CliRouteData): ts.Expression {
        return this.buildRouteExpr(data);
    }
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

    it('builds a null handler and a help-text argument from the route data', () => {
        const data = new CliRouteData('cmd', 'A command', null, new HandlerData('CmdClass', 'help'));

        const expr = new TestCliRouteAttributeReader().build(data);

        expect(ts.isNewExpression(expr)).toBe(true);
    });
});
