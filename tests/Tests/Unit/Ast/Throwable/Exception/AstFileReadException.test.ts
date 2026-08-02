/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { AstFileReadException } from '../../../../../../src/Sindri/Ast/Throwable/Exception/AstFileReadException.ts';

describe('AstFileReadException', () => {
    it('is a throwable runtime exception', () => {
        const exception = new AstFileReadException('cannot read file');

        expect(exception).toBeInstanceOf(Error);
        expect(exception.message).toBe('cannot read file');
    });
});
