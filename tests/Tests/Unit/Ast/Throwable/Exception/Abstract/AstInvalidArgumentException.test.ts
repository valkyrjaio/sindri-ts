/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { AstInvalidArgumentException } from '../../../../../../../src/Sindri/Ast/Throwable/Exception/Abstract/AstInvalidArgumentException.ts';

class TestException extends AstInvalidArgumentException {}

describe('AstInvalidArgumentException', () => {
    it('is an Error subclass that retains its message and exposes a trace code', () => {
        const exception = new TestException('boom');

        expect(exception).toBeInstanceOf(Error);
        expect(exception.message).toBe('boom');
        expect(typeof exception.getTraceCode()).toBe('string');
    });
});
