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

import { ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { CliArgumentParameterData } from '../../../../../../src/Sindri/Ast/Data/CliArgumentParameterData.ts';
import { CliOptionParameterData } from '../../../../../../src/Sindri/Ast/Data/CliOptionParameterData.ts';
import { CliRouteData } from '../../../../../../src/Sindri/Ast/Data/CliRouteData.ts';
import { HandlerData } from '../../../../../../src/Sindri/Ast/Data/HandlerData.ts';
import { HttpParameterData } from '../../../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteData } from '../../../../../../src/Sindri/Ast/Data/HttpRouteData.ts';
import { CliRouteAttributeReader } from '../../../../../../src/Sindri/Ast/CliRouteAttributeReader.ts';
import { HttpRouteAttributeReader } from '../../../../../../src/Sindri/Ast/HttpRouteAttributeReader.ts';
import { AstCliDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Cli/AstCliDataFileGenerator.ts';
import { ConfigImport } from '../../../../../../src/Sindri/Ast/Data/ConfigImport.ts';
import { ConfigSourceResult } from '../../../../../../src/Sindri/Ast/Data/Result/ConfigSourceResult.ts';
import { AstCachedConfigFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Config/AstCachedConfigFileGenerator.ts';
import { AstContainerDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Container/AstContainerDataFileGenerator.ts';
import { AstEventDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Event/AstEventDataFileGenerator.ts';
import { AstGrpcDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Grpc/AstGrpcDataFileGenerator.ts';
import { AstHttpDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Http/AstHttpDataFileGenerator.ts';
import { parseRouteExprs } from '../generatorTestUtil.ts';

/**
 * Full-output golden/snapshot tests for the five Ast data-file generators.
 *
 * Unlike the per-generator unit tests (which assert individual substrings such as
 * a single route key or `super(`), these pin the ENTIRE emitted source against a
 * committed golden file, so any change to the generated shape — spacing, ordering,
 * imports, fully-qualified references, closure wrappers — is caught and must be an
 * intentional golden update.
 *
 * The inputs exercise the meaningful structure: multiple HTTP routes including a
 * dynamic `/users/{id}` and a GET/POST split (so `routes`, `paths`, `dynamicPaths`
 * and `regexes` all populate); multiple CLI commands; multiple container
 * publishers; multiple event listeners.
 *
 * To refresh the goldens after an intentional generator change, run this suite
 * with `GOLDEN_UPDATE=1` set — each `./golden/*.golden` is rewritten from the
 * matching generator output — then review and commit the new snapshots.
 */

const GET = 'RequestMethod::GET';
const POST = 'RequestMethod::POST';

const goldenDir = fileURLToPath(new URL('./golden/', import.meta.url));

/** A stable placeholder route/listener expression (printed verbatim into the snapshot). */
function placeholder(text: string): ts.Expression {
    return ts.factory.createStringLiteral(text);
}

/** Exposes the HTTP reader's route-expression builder to produce real `new DynamicRoute(...)` values. */
class ExposedHttpRouteAttributeReader extends HttpRouteAttributeReader {
    public build(data: HttpRouteData): ts.Expression {
        return this.buildRouteExpr(data);
    }
}

/** Exposes the CLI reader's route-expression builder to produce real `new Route(...)` values. */
class ExposedCliRouteAttributeReader extends CliRouteAttributeReader {
    public build(data: CliRouteData): ts.Expression {
        return this.buildRouteExpr(data);
    }
}

/** Absolute path of an HTTP/CLI controller fixture. */
function fixture(name: string): string {
    return fileURLToPath(new URL(`../../../../Fixtures/${name}.ts`, import.meta.url));
}

/** Run a generator against a fresh temp directory and return the emitted source. */
function generate(className: string, run: (directory: string) => void): string {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sindri-golden-'));

    try {
        run(directory);

        return fs.readFileSync(path.join(directory, `${className}.ts`), 'utf-8');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

/** Compare the generated source against the committed golden (refreshing it when GOLDEN_UPDATE=1). */
function assertGolden(actual: string, goldenName: string): void {
    const goldenPath = path.join(goldenDir, `${goldenName}.golden`);

    if (process.env.GOLDEN_UPDATE === '1') {
        fs.writeFileSync(goldenPath, actual, 'utf-8');
    }

    expect(actual).toBe(fs.readFileSync(goldenPath, 'utf-8'));
}

describe('GoldenSnapshotTest', () => {
    it('matches the AppHttpRoutingData golden', () => {
        const routes = {
            'users.index': placeholder('users-index-expr'),
            'users.show': placeholder('users-show-expr'),
            'users.store': placeholder('users-store-expr'),
        };

        const routeData = {
            'users.index': new HttpRouteData('/users', 'users.index', null, [GET]),
            'users.show': new HttpRouteData('/users/{id}', 'users.show', null, [GET], [], [], [], [], [], null, null, true, [
                new HttpParameterData('id', '[0-9]+'),
            ]),
            'users.store': new HttpRouteData('/users', 'users.store', null, [POST]),
        };

        const actual = generate('AppHttpRoutingData', (directory) => {
            const generator = new AstHttpDataFileGenerator();
            generator.classImportMap = { HttpRouteProvider: '../Provider/HttpRouteProvider.ts' };
            generator.generateFile(directory, 'AppHttpRoutingData', 'App.Data', routes, routeData);
        });

        assertGolden(actual, 'AppHttpRoutingData');
    });

    it('matches the AppHttpRoutingDataDynamic golden built from a real DynamicRoute expression', () => {
        // Build the route value through the reader so the whole pipeline is pinned:
        // reader constructor-arg order (regex placeholder in slot 2, parameters always
        // emitted) plus the generator injecting the computed regex into that slot.
        const data = new HttpRouteData(
            '/users/{id}',
            'users.show',
            new HandlerData('UsersController', 'show'),
            [GET],
            [],
            [],
            [],
            [],
            [],
            null,
            null,
            true,
            [new HttpParameterData('id', '[0-9]+')],
        );

        const routes = { 'users.show': new ExposedHttpRouteAttributeReader().build(data) };
        const routeData = { 'users.show': data };

        const actual = generate('AppHttpRoutingDataDynamic', (directory) => {
            const generator = new AstHttpDataFileGenerator();
            generator.classImportMap = { UsersController: '../Controller/UsersController.ts' };
            generator.generateFile(directory, 'AppHttpRoutingDataDynamic', 'App.Data', routes, routeData);
        });

        assertGolden(actual, 'AppHttpRoutingDataDynamic');
    });

    it('matches the AppHttpRoutingDataAutoPromoted golden built end-to-end from an auto-promoted @Route', () => {
        // Read a real controller fixture: `users.index` is a plain @Route whose `{id}` path
        // auto-promotes it to a dynamic route, carrying a `parameters` option. This pins the
        // full pipeline — the reader promoting a plain @Route and the generator emitting a
        // constructor-correct `new DynamicRoute(...)` with the computed regex in slot 2.
        const result = new HttpRouteAttributeReader().readFile(fixture('Http/TestHttpControllerFixture'));

        const routes = { 'users.index': result.routes['users.index'] };
        const routeData = { 'users.index': result.routeData['users.index'] };

        const actual = generate('AppHttpRoutingDataAutoPromoted', (directory) => {
            const generator = new AstHttpDataFileGenerator();
            generator.classImportMap = {
                TestHttpControllerFixture: '../Controller/TestHttpControllerFixture.ts',
                AllMiddlewareFixture: '../Middleware/AllMiddlewareFixture.ts',
            };
            generator.generateFile(directory, 'AppHttpRoutingDataAutoPromoted', 'App.Data', routes, routeData);
        });

        assertGolden(actual, 'AppHttpRoutingDataAutoPromoted');
    });

    it('matches the AppGrpcRoutingData golden', () => {
        // The shape sindri emits for an app whose gRPC route provider declares its methods
        // imperatively: each route keyed by its fully-qualified method, emitted verbatim — including
        // the `with*` builder chain a streaming method carries, which the key must see through.
        const routeExprs = parseRouteExprs(
            [
                `new Route('/app.Ping/Ping', GrpcRouteProvider.pingHandler)`,
                `new Route('/app.Ping/Fanout', GrpcRouteProvider.fanoutHandler).withServerStreaming(true)`,
                `new Route('/app.Ping/Echo', GrpcRouteProvider.echoHandler).withClientStreaming(true).withServerStreaming(true)`,
            ].join(', '),
        );

        const actual = generate('AppGrpcRoutingData', (directory) => {
            const generator = new AstGrpcDataFileGenerator();
            generator.classImportMap = { GrpcRouteProvider: '../Provider/GrpcRouteProvider.ts' };
            generator.generateFileFromRoutes(directory, 'AppGrpcRoutingData', 'App.Data', routeExprs);
        });

        assertGolden(actual, 'AppGrpcRoutingData');
    });

    it('matches the AppCliRoutingData golden', () => {
        const routes = {
            greet: placeholder('greet-expr'),
            farewell: placeholder('farewell-expr'),
        };

        const actual = generate('AppCliRoutingData', (directory) => {
            const generator = new AstCliDataFileGenerator();
            generator.classImportMap = { CliRouteProvider: '../Provider/CliRouteProvider.ts' };
            generator.generateFile(directory, 'AppCliRoutingData', 'App.Data', routes);
        });

        assertGolden(actual, 'AppCliRoutingData');
    });

    it('matches the AppCliRoutingDataFull golden built from a real Route with an argument and option', () => {
        // Build the CLI route value through the reader so the emitted constructor argument order
        // is pinned end-to-end: Route(name, description, handler, helpText, 4 middleware buckets,
        // [arguments], [options]) plus ArgumentParameter(...) and OptionParameter(...) — the latter
        // proving the empty `options` slot keeps mode/valueMode in their correct positions.
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

        const routes = { greet: new ExposedCliRouteAttributeReader().build(data) };

        const actual = generate('AppCliRoutingDataFull', (directory) => {
            const generator = new AstCliDataFileGenerator();
            generator.classImportMap = { GreetController: '../Controller/GreetController.ts' };
            generator.generateFile(directory, 'AppCliRoutingDataFull', 'App.Data', routes);
        });

        assertGolden(actual, 'AppCliRoutingDataFull');
    });

    it('matches the AppCliRoutingData framework-commands golden', () => {
        // The shape sindri emits for an app whose component-provider tree reaches
        // the framework's own CLI route providers: commands keyed by the constant
        // that names them, route expressions emitted verbatim from the framework
        // source, and every class they reference imported by package specifier.
        const routeExprs = parseRouteExprs(
            [
                `new Route(CliCommandName.LIST, 'List all commands', CliRoutingCliRouteProvider.listHandler, () => new Message('A command to list all the commands.'), [], [], [], [], [], [new OptionParameter('namespace', 'An optional namespace', 'namespace', null, '', ['n'])])`,
                `new Route(HttpCommandName.LIST, 'List all routes', HttpRoutingCliRouteProvider.listHandler, () => ListCommand.help())`,
                `new Route('test', 'Test command', CliRouteProvider.testCommandHandler)`,
            ].join(', '),
        );

        const actual = generate('AppCliRoutingData', (directory) => {
            const generator = new AstCliDataFileGenerator();
            generator.classImportMap = {
                CliRoutingCliRouteProvider: '@valkyrjaio/valkyrja/Cli/Routing/Provider/CliRoutingCliRouteProvider.ts',
                CliCommandName: '@valkyrjaio/valkyrja/Cli/Server/Constant/CommandName.ts',
                Message: '@valkyrjaio/valkyrja/Cli/Interaction/Message/Message.ts',
                OptionParameter: '@valkyrjaio/valkyrja/Cli/Routing/Data/OptionParameter.ts',
                HttpRoutingCliRouteProvider: '@valkyrjaio/valkyrja/Http/Routing/Provider/HttpRoutingCliRouteProvider.ts',
                HttpCommandName: '@valkyrjaio/valkyrja/Http/Routing/Cli/Command/Constant/CommandName.ts',
                ListCommand: '@valkyrjaio/valkyrja/Http/Routing/Cli/Command/ListCommand.ts',
                CliRouteProvider: '../Provider/CliRouteProvider.ts',
            };
            generator.generateFileFromRoutes(directory, 'AppCliRoutingData', 'App.Data', routeExprs);
        });

        assertGolden(actual, 'AppCliRoutingDataFrameworkCommands');
    });

    it('matches the AppContainerData golden', () => {
        const publishers = {
            'service.a': ['DataServiceProvider', 'publishA'] as const,
            'service.b': ['DataServiceProvider', 'publishB'] as const,
        };

        const actual = generate('AppContainerData', (directory) => {
            const generator = new AstContainerDataFileGenerator();
            generator.classImportMap = { DataServiceProvider: '../Provider/DataServiceProvider.ts' };
            generator.generateFile(directory, 'AppContainerData', 'App.Data', publishers);
        });

        assertGolden(actual, 'AppContainerData');
    });

    it('matches the AppEventData golden', () => {
        const listeners = {
            'user.created': placeholder('user-created-expr'),
            'user.deleted': placeholder('user-deleted-expr'),
        };

        const actual = generate('AppEventData', (directory) => {
            const generator = new AstEventDataFileGenerator();
            generator.classImportMap = { AppListenerProvider: '../Provider/AppListenerProvider.ts' };
            generator.generateFile(directory, 'AppEventData', 'App.Data', listeners);
        });

        assertGolden(actual, 'AppEventData');
    });

    it('matches the CachedConfig golden', () => {
        // Mirrors what ConfigSourceReader produces for an application config that
        // extends a framework config: values the author passed, defaults filled in
        // from the base, and a provider import that must not survive.
        const source = new ConfigSourceResult(
            'Config',
            'HttpConfigContract',
            '@valkyrjaio/valkyrja/Application/Data/Contract/HttpConfigContract.ts',
            {
                namespace: "'App'",
                dir: 'process.cwd()',
                version: "'1.0.0'",
                environment: "'production'",
                debugMode: 'true',
                timezone: "'UTC'",
                key: "process.env['APP_KEY'] ?? ''",
                dataPath: "'src/App/Http/Data'",
                dataNamespace: "'App/Http/Data'",
                providers: '[new ComponentProvider()]',
                callbacks: '[ComponentProvider.publish]',
                requestReceivedMiddleware: '[CacheResponseMiddleware]',
                routeMatchedMiddleware: '[]',
                routeNotMatchedMiddleware: '[]',
                routeDispatchedMiddleware: '[]',
                throwableCaughtMiddleware: '[]',
                sendingResponseMiddleware: '[]',
                responseSentMiddleware: '[]',
            },
            {
                namespace: 'string',
                version: 'string',
                environment: 'string',
                debugMode: 'boolean',
                timezone: 'string',
                key: 'string',
                dataPath: 'string',
                dataNamespace: 'string',
                requestReceivedMiddleware: 'string[]',
                routeMatchedMiddleware: 'string[]',
                routeNotMatchedMiddleware: 'string[]',
                routeDispatchedMiddleware: 'string[]',
                throwableCaughtMiddleware: 'string[]',
                sendingResponseMiddleware: 'string[]',
                responseSentMiddleware: 'string[]',
            },
            [
                new ConfigImport('ComponentProvider', './Provider/ComponentProvider.ts'),
                new ConfigImport(
                    'CacheResponseMiddleware',
                    '@valkyrjaio/valkyrja/Http/Server/Middleware/CacheResponseMiddleware.ts',
                ),
            ],
        );

        const actual = generate('CachedConfig', (directory) => {
            new AstCachedConfigFileGenerator().generateFile(
                directory,
                'CachedConfig',
                source,
                'AppContainerData',
                './Data/AppContainerData.ts',
            );
        });

        assertGolden(actual, 'CachedConfig');
    });
});
