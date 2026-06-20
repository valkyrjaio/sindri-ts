/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { CliArgumentParameterData } from '../../../../../src/Sindri/Ast/Data/CliArgumentParameterData.ts';

describe('CliArgumentParameterData', () => {
    it('exposes its defaults', () => {
        const data = new CliArgumentParameterData('name', 'description');

        expect(data.name).toBe('name');
        expect(data.description).toBe('description');
        expect(data.cast).toBeNull();
        expect(data.mode).toContain('OPTIONAL');
        expect(data.valueMode).toContain('DEFAULT');
    });

    it('stores the given values', () => {
        const data = new CliArgumentParameterData('n', 'd', 'string', 'REQUIRED', 'ARRAY');

        expect(data.cast).toBe('string');
        expect(data.mode).toBe('REQUIRED');
        expect(data.valueMode).toBe('ARRAY');
    });
});
