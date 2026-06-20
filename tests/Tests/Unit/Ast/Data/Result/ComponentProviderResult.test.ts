/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ComponentProviderResult } from '../../../../../../src/Sindri/Ast/Data/Result/ComponentProviderResult.ts';

describe('ComponentProviderResult', () => {
    it('defaults to empty provider lists', () => {
        const result = new ComponentProviderResult();

        expect(result.componentProviders).toStrictEqual([]);
        expect(result.serviceProviders).toStrictEqual([]);
        expect(result.listenerProviders).toStrictEqual([]);
        expect(result.cliRouteProviders).toStrictEqual([]);
        expect(result.httpRouteProviders).toStrictEqual([]);
    });

    it('merges two results, de-duplicating each provider list', () => {
        const a = new ComponentProviderResult(['c1'], ['s1'], ['l1'], ['cli1'], ['http1']);
        const b = new ComponentProviderResult(['c1', 'c2'], ['s2'], [], [], []);

        const merged = a.merge(b);

        expect(merged.componentProviders).toStrictEqual(['c1', 'c2']);
        expect(merged.serviceProviders).toStrictEqual(['s1', 's2']);
    });
});
