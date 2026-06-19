/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { HttpRouteAttributeResult } from '../../../../../../src/Sindri/Ast/Data/Result/HttpRouteAttributeResult.ts';

describe('HttpRouteAttributeResult', () => {
    it('defaults to no routes or route data', () => {
        const result = new HttpRouteAttributeResult();

        expect(result.routes).toStrictEqual({});
        expect(result.routeData).toStrictEqual({});
    });
});
