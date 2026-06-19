/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
