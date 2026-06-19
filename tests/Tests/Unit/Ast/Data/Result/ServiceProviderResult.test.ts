/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ServiceProviderResult } from '../../../../../../src/Sindri/Ast/Data/Result/ServiceProviderResult.ts';

describe('ServiceProviderResult', () => {
    it('defaults to empty classes and publishers', () => {
        const result = new ServiceProviderResult();

        expect(result.serviceClasses).toStrictEqual([]);
        expect(result.publishers).toStrictEqual({});
    });

    it('merges classes (de-duplicated) and publishers', () => {
        const a = new ServiceProviderResult(['S1'], { id1: ['S1', 'publish'] });
        const b = new ServiceProviderResult(['S1', 'S2'], { id2: ['S2', 'publish'] });

        const merged = a.merge(b);

        expect(merged.serviceClasses).toStrictEqual(['S1', 'S2']);
        expect(merged.publishers).toStrictEqual({ id1: ['S1', 'publish'], id2: ['S2', 'publish'] });
    });
});
