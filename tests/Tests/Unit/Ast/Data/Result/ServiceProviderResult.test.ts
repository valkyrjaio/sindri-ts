/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
