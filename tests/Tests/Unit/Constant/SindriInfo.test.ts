/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { SindriInfo } from '../../../../src/Sindri/Constant/SindriInfo.ts';

describe('SindriInfo', () => {
    it('exposes the version and build metadata', () => {
        expect(SindriInfo.VERSION).toBe('26.1.0');
        expect(typeof SindriInfo.VERSION_BUILD_DATE_TIME).toBe('string');
        expect(SindriInfo.ICON).toContain('█');
    });
});
