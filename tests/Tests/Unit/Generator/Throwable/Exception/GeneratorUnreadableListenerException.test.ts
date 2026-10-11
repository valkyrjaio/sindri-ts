/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { describe, expect, it } from 'vitest';

import { GeneratorUnreadableListenerException } from '../../../../../../src/Sindri/Generator/Throwable/Exception/GeneratorUnreadableListenerException.ts';

describe('GeneratorUnreadableListenerException', () => {
    it('is a throwable invalid argument exception', () => {
        const exception = new GeneratorUnreadableListenerException('unreadable');

        expect(exception).toBeInstanceOf(Error);
        expect(exception.message).toBe('unreadable');
    });
});
