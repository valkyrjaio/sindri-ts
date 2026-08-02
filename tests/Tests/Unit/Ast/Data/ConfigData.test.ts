/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
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
