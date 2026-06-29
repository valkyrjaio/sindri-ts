/*
 * This file is part of the Valkyrja package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ListenerProviderReader } from '../../../../src/Sindri/Ast/ListenerProviderReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/${name}.ts`, import.meta.url));
}

describe('ListenerProviderReader', () => {
    it('extracts the listener classes', () => {
        const result = new ListenerProviderReader().readFile(fixture('Provider/TestListenerProviderClass'));

        expect(result.listenerClasses).toHaveLength(2);
        expect(result.listeners).toHaveLength(0);
    });

    it('returns an empty result when there is no class', () => {
        const result = new ListenerProviderReader().readFile(fixture('Config/TestConfigNoClass'));

        expect(result.listenerClasses).toHaveLength(0);
    });
});
