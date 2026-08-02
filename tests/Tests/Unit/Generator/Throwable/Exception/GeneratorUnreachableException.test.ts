/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { GeneratorUnreachableException } from '../../../../../../src/Sindri/Generator/Throwable/Exception/GeneratorUnreachableException.ts';

describe('GeneratorUnreachableException', () => {
    it('is a throwable runtime exception', () => {
        const exception = new GeneratorUnreachableException('unreachable');

        expect(exception).toBeInstanceOf(Error);
        expect(exception.message).toBe('unreachable');
    });
});
