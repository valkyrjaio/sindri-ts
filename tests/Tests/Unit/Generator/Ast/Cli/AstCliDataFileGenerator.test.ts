/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ts } from 'ts-morph';

import { describe, expect, it, vi } from 'vitest';

import { CliArgumentParameterData } from '../../../../../../src/Sindri/Ast/Data/CliArgumentParameterData.ts';
import { CliOptionParameterData } from '../../../../../../src/Sindri/Ast/Data/CliOptionParameterData.ts';
import { CliRouteData } from '../../../../../../src/Sindri/Ast/Data/CliRouteData.ts';
import { HandlerData } from '../../../../../../src/Sindri/Ast/Data/HandlerData.ts';
import { CliRouteAttributeReader } from '../../../../../../src/Sindri/Ast/CliRouteAttributeReader.ts';
import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstCliDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Cli/AstCliDataFileGenerator.ts';
import { lastWrittenFile, parseRouteExprs } from '../generatorTestUtil.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

/** Exposes the CLI reader's route-expression builder. */
class ExposedCliRouteAttributeReader extends CliRouteAttributeReader {
    public build(data: CliRouteData): ts.Expression {
        return this.buildRouteExpr(data);
    }
}

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

    it('emits Route, ArgumentParameter and OptionParameter arguments in framework constructor order', () => {
        // Build the route value through the reader so the emitted argument order is asserted
        // directly — the empty `options` slot must keep OptionParameter's mode/valueMode in place,
        // and the empty argument buckets must keep Route's [arguments]/[options] slots in place.
        const data = new CliRouteData(
            'greet',
            'Greet a user',
            new HandlerData('GreetController', 'greet'),
            null,
            [],
            [],
            [],
            [],
            [new CliArgumentParameterData('name', 'The user name')],
            [new CliOptionParameterData('shout', 'Shout the greeting', 'BOOL', null, 'no', ['s'], ['yes', 'no'])],
        );

        const expr = new ExposedCliRouteAttributeReader().build(data);
        const status = new AstCliDataFileGenerator().generateFile('/out', 'CliData', 'App.Data', { greet: expr });
        const file = lastWrittenFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        // Route(name, description, handler, helpText, 4 middleware buckets, [arguments], [options]).
        expect(file).toContain(
            'new Route("greet", "Greet a user", GreetController.greet, null, [], [], [], [], [new ArgumentParameter(',
        );
        expect(file).toContain(
            'new ArgumentParameter("name", "The user name", null, ArgumentMode.OPTIONAL, ArgumentValueMode.DEFAULT)',
        );
        // The empty `[]` before OptionMode is the runtime-populated `options` slot.
        expect(file).toContain(
            'new OptionParameter("shout", "Shout the greeting", "BOOL", null, "no", ["s"], ["yes", "no"], [], OptionMode.OPTIONAL, OptionValueMode.DEFAULT)',
        );
    });

    it('emits an empty arguments array when a command has options but no arguments', () => {
        // Options-only command: buildParameterArgs must still emit an empty arguments array first
        // so the options land in their own positional slot.
        const data = new CliRouteData(
            'opts',
            'Options only',
            new HandlerData('OptsController', 'run'),
            null,
            [],
            [],
            [],
            [],
            [],
            [new CliOptionParameterData('flag', 'A flag')],
        );

        const expr = new ExposedCliRouteAttributeReader().build(data);
        new AstCliDataFileGenerator().generateFile('/out', 'CliData', 'App.Data', { opts: expr });

        expect(lastWrittenFile()).toContain(
            'new Route("opts", "Options only", OptsController.run, null, [], [], [], [], [], [new OptionParameter(',
        );
    });

    it('skips non-new and unnamed route expressions when generating from route objects', () => {
        // Ignored: a non-new expression, a bare `new Route` with no argument list, and a
        // route whose first argument is neither a string literal nor a constant reference.
        const routeExprs = parseRouteExprs(`someHelper(), new Route, new Route(commandName(), 'desc', handler)`);

        const status = new AstCliDataFileGenerator().generateFileFromRoutes('/out', 'AppCliRoutingData', 'App.Data', routeExprs);

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(lastWrittenFile()).toContain('super({});');
    });

    it('keys a route named by a constant on the constant reference', () => {
        const generator = new AstCliDataFileGenerator();
        generator.classImportMap = {
            CliCommandName: '@valkyrjaio/valkyrja/Cli/Server/Constant/CommandName.ts',
            CliRoutingCliRouteProvider: '@valkyrjaio/valkyrja/Cli/Routing/Provider/CliRoutingCliRouteProvider.ts',
        };

        const routeExprs = parseRouteExprs(
            `new Route(CliCommandName.LIST, 'List all commands', CliRoutingCliRouteProvider.listHandler)`,
        );

        expect(generator.generateFileFromRoutes('/out', 'AppCliRoutingData', 'App.Data', routeExprs)).toBe(
            GenerateStatus.SUCCESS,
        );

        const file = lastWrittenFile();

        // The key is the constant reference itself, not the value it holds today.
        expect(file).toContain('[CliCommandName.LIST]: (): RouteContract => new Route(CliCommandName.LIST,');
        expect(file).toContain(`import { CliCommandName } from '@valkyrjaio/valkyrja/Cli/Server/Constant/CommandName.ts';`);
    });

    it('does not re-import a name the framework header already binds', () => {
        const generator = new AstCliDataFileGenerator();
        // A provider importing the framework `Route` under the same name would
        // otherwise be emitted twice — a duplicate identifier.
        generator.classImportMap = { Route: '@valkyrjaio/valkyrja/Cli/Routing/Data/Route.ts' };

        expect(generator.generateFile('/out', 'AppCliRoutingData', 'App.Data', {})).toBe(GenerateStatus.SUCCESS);

        const matches = lastWrittenFile().match(/^import \{ Route \} from/gm) ?? [];

        expect(matches).toHaveLength(1);
    });
});
