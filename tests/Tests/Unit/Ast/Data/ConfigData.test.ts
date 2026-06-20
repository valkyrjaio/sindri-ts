/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ConfigData } from '../../../../../src/Sindri/Ast/Data/ConfigData.ts';

describe('ConfigData', () => {
    it('stores the configuration with default providers', () => {
        const data = new ConfigData('App', '/dir', 'data', 'App\\Data');

        expect(data.namespace).toBe('App');
        expect(data.dir).toBe('/dir');
        expect(data.dataPath).toBe('data');
        expect(data.dataNamespace).toBe('App\\Data');
        expect(data.providers).toStrictEqual([]);
    });

    it('stores the given providers', () => {
        expect(new ConfigData('App', '/d', 'p', 'n', ['P1']).providers).toStrictEqual(['P1']);
    });
});
