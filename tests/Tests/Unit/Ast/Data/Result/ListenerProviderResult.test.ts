/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ListenerProviderResult } from '../../../../../../src/Sindri/Ast/Data/Result/ListenerProviderResult.ts';

import type * as ts from 'ts-morph';

const expr = {} as unknown as ts.Expression;

describe('ListenerProviderResult', () => {
    it('defaults to empty classes and listeners', () => {
        const result = new ListenerProviderResult();

        expect(result.listenerClasses).toStrictEqual([]);
        expect(result.listeners).toStrictEqual([]);
    });

    it('merges classes (de-duplicated) and concatenates listeners', () => {
        const a = new ListenerProviderResult(['L1'], [expr]);
        const b = new ListenerProviderResult(['L1', 'L2'], [expr]);

        const merged = a.merge(b);

        expect(merged.listenerClasses).toStrictEqual(['L1', 'L2']);
        expect(merged.listeners).toHaveLength(2);
    });
});
