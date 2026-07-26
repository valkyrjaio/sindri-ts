/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ts } from 'ts-morph';

import { describe, expect, it, vi } from 'vitest';

import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstCliDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Cli/AstCliDataFileGenerator.ts';
import { lastWrittenFile, parseRouteExprs } from '../generatorTestUtil.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

describe('AstCliDataFileGenerator', () => {
    it('generates a cli routing data file with user imports', () => {
        const generator = new AstCliDataFileGenerator();
        generator.classImportMap = { SomeController: './SomeController.ts' };

        const routes = { build: ts.factory.createNull() };
        const status = generator.generateFile('/out', 'CliData', 'App.Data', routes);

        expect(status).toBe(GenerateStatus.SUCCESS);
    });

    it('generates a file with no user imports and no routes', () => {
        expect(new AstCliDataFileGenerator().generateFile('/out', 'CliData', 'App.Data', {})).toBe(
            GenerateStatus.SUCCESS,
        );
    });

    it('formats route keys that contain a "::" separator', () => {
        const routes = { 'App\\Command::NAME': ts.factory.createNull() };

        expect(new AstCliDataFileGenerator().generateFile('/out', 'CliData', 'App.Data', routes)).toBe(
            GenerateStatus.SUCCESS,
        );
    });

    it('generates the cli routing data from imperative getRoutes() route objects', () => {
        const generator = new AstCliDataFileGenerator();
        generator.classImportMap = { CliRouteProvider: '../Provider/CliRouteProvider.ts' };

        const routeExprs = parseRouteExprs(
            [
                `new Route('test', 'Test command', CliRouteProvider.testHandler)`,
                `new Route('build', 'Build command', CliRouteProvider.buildHandler)`,
            ].join(', '),
        );

        const status = generator.generateFileFromRoutes('/out', 'AppCliRoutingData', 'App.Data', routeExprs);
        const file = lastWrittenFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(file).toContain(`import { CliRouteProvider } from '../Provider/CliRouteProvider.ts';`);
        // Each command is keyed by its name (the first argument), emitted verbatim, with no `routes:` wrapper.
        expect(file).toContain(`['test']: (): RouteContract => new Route('test', 'Test command', CliRouteProvider.testHandler)`);
        expect(file).toContain(`['build']: (): RouteContract => new Route('build', 'Build command', CliRouteProvider.buildHandler)`);
        expect(file).not.toContain('routes: {');
    });

    it('skips non-new and unnamed route expressions when generating from route objects', () => {
        // Ignored: a non-new expression, a bare `new Route` with no argument list, and a
        // route whose first argument is not a string literal.
        const routeExprs = parseRouteExprs(`someHelper(), new Route, new Route(commandName, 'desc', handler)`);

        const status = new AstCliDataFileGenerator().generateFileFromRoutes('/out', 'AppCliRoutingData', 'App.Data', routeExprs);

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(lastWrittenFile()).toContain('super({});');
    });
});
