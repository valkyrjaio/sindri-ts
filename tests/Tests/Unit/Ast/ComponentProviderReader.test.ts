/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ComponentProviderReader } from '../../../../src/Sindri/Ast/ComponentProviderReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

describe('ComponentProviderReader', () => {
    it('extracts the provider class lists from each getter method', () => {
        const result = new ComponentProviderReader().readFile(fixture('Provider/TestComponentProviderFixture'));

        expect(result.componentProviders).toHaveLength(2);
        expect(result.serviceProviders).toHaveLength(1);
        expect(result.listenerProviders).toHaveLength(0);
        expect(result.cliRouteProviders).toHaveLength(1);
        expect(result.httpRouteProviders).toHaveLength(0);
    });

    it('returns an empty result when there is no class', () => {
        const result = new ComponentProviderReader().readFile(fixture('Config/TestConfigNoClassFixture'));

        expect(result.componentProviders).toHaveLength(0);
    });
});
