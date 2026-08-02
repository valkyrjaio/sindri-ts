/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { GeneratorInvalidArgumentException } from '../../../../../../../src/Sindri/Generator/Throwable/Exception/Abstract/GeneratorInvalidArgumentException.ts';

class TestException extends GeneratorInvalidArgumentException {}

describe('GeneratorInvalidArgumentException', () => {
    it('is an Error subclass that retains its message and exposes a trace code', () => {
        const exception = new TestException('boom');

        expect(exception).toBeInstanceOf(Error);
        expect(exception.message).toBe('boom');
        expect(typeof exception.getTraceCode()).toBe('string');
    });
});
