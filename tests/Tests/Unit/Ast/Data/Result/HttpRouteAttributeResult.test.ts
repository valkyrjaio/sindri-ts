/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
