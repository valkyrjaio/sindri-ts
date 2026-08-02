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

import { HttpParameterData } from '../../../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteData } from '../../../../../../src/Sindri/Ast/Data/HttpRouteData.ts';
import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { GeneratorUnreachableException } from '../../../../../../src/Sindri/Generator/Throwable/Exception/GeneratorUnreachableException.ts';
import { AstHttpDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Http/AstHttpDataFileGenerator.ts';
import { lastWrittenFile, parseRouteExprs } from '../generatorTestUtil.ts';

import type { ProcessorContract } from '@valkyrjaio/valkyrja/Http/Routing/Processor/Contract/ProcessorContract.ts';
import type { RouteContract } from '@valkyrjaio/valkyrja/Http/Routing/Data/Contract/RouteContract.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

const GET = 'RequestMethod::GET';
const POST = 'RequestMethod::POST';

function newRouteExpr(): ts.NewExpression {
    return ts.factory.createNewExpression(ts.factory.createIdentifier('Route'), undefined, []);
}

function staticRoute(): HttpRouteData {
    return new HttpRouteData('/users/', 'users.index', null, [GET, POST]);
}

function dynamicRoute(): HttpRouteData {
    return new HttpRouteData('/users/{id}', 'users.show', null, [GET], [], [], [], [], [], null, null, true, [
        new HttpParameterData('id', 'Regex::NUM'),
    ]);
}

describe('AstHttpDataFileGenerator', () => {
    it('generates a file with static and dynamic routes, paths, dynamic paths and regexes', () => {
        const generator = new AstHttpDataFileGenerator();
        generator.classImportMap = { SomeController: './SomeController.ts' };

        const routes = {
            'users.index': newRouteExpr(),
            'users.show': newRouteExpr(),
        };
        const routeData = {
            'users.index': staticRoute(),
            'users.show': dynamicRoute(),
        };

        const status = generator.generateFile('/out', 'HttpData', 'App.Data', routes, routeData);

        expect(status).toBe(GenerateStatus.SUCCESS);
    });

    it('generates a file with no routes', () => {
        expect(new AstHttpDataFileGenerator().generateFile('/out', 'HttpData', 'App.Data', {}, {})).toBe(
            GenerateStatus.SUCCESS,
        );
    });

    it('builds the class contents body string', () => {
        const contents = new AstHttpDataFileGenerator().generateClassContents(
            { 'users.index': newRouteExpr() },
            { 'users.index': staticRoute() },
        );

        expect(contents).toContain('super(');
        expect(contents).toContain('users.index');
    });

    it('omits regexes when the processor yields no regex', () => {
        // A processor whose result lacks getRegex() forces computeRegex() to return ''.
        const processor = { route: (): RouteContract => ({}) as RouteContract } as unknown as ProcessorContract;
        const generator = new AstHttpDataFileGenerator(processor);

        const status = generator.generateFile(
            '/out',
            'HttpData',
            'App.Data',
            { 'users.show': newRouteExpr() },
            { 'users.show': dynamicRoute() },
        );

        expect(status).toBe(GenerateStatus.SUCCESS);
    });

    it('throws GeneratorUnreachableException if the temporary route handler is ever dispatched', () => {
        // The handler passed to the temporary DynamicRoute is a guard that must never run during
        // code generation; invoke it via a processor that dispatches the route to prove it throws.
        const processor = {
            route: (route: RouteContract): RouteContract => {
                (route as unknown as { getHandler: () => (...args: unknown[]) => unknown }).getHandler()();

                return route;
            },
        } as unknown as ProcessorContract;
        const generator = new AstHttpDataFileGenerator(processor);

        expect(() =>
            generator.generateFile(
                '/out',
                'HttpData',
                'App.Data',
                { 'users.show': newRouteExpr() },
                { 'users.show': dynamicRoute() },
            ),
        ).toThrow(GeneratorUnreachableException);
    });

    it('generates the routing data from imperative getRoutes() route objects', () => {
        const generator = new AstHttpDataFileGenerator();
        generator.classImportMap = { HttpRouteProvider: '../Provider/HttpRouteProvider.ts' };

        const routeExprs = parseRouteExprs(
            [
                `new Route('/', 'home', HttpRouteProvider.home)`,
                `new Route('/users', 'users.index', HttpRouteProvider.index, [RequestMethod.GET, RequestMethod.POST])`,
                `new DynamicRoute('/users/{id}', 'users.show', '/users/([0-9]+)', [new Parameter('id', '[0-9]+')], HttpRouteProvider.show, [RequestMethod.GET])`,
                `new Route('/any', 'any', HttpRouteProvider.any, [RequestMethod.ANY])`,
            ].join(', '),
        );

        const status = generator.generateFileFromRoutes('/out', 'AppHttpRoutingData', 'App.Data', routeExprs);
        const file = lastWrittenFile();

        expect(status).toBe(GenerateStatus.SUCCESS);

        // Route closures are emitted verbatim, keyed by route name, with the provider import.
        expect(file).toContain(`import { HttpRouteProvider } from '../Provider/HttpRouteProvider.ts';`);
        expect(file).toContain(`['home']: (): RouteContract => new Route('/', 'home', HttpRouteProvider.home)`);
        expect(file).toContain(`['users.show']: (): RouteContract => new DynamicRoute(`);

        // Static paths: the GET/POST split and the default [HEAD, GET] for the method-less route.
        expect(file).toContain('"POST": {\n        "/users": "users.index"');
        expect(file).toContain('"HEAD": {\n        "/": "home"');

        // Dynamic routes populate dynamicPaths and regexes (keyed by the literal path and regex).
        expect(file).toContain('"/users/{id}": "users.show"');
        expect(file).toContain('"/users/([0-9]+)": "users.show"');

        // RequestMethod.ANY expands to every request method.
        expect(file).toContain('"DELETE": {\n        "/any": "any"');
    });

    it('emits an empty routes map when no imperative routes are provided', () => {
        const status = new AstHttpDataFileGenerator().generateFileFromRoutes('/out', 'AppHttpRoutingData', 'App.Data', []);

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(lastWrittenFile()).toContain('super(\n            {},');
    });

    it('skips non-route and non-literal-name expressions and ignores non-enum method entries', () => {
        const routeExprs = parseRouteExprs(
            [
                // Not a new-expression — ignored entirely.
                `buildRoute()`,
                // A new-expression whose callee is not a plain identifier — ignored.
                `new Routing.Route('/n', 'n', handler)`,
                // A bare `new Route` with no argument list (arguments undefined) — ignored.
                `new Route`,
                // A route whose name argument is not a string literal — ignored.
                `new Route('/x', dynamicName, handler)`,
                // A route whose path argument is not a string literal — ignored.
                `new Route(dynamicPath, 'p', handler)`,
                // A dynamic route whose regex argument is not a string literal falls back to '',
                // so it contributes a dynamic path but no regex entry.
                `new DynamicRoute('/d/{id}', 'd.show', dynamicRegex, [new Parameter('id', '[0-9]+')], handler, [RequestMethod.GET])`,
                // A valid route whose request-methods array holds a non-enum entry, which is skipped.
                `new Route('/y', 'y', handler, [SPREAD_METHODS])`,
            ].join(', '),
        );

        const status = new AstHttpDataFileGenerator().generateFileFromRoutes(
            '/out',
            'AppHttpRoutingData',
            'App.Data',
            routeExprs,
        );
        const file = lastWrittenFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        // Only the named routes are emitted; the method-less/invalid ones contribute no path entries.
        expect(file).toContain(`['y']: (): RouteContract => new Route('/y', 'y', handler, [SPREAD_METHODS])`);
        expect(file).toContain(`['d.show']: (): RouteContract => new DynamicRoute(`);
        // The empty-regex dynamic route appears in dynamicPaths but not in regexes.
        expect(file).toContain('"/d/{id}": "d.show"');
        expect(file).not.toContain('dynamicName');
        expect(file).not.toContain('dynamicPath');
    });

    it('covers repeated methods, empty path/name, non-Regex casts, orphans and colon keys', () => {
        const generator = new AstHttpDataFileGenerator();

        const dyn = (path: string, name: string, regex: string): HttpRouteData =>
            new HttpRouteData(path, name, null, [GET], [], [], [], [], [], null, null, true, [
                new HttpParameterData('id', regex),
            ]);

        // A new-expression whose arguments are undefined (exercises the `?? []` fallback).
        const undefinedArgsExpr = ts.factory.createNewExpression(
            ts.factory.createIdentifier('Route'),
            undefined,
            undefined,
        );

        const routes = {
            'a.index': newRouteExpr(),
            'b.index': newRouteExpr(),
            'd1.show': undefinedArgsExpr,
            'd2.show': newRouteExpr(),
            'empty.route': newRouteExpr(),
            'reg.none': newRouteExpr(),
            'no.param': newRouteExpr(),
            'Orphan::KEY': newRouteExpr(),
        };

        const routeData = {
            // Two static routes sharing GET exercise the "method already seen" path branch.
            'a.index': new HttpRouteData('/a', 'a.index', null, [GET]),
            'b.index': new HttpRouteData('/b', 'b.index', null, [GET]),
            // Two dynamic routes sharing GET exercise the dynamic-path and regex "already seen" branches.
            'd1.show': dyn('/d1/{id}', 'd1.show', 'Regex::NUM'),
            'd2.show': dyn('/d2/{id}', 'd2.show', 'Regex::NUM'),
            // Empty path and name fall back to '/' and 'temp'; a non-Regex enum cast is left as-is.
            'empty.route': dyn('', '', 'Other::FOO'),
            // A Regex:: cast that does not resolve to a known pattern.
            'reg.none': dyn('/r/{id}', 'reg.none', 'Regex::NONEXISTENT'),
            // A dynamic route with no parameters yields an empty computed regex.
            'no.param': new HttpRouteData('/np', 'no.param', null, [GET], [], [], [], [], [], null, null, true, []),
            // 'Orphan::KEY' is intentionally absent from routeData.
        };

        expect(generator.generateFile('/out', 'HttpData', 'App.Data', routes, routeData)).toBe(GenerateStatus.SUCCESS);
    });
});
