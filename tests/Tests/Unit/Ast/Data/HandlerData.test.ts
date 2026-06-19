/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';

describe('HandlerData', () => {
    it('stores the class and method', () => {
        const data = new HandlerData('App\\Controller', 'index');

        expect(data.class).toBe('App\\Controller');
        expect(data.method).toBe('index');
    });
});
