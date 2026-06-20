/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';
import { HttpParameterData } from '../../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteData } from '../../../../../src/Sindri/Ast/Data/HttpRouteData.ts';

describe('HttpRouteData', () => {
    it('exposes its defaults', () => {
        const data = new HttpRouteData('/users', 'users.index');

        expect(data.path).toBe('/users');
        expect(data.name).toBe('users.index');
        expect(data.handler).toBeNull();
        expect(data.requestMethods).toStrictEqual([]);
        expect(data.isDynamic).toBe(false);
        expect(data.parameters).toStrictEqual([]);
    });

    it('stores handlers, methods, and parameters', () => {
        const handler = new HandlerData('App', 'index');
        const parameter = new HttpParameterData('id', '\\d+');
        const data = new HttpRouteData(
            '/users/{id}',
            'users.show',
            handler,
            ['GET'],
            [],
            [],
            [],
            [],
            [],
            null,
            null,
            true,
            [parameter],
        );

        expect(data.handler).toBe(handler);
        expect(data.requestMethods).toStrictEqual(['GET']);
        expect(data.isDynamic).toBe(true);
        expect(data.parameters).toStrictEqual([parameter]);
    });
});
