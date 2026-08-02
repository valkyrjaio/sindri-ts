/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { ListenerAttributeResult } from '../../../../../../src/Sindri/Ast/Data/Result/ListenerAttributeResult.ts';

describe('ListenerAttributeResult', () => {
    it('defaults to no listeners', () => {
        expect(new ListenerAttributeResult().listeners).toStrictEqual({});
    });
});
