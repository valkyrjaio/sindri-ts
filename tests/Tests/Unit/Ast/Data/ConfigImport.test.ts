/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
