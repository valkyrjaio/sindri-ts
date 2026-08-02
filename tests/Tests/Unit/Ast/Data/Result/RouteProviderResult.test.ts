/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { RouteProviderResult } from '../../../../../../src/Sindri/Ast/Data/Result/RouteProviderResult.ts';

import type * as ts from 'ts-morph';

const expr = {} as unknown as ts.Expression;

describe('RouteProviderResult', () => {
    it('defaults to empty controllers and routes', () => {
        const result = new RouteProviderResult();

        expect(result.controllerClasses).toStrictEqual([]);
        expect(result.routes).toStrictEqual([]);
    });

    it('merges controllers (de-duplicated) and concatenates routes', () => {
        const a = new RouteProviderResult(['C1'], [expr]);
        const b = new RouteProviderResult(['C1', 'C2'], [expr]);

        const merged = a.merge(b);

        expect(merged.controllerClasses).toStrictEqual(['C1', 'C2']);
        expect(merged.routes).toHaveLength(2);
    });
});
