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
import { AstHttpDataFileGenerator } from '../../../../src/Sindri/Generator/Ast/Http/AstHttpDataFileGenerator.ts';

/**
 * Every shape sindri reads an imperative HTTP route from, read from a fixture and written to a real
 * HTTP routing data file.
 *
 * A declaration shape only reaches the generated file when a test feeds that shape in. Coverage
 * says nothing about a shape no fixture declares, so each shape is asserted here by name.
 */

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

/** Read the provider's routes and write the Http routing data file, returning its source. */
function generate(provider: string): string {
    const providerResult = new RouteProviderReader().readFile(fixture(provider));
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sindri-http-'));

    try {
        const generator = new AstHttpDataFileGenerator();

        // The import map is built the way GenerateDataFromAst builds it: the provider under its
        // file base name, and every name the reader resolved for the route expressions.
        generator.classImportMap = {
            [path.basename(provider)]: path.relative(directory, fixture(provider)),
            ...Object.fromEntries(
                Object.entries(providerResult.routeImports).map(([name, importPath]) => [
                    name,
                    path.relative(directory, importPath),
                ]),
            ),
        };
        generator.generateFileFromRoutes(directory, 'AppHttpRoutingData', 'App.Data', providerResult.routes);

        return fs.readFileSync(path.join(directory, 'AppHttpRoutingData.ts'), 'utf-8');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

describe('HttpRouteDataGeneration', () => {
    const generated = generate('Provider/TestGlobalHandlerRouteProviderFixture');

    describe('a route naming a value the generated file can reach', () => {
        it('holds the inline handler, which names a global and declares its own parameters', () => {
            expect(generated).toContain(
                "['logged']: (): RouteContract => new Route('/logged', 'logged', ({ container }, route) => console.log(container, route))",
            );
        });

        it('holds the inline handler that renames a destructured property, and imports its default', () => {
            expect(generated).toMatch(/import \{ CompB \} from '.*CompB\.ts';/);
            expect(generated).toContain(
                "['renamed']: (): RouteContract => new Route('/renamed', 'renamed', ({ prefix: p = CompB.PREFIX }) => p)",
            );
        });

        it('holds the inline handler that computes a destructured key, and imports the key', () => {
            expect(generated).toMatch(/import \{ SvcA \} from '.*SvcA\.ts';/);
            expect(generated).toContain(
                "['computed']: (): RouteContract => new Route('/computed', 'computed', ({ [SvcA.KEY]: v }) => v)",
            );
        });

        it("holds the provider's own static, which the generated file imports the provider for", () => {
            expect(generated).toMatch(/import \{ TestGlobalHandlerRouteProviderFixture \} from '.*TestGlobalHandlerRouteProviderFixture\.ts';/);
            expect(generated).toContain('TestGlobalHandlerRouteProviderFixture.handle');
        });

        it('holds an imported handler, and imports the class it comes from', () => {
            expect(generated).toMatch(/import \{ CliA \} from '.*CliA\.ts';/);
            expect(generated).toContain("['imported']: (): RouteContract => new Route('/imported', 'imported', CliA.handle)");
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
