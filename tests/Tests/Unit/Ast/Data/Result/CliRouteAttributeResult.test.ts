/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { CliRouteAttributeResult } from '../../../../../../src/Sindri/Ast/Data/Result/CliRouteAttributeResult.ts';

describe('CliRouteAttributeResult', () => {
    it('defaults to no routes', () => {
        expect(new CliRouteAttributeResult().routes).toStrictEqual({});
    });
});
