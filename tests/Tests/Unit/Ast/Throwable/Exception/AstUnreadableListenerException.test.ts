/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { AstUnreadableListenerException } from '../../../../../../src/Sindri/Ast/Throwable/Exception/AstUnreadableListenerException.ts';

describe('AstUnreadableListenerException', () => {
    it('is a throwable invalid argument exception', () => {
        const exception = new AstUnreadableListenerException('unreadable');

        expect(exception).toBeInstanceOf(Error);
        expect(exception.message).toBe('unreadable');
    });
});
