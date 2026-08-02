/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { ConfigResult } from '../../../../../../src/Sindri/Ast/Data/Result/ConfigResult.ts';

describe('ConfigResult', () => {
    it('defaults to empty values', () => {
        const result = new ConfigResult();

        expect(result.namespace).toBe('');
        expect(result.dir).toBe('');
        expect(result.dataPath).toBe('');
        expect(result.dataNamespace).toBe('');
        expect(result.providers).toStrictEqual([]);
    });

    it('stores the provided values', () => {
        const result = new ConfigResult('App', '/dir', 'data', 'ns', ['P']);

        expect(result.namespace).toBe('App');
        expect(result.providers).toStrictEqual(['P']);
    });
});
