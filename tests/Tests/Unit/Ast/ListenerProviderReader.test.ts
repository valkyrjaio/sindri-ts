/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ListenerProviderReader } from '../../../../src/Sindri/Ast/ListenerProviderReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

describe('ListenerProviderReader', () => {
    it('extracts the listener classes', () => {
        const result = new ListenerProviderReader().readFile(fixture('Provider/TestListenerProviderFixture'));

        expect(result.listenerClasses).toHaveLength(2);
        expect(result.listeners).toHaveLength(0);
    });

    it('returns an empty result when there is no class', () => {
        const result = new ListenerProviderReader().readFile(fixture('Config/TestConfigNoClassFixture'));

        expect(result.listenerClasses).toHaveLength(0);
    });
});
