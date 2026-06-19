/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { SindriInvalidArgumentException } from '../../../../../../src/Sindri/Throwable/Exception/Abstract/SindriInvalidArgumentException.ts';

class TestException extends SindriInvalidArgumentException {}

describe('SindriInvalidArgumentException', () => {
    it('is an Error subclass that retains its message and exposes a trace code', () => {
        const exception = new TestException('boom');

        expect(exception).toBeInstanceOf(Error);
        expect(exception.message).toBe('boom');
        expect(typeof exception.getTraceCode()).toBe('string');
    });
});
