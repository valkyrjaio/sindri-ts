/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { GenerateStatus } from '../../../../../src/Sindri/Generator/Enum/GenerateStatus.ts';

describe('GenerateStatus', () => {
    it('exposes the generation status values', () => {
        expect(GenerateStatus.SUCCESS).toBe('SUCCESS');
        expect(GenerateStatus.FAILURE).toBe('FAILURE');
        expect(GenerateStatus.SKIPPED).toBe('SKIPPED');
    });
});
