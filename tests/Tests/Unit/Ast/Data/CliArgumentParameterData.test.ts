/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { CliArgumentParameterData } from '../../../../../src/Sindri/Ast/Data/CliArgumentParameterData.ts';

describe('CliArgumentParameterData', () => {
    it('exposes its defaults', () => {
        const data = new CliArgumentParameterData('name', 'description');

        expect(data.name).toBe('name');
        expect(data.description).toBe('description');
        expect(data.cast).toBeNull();
        expect(data.mode).toContain('OPTIONAL');
        expect(data.valueMode).toContain('DEFAULT');
    });

    it('stores the given values', () => {
        const data = new CliArgumentParameterData('n', 'd', 'string', 'REQUIRED', 'ARRAY');

        expect(data.cast).toBe('string');
        expect(data.mode).toBe('REQUIRED');
        expect(data.valueMode).toBe('ARRAY');
    });
});
