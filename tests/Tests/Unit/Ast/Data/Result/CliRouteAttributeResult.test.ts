/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { CliRouteAttributeResult } from '../../../../../../src/Sindri/Ast/Data/Result/CliRouteAttributeResult.ts';

describe('CliRouteAttributeResult', () => {
    it('defaults to no routes', () => {
        expect(new CliRouteAttributeResult().routes).toStrictEqual({});
    });
});
