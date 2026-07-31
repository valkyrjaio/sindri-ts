/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ConfigImport } from '../../../../../../src/Sindri/Ast/Data/ConfigImport.ts';
import { ConfigSourceResult } from '../../../../../../src/Sindri/Ast/Data/Result/ConfigSourceResult.ts';

describe('ConfigSourceResult', () => {
    it('defaults to an empty result', () => {
        const result = new ConfigSourceResult();

        expect(result.className).toBe('');
        expect(result.contractName).toBe('');
        expect(result.contractSpecifier).toBe('');
        expect(result.fields).toStrictEqual({});
        expect(result.types).toStrictEqual({});
        expect(result.imports).toStrictEqual([]);
    });

    it('keeps the values it is given', () => {
        const imports = [new ConfigImport('HttpConfig', './HttpConfig.ts')];
        const result = new ConfigSourceResult(
            'Config',
            'HttpConfigContract',
            '@valkyrjaio/valkyrja/Application/Data/Contract/HttpConfigContract.ts',
            { namespace: "'App'" },
            { namespace: 'string' },
            imports,
        );

        expect(result.className).toBe('Config');
        expect(result.contractName).toBe('HttpConfigContract');
        expect(result.fields['namespace']).toBe("'App'");
        expect(result.types['namespace']).toBe('string');
        expect(result.imports).toStrictEqual(imports);
    });
});
