/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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

    public imports(
        routeData: Record<string, CliRouteData>,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): Record<string, string> {
        return this.buildImportMap(routeData, useMap, currentFilePath, currentClass);
    }
}

describe('CliRouteAttributeReader', () => {
    it('reads @Route options objects, applying @Name and skipping invalid/non-object routes', () => {
        const result = new CliRouteAttributeReader().readFile(fixture('Cli/TestCliControllerFixture'));

        // @Name overrides the route key to build:app; opts/handled keep their names.
        expect(Object.keys(result.routes)).toStrictEqual(['build:app', 'opts', 'handled']);
    });

    it('imports the handler (controller) class, skipping unresolvable handler/help-text classes', () => {
        const result = new CliRouteAttributeReader().readFile(fixture('Cli/TestCliControllerFixture'));

        expect(Object.keys(result.importMap)).toStrictEqual(['TestCliControllerFixture']);
        expect(result.importMap.HelpProvider).toBeUndefined();
        expect(result.importMap.OtherCli).toBeUndefined();
    });

    it('returns an empty result when there is no class', () => {
        const result = new CliRouteAttributeReader().readFile(fixture('Config/TestConfigNoClassFixture'));

        expect(Object.keys(result.routes)).toHaveLength(0);
    });

    it('builds a null handler and a help-text argument from the route data', () => {
        const data = new CliRouteData('cmd', 'A command', null, new HandlerData('CmdClass', 'help'));

        expect(ts.isNewExpression(new TestCliRouteAttributeReader().build(data))).toBe(true);
    });

    it('builds a handler and a null help-text argument from the route data', () => {
        const data = new CliRouteData('cmd', 'A command', new HandlerData('CmdClass', 'run'), null);

        expect(ts.isNewExpression(new TestCliRouteAttributeReader().build(data))).toBe(true);
    });

    it('skips a null handler and null help-text when building the import map', () => {
        const importMap = new TestCliRouteAttributeReader().imports(
            { x: new CliRouteData('x', 'x', null, null) },
            {},
            fixture('Cli/AllCliMiddlewareFixture'),
            'C',
        );

        expect(importMap).toStrictEqual({});
    });
});
