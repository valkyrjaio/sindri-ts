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

    it('defaults to empty chained routes and chained imports', () => {
        const result = new RouteProviderResult();

        expect(result.chainedRoutes).toStrictEqual([]);
        expect(result.chainedRouteImports).toStrictEqual({});
    });

    it('merges each chained field into its own field', () => {
        // Each field carries a distinct value, so swapping two of the merge arguments fails here
        // rather than passing on a value a sibling field also holds.
        const chained = {} as unknown as ts.Expression;
        const a = new RouteProviderResult(['C1'], [expr], { Bare: '/a/Bare.ts' }, [chained], {
            Chained: '/a/Chained.ts',
        });
        const b = new RouteProviderResult([], [], { Second: '/b/Second.ts' }, [chained], {
            Other: '/b/Other.ts',
        });

        const merged = a.merge(b);

        expect(merged.routeImports).toStrictEqual({ Bare: '/a/Bare.ts', Second: '/b/Second.ts' });
        expect(merged.chainedRoutes).toHaveLength(2);
        expect(merged.chainedRouteImports).toStrictEqual({
            Chained: '/a/Chained.ts',
            Other: '/b/Other.ts',
        });
    });
});
