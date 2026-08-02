/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';

describe('HandlerData', () => {
    it('stores the class and method', () => {
        const data = new HandlerData('App\\Controller', 'index');

        expect(data.class).toBe('App\\Controller');
        expect(data.method).toBe('index');
    });
});
