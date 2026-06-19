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

import { ListenerAttributeReader } from '../../../../src/Sindri/Ast/ListenerAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Classes/Listener/${name}.ts`, import.meta.url));
}

describe('ListenerAttributeReader', () => {
    it('reads class-level and method-level @Listener decorators', () => {
        const result = new ListenerAttributeReader().readFile(fixture('TestListenerClass'));

        expect(Object.keys(result.listeners)).toContain('sendWelcome');
        expect(Object.keys(result.listeners)).toContain('cleanup');
    });

    it('skips listeners with an empty event id or name', () => {
        const result = new ListenerAttributeReader().readFile(fixture('TestEmptyListenerClass'));

        expect(Object.keys(result.listeners)).toHaveLength(0);
    });

    it('returns an empty result when there is no class', () => {
        const result = new ListenerAttributeReader().readFile(fixture('../Config/TestConfigNoClass'));

        expect(Object.keys(result.listeners)).toHaveLength(0);
    });
});
