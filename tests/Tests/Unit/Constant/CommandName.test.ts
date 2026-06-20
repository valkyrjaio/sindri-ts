/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { CommandName } from '../../../../src/Sindri/Constant/CommandName.ts';

describe('CommandName', () => {
    it('exposes the data:generate command name', () => {
        expect(CommandName.DATA_GENERATE).toBe('data:generate');
    });
});
