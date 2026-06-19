/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ListenerAttributeResult } from '../../../../../../src/Sindri/Ast/Data/Result/ListenerAttributeResult.ts';

describe('ListenerAttributeResult', () => {
    it('defaults to no listeners', () => {
        expect(new ListenerAttributeResult().listeners).toStrictEqual({});
    });
});
