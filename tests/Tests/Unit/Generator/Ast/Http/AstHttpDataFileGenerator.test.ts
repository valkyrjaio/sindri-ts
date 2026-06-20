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

vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
}));

describe('AstHttpDataFileGenerator', () => {
    it('generates a file with static and dynamic routes', () => {
        const generator = new AstHttpDataFileGenerator();
        generator.classImportMap = { SomeController: './SomeController.ts' };

        const routes = {
            'users.index': ts.factory.createNull(),
            'users.show': ts.factory.createNewExpression(ts.factory.createIdentifier('Route'), undefined, []),
        };
        const routeData = {
            'users.index': new HttpRouteData('/users', 'users.index', null, ['GET']),
            'users.show': new HttpRouteData(
                '/users/{id}',
                'users.show',
                null,
                ['GET'],
                [],
                [],
                [],
                [],
                [],
                null,
                null,
                true,
                [new HttpParameterData('id', '\\d+')],
            ),
        };

        const status = generator.generateFile('/out', 'HttpData', 'App.Data', routes, routeData);

        expect(status).toBe(GenerateStatus.SUCCESS);
    });

    it('generates a file with no routes', () => {
        expect(new AstHttpDataFileGenerator().generateFile('/out', 'HttpData', 'App.Data', {}, {})).toBe(
            GenerateStatus.SUCCESS,
        );
    });
});
