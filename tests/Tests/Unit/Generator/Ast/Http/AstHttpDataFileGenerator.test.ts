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

import { HttpParameterData } from '../../../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteData } from '../../../../../../src/Sindri/Ast/Data/HttpRouteData.ts';
import { GenerateStatus } from '../../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';
import { AstHttpDataFileGenerator } from '../../../../../../src/Sindri/Generator/Ast/Http/AstHttpDataFileGenerator.ts';

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
});
