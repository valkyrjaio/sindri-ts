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
import { AstUnreadableListenerException } from '../../../../src/Sindri/Ast/Throwable/Exception/AstUnreadableListenerException.ts';

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

    it('returns an empty listener list when the provider declares no getListeners method', () => {
        const result = new ListenerProviderReader().readFile(fixture('Provider/TestComponentProviderFixture'));

        expect(result.listeners).toHaveLength(0);
        expect(result.listenerImports).toStrictEqual({});
    });

    it('returns an empty listener list when getListeners returns no array', () => {
        const result = new ListenerProviderReader().readFile(fixture('Provider/TestNonArrayListenerProviderFixture'));

        expect(result.listeners).toHaveLength(0);
    });

    describe('getListeners', () => {
        const result = new ListenerProviderReader().readFile(fixture('Provider/TestImperativeListenerProviderFixture'));
        const sources = result.listeners.map((listener) => listener.getText());

        it('reads a bare construction', () => {
            expect(sources).toContain(
                "new Listener('app.started', 'logStart', TestImperativeListenerProviderFixture.logStart)",
            );
        });

        it('reads a builder chain over a construction', () => {
            expect(sources.some((source) => source.includes('.withHandler('))).toBe(true);
            expect(sources.some((source) => source.includes('.withName('))).toBe(true);
            expect(sources.some((source) => source.includes('.withEventId('))).toBe(true);
        });

        it('leaves out an element that is not a construction', () => {
            expect(sources.some((source) => source.includes('listenerFactory()'))).toBe(false);
        });

        it('reads a chain whose base a cast dresses, which the generator then refuses', () => {
            const cast = new ListenerProviderReader().readFile(fixture('Provider/TestCastListenerProviderFixture'));

            expect(cast.listeners).toHaveLength(1);
        });

        it('resolves the classes the listener expressions reference', () => {
            expect(Object.keys(result.listenerImports)).toContain('TestEventIdFixture');
            expect(result.listenerImports['TestEventIdFixture']).toContain('TestEventIdFixture.ts');
        });

        it('skips a name the provider file does not import', () => {
            expect(Object.keys(result.listenerImports)).not.toContain('TestImperativeListenerProviderFixture');
        });
    });

    describe('a name the generated data file cannot import', () => {
        it.each([
            ['at its own module level', 'TestLocalHandlerListenerProviderFixture'],
            ['inside the method that uses it', 'TestMethodLocalHandlerListenerProviderFixture'],
            ['beside a member of the same name', 'TestMemberNameListenerProviderFixture'],
            ['beside a shorthand property of the same name', 'TestShorthandNameListenerProviderFixture'],
        ])('stops on a handler the provider declares %s', (_case, name) => {
            expect(() => new ListenerProviderReader().readFile(fixture(`Provider/${name}`))).toThrow(
                AstUnreadableListenerException,
            );
        });

        it('reads a global, and the names an inline handler declares', () => {
            const result = new ListenerProviderReader().readFile(
                fixture('Provider/TestGlobalHandlerListenerProviderFixture'),
            );

            expect(result.listeners).toHaveLength(2);
            expect(Object.keys(result.listenerImports)).not.toContain('console');
        });
    });
});
