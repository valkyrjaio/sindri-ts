/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
