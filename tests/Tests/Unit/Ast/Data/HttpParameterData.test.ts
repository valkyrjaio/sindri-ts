/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { HttpParameterData } from '../../../../../src/Sindri/Ast/Data/HttpParameterData.ts';

describe('HttpParameterData', () => {
    it('exposes its defaults', () => {
        const data = new HttpParameterData('id', '\\d+');

        expect(data.name).toBe('id');
        expect(data.regex).toBe('\\d+');
        expect(data.cast).toBeNull();
        expect(data.isOptional).toBe(false);
        expect(data.shouldCapture).toBe(true);
    });

    it('stores the given values', () => {
        const data = new HttpParameterData('id', '\\d+', 'int', true, false);

        expect(data.cast).toBe('int');
        expect(data.isOptional).toBe(true);
        expect(data.shouldCapture).toBe(false);
    });
});
