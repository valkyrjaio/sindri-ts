/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { HttpParameterData } from '../../../../../src/Sindri/Ast/Data/HttpParameterData.ts';

describe('HttpParameterData', () => {
    it('exposes its defaults', () => {
        const data = new HttpParameterData('id', '\\d+');

        expect(data.name).toBe('id');
        expect(data.regex).toBe('\\d+');
        expect(data.cast).toBeNull();
        expect(data.isOptional).toBe(false);
        expect(data.shouldCapture).toBe(true);
    });

    it('stores the given values', () => {
        const data = new HttpParameterData('id', '\\d+', 'int', true, false);

        expect(data.cast).toBe('int');
        expect(data.isOptional).toBe(true);
        expect(data.shouldCapture).toBe(false);
    });
});
