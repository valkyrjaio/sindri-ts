/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ConfigResult } from '../../../../../../src/Sindri/Ast/Data/Result/ConfigResult.ts';

describe('ConfigResult', () => {
    it('defaults to empty values', () => {
        const result = new ConfigResult();

        expect(result.namespace).toBe('');
        expect(result.dir).toBe('');
        expect(result.dataPath).toBe('');
        expect(result.dataNamespace).toBe('');
        expect(result.providers).toStrictEqual([]);
    });

    it('stores the provided values', () => {
        const result = new ConfigResult('App', '/dir', 'data', 'ns', ['P']);

        expect(result.namespace).toBe('App');
        expect(result.providers).toStrictEqual(['P']);
    });
});
