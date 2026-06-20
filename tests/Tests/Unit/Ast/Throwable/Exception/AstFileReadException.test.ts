/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
