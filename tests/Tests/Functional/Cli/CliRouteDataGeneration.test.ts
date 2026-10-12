/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { RouteProviderReader } from '../../../../src/Sindri/Ast/RouteProviderReader.ts';
import { AstUnreadableRouteException } from '../../../../src/Sindri/Ast/Throwable/Exception/AstUnreadableRouteException.ts';
import { AstCliDataFileGenerator } from '../../../../src/Sindri/Generator/Ast/Cli/AstCliDataFileGenerator.ts';

/**
 * Every shape sindri reads an imperative CLI route from, read from a fixture and written to a real
 * CLI routing data file.
 *
 * A declaration shape only reaches the generated file when a test feeds that shape in. Coverage
 * says nothing about a shape no fixture declares, so each shape is asserted here by name.
 */

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

/** Read the provider's routes and write the CLI routing data file, returning its source. */
function generate(provider: string): string {
    const providerResult = new RouteProviderReader().readFile(fixture(provider));
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sindri-cli-'));

    try {
        const generator = new AstCliDataFileGenerator();
        generator.classImportMap = {
            TestGlobalHandlerRouteProviderFixture: '../Provider/TestGlobalHandlerRouteProviderFixture.ts',
            CliA: '../Provider/CliA.ts',
        };
        generator.generateFileFromRoutes(directory, 'AppCliRoutingData', 'App.Data', providerResult.routes);

        return fs.readFileSync(path.join(directory, 'AppCliRoutingData.ts'), 'utf-8');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

describe('CliRouteDataGeneration', () => {
    const generated = generate('Provider/TestGlobalHandlerRouteProviderFixture');

    describe('a route naming a value the generated file can reach', () => {
        it('holds the inline handler, which names a global and declares its own parameters', () => {
            expect(generated).toContain(
                "['/logged']: (): RouteContract => new Route('/logged', 'logged', ({ container }, route) => console.log(container, route))",
            );
        });

        it("holds the provider's own static, which the generated file imports the provider for", () => {
            expect(generated).toContain("import { TestGlobalHandlerRouteProviderFixture } from");
            expect(generated).toContain('TestGlobalHandlerRouteProviderFixture.handle');
        });

        it('holds an imported handler, and imports the class it comes from', () => {
            expect(generated).toContain("import { CliA } from '../Provider/CliA.ts';");
            expect(generated).toContain("['/imported']: (): RouteContract => new Route('/imported', 'imported', CliA.handle)");
        });
    });

    describe('a handler the provider declares for itself', () => {
        it('stops rather than naming it unbound in the generated file', () => {
            expect(() => generate('Provider/TestLocalHandlerRouteProviderFixture')).toThrow(
                AstUnreadableRouteException,
            );
        });
    });
});
