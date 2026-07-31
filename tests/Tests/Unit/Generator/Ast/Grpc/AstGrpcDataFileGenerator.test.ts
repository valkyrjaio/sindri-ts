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

import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstGrpcDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Grpc/AstGrpcDataFileGenerator.ts';
import { lastWrittenFile, parseRouteExprs } from '../generatorTestUtil.ts';

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

describe('AstGrpcDataFileGenerator', () => {
    it('generates a gRPC routing data file with user imports', () => {
        const generator = new AstGrpcDataFileGenerator();
        generator.classImportMap = { PingController: './PingController.ts' };

        const status = generator.generateFile('/out', 'GrpcData', 'App.Data', {
            '/pkg.Service/Method': ts.factory.createNull(),
        });
        const file = lastWrittenFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(file).toContain(`import { PingController } from './PingController.ts';`);
        expect(file).toContain(`import { GrpcRoutingData } from '@valkyrjaio/valkyrja/Grpc/Routing/Data/GrpcRoutingData.ts';`);
        expect(file).toContain('export class GrpcData extends GrpcRoutingData {');
    });

    it('generates an empty service map when there are no routes', () => {
        const status = new AstGrpcDataFileGenerator().generateFile('/out', 'GrpcData', 'App.Data', {});

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(lastWrittenFile()).toContain('super({});');
    });

    it('formats route keys that contain a "::" separator', () => {
        const routes = { 'GrpcMethodName::PING': ts.factory.createNull() };

        expect(new AstGrpcDataFileGenerator().generateFile('/out', 'GrpcData', 'App.Data', routes)).toBe(
            GenerateStatus.SUCCESS,
        );
        expect(lastWrittenFile()).toContain('[GrpcMethodName.PING]');
    });

    it('keys each route by its fully-qualified method and emits it verbatim', () => {
        const generator = new AstGrpcDataFileGenerator();
        generator.classImportMap = { GrpcRouteProvider: '../Provider/GrpcRouteProvider.ts' };

        const routeExprs = parseRouteExprs(
            [
                `new Route('/pkg.Ping/Ping', GrpcRouteProvider.pingHandler)`,
                `new Route('/pkg.Ping/Fanout', GrpcRouteProvider.fanoutHandler)`,
            ].join(', '),
        );

        const status = generator.generateFileFromRoutes('/out', 'AppGrpcRoutingData', 'App.Data', routeExprs);
        const file = lastWrittenFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(file).toContain(`import { GrpcRouteProvider } from '../Provider/GrpcRouteProvider.ts';`);
        expect(file).toContain(
            `['/pkg.Ping/Ping']: (): RouteContract => new Route('/pkg.Ping/Ping', GrpcRouteProvider.pingHandler)`,
        );
        expect(file).toContain(
            `['/pkg.Ping/Fanout']: (): RouteContract => new Route('/pkg.Ping/Fanout', GrpcRouteProvider.fanoutHandler)`,
        );
    });

    it('keys a route built through a with* chain by the method on the underlying new expression', () => {
        // A gRPC route is routinely declared as `new Route(...).withClientStreaming(true)`, so the
        // key has to come from the `new` expression at the base of the chain rather than the
        // outermost call — otherwise every streaming route is silently dropped from the map.
        const routeExprs = parseRouteExprs(
            `new Route('/pkg.Ping/Echo', handler).withClientStreaming(true).withServerStreaming(true)`,
        );

        const status = new AstGrpcDataFileGenerator().generateFileFromRoutes(
            '/out',
            'AppGrpcRoutingData',
            'App.Data',
            routeExprs,
        );
        const file = lastWrittenFile();

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(file).toContain(`['/pkg.Ping/Echo']: (): RouteContract => new Route('/pkg.Ping/Echo', handler)`);
        expect(file).toContain('.withClientStreaming(true).withServerStreaming(true)');
    });

    it('keys a route whose method is a constant reference by that reference', () => {
        const routeExprs = parseRouteExprs(`new Route(GrpcMethodName.PING, handler)`);

        new AstGrpcDataFileGenerator().generateFileFromRoutes('/out', 'AppGrpcRoutingData', 'App.Data', routeExprs);

        expect(lastWrittenFile()).toContain('[GrpcMethodName.PING]');
    });

    it.each([
        ['an expression that is not a route construction', `someFactory()`],
        ['a route construction with an empty argument list', `new Route()`],
        // `new Route` with no parentheses at all — the AST gives it no argument list rather than an
        // empty one, which is a different branch from `new Route()`.
        ['a route construction with no argument list', `new Route`],
        ['a route whose method is neither a literal nor a constant reference', `new Route(buildMethod(), handler)`],
    ])('skips %s', (_name, source) => {
        const routeExprs = parseRouteExprs(source);

        new AstGrpcDataFileGenerator().generateFileFromRoutes('/out', 'AppGrpcRoutingData', 'App.Data', routeExprs);

        expect(lastWrittenFile()).toContain('super({});');
    });

    it('prints a synthesized route expression through the printer', () => {
        const status = new AstGrpcDataFileGenerator().generateFile('/out', 'GrpcData', 'App.Data', {
            '/pkg.Service/Method': ts.factory.createNull(),
        });

        expect(status).toBe(GenerateStatus.SUCCESS);
        expect(lastWrittenFile()).toContain(`['/pkg.Service/Method']: (): RouteContract => null`);
    });
});
