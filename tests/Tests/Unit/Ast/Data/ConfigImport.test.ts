/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';

import { ConfigImport } from '../../../../../src/Sindri/Ast/Data/ConfigImport.ts';

describe('ConfigImport', () => {
    it('defaults to a value import with no resolved path', () => {
        const entry = new ConfigImport('Route', '@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts');

        expect(entry.name).toBe('Route');
        expect(entry.specifier).toBe('@valkyrjaio/valkyrja/Http/Routing/Data/Route.ts');
        expect(entry.isType).toBe(false);
        expect(entry.resolvedPath).toBe('');
    });

    it('keeps the type flag and the resolved path it is given', () => {
        const entry = new ConfigImport(
            'RouteContract',
            './Contract/RouteContract.ts',
            true,
            '/app/Contract/RouteContract.ts',
        );

        expect(entry.isType).toBe(true);
        expect(entry.resolvedPath).toBe('/app/Contract/RouteContract.ts');
    });
});
