/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { CliOptionParameterData } from '../../../../../src/Sindri/Ast/Data/CliOptionParameterData.ts';

describe('CliOptionParameterData', () => {
    it('exposes its defaults', () => {
        const data = new CliOptionParameterData('name', 'description');

        expect(data.name).toBe('name');
        expect(data.valueDisplayName).toBe('');
        expect(data.cast).toBeNull();
        expect(data.defaultValue).toBe('');
        expect(data.shortNames).toStrictEqual([]);
        expect(data.validValues).toStrictEqual([]);
        expect(data.mode).toContain('OPTIONAL');
        expect(data.valueMode).toContain('DEFAULT');
    });

    it('stores the given values', () => {
        const data = new CliOptionParameterData('n', 'd', 'V', 'string', 'x', ['s'], ['a', 'b'], 'REQUIRED', 'ARRAY');

        expect(data.valueDisplayName).toBe('V');
        expect(data.shortNames).toStrictEqual(['s']);
        expect(data.validValues).toStrictEqual(['a', 'b']);
    });
});
