/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { fileURLToPath } from 'node:url';

import { ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { ListenerData } from '../../../../src/Sindri/Ast/Data/ListenerData.ts';
import { ListenerAttributeReader } from '../../../../src/Sindri/Ast/ListenerAttributeReader.ts';

function fixture(name: string): string {
    return fileURLToPath(new URL(`../../Fixtures/Listener/${name}.ts`, import.meta.url));
}

class TestListenerAttributeReader extends ListenerAttributeReader {
    public build(data: ListenerData): ts.Expression {
        return this.buildListenerExpr(data);
    }

    public imports(listenerData: readonly ListenerData[], filePath: string): Record<string, string> {
        return this.buildImportMap(listenerData, {}, filePath, 'TestListenerFixture');
    }
}

describe('ListenerAttributeReader', () => {
    it('reads class-level and method-level @Listener decorators', () => {
        const result = new ListenerAttributeReader().readFile(fixture('TestListenerFixture'));

        expect(result.listeners.has('sendWelcome')).toBe(true);
        expect(result.listeners.has('cleanup')).toBe(true);
    });

    it('skips listeners with an empty event id or name', () => {
        const result = new ListenerAttributeReader().readFile(fixture('TestEmptyListenerFixture'));

        expect(result.listeners.size).toBe(0);
    });

    it('returns an empty result when there is no class', () => {
        const result = new ListenerAttributeReader().readFile(fixture('../Config/TestConfigNoClassFixture'));

        expect(result.listeners.size).toBe(0);
    });

    it('builds a null handler argument when the listener has no handler', () => {
        const expr = new TestListenerAttributeReader().build(new ListenerData('event.id', 'name', null));

        expect(ts.isNewExpression(expr)).toBe(true);
    });

    describe('importMap', () => {
        it('resolves a handler the listener class itself declares to that class', () => {
            const filePath = fixture('TestListenerFixture');
            const result = new ListenerAttributeReader().readFile(filePath);

            expect(result.importMap['TestListenerFixture']).toBe(filePath);
        });

        it('resolves a handler another class declares through the listener file imports', () => {
            const result = new ListenerAttributeReader().readFile(fixture('TestImportedHandlerListenerFixture'));

            expect(result.importMap['TestListenerHandlerFixture']).toContain('TestListenerHandlerFixture.ts');
        });

        it('skips a handler class the listener file does not import', () => {
            // `CustomHandler` and `DirectHandler` name no import in the fixture, so no specifier
            // can be emitted for them.
            const result = new ListenerAttributeReader().readFile(fixture('TestListenerFixture'));

            expect(Object.keys(result.importMap)).not.toContain('CustomHandler');
            expect(Object.keys(result.importMap)).not.toContain('DirectHandler');
        });

        it('holds nothing for a listener with no handler', () => {
            const reader = new TestListenerAttributeReader();

            expect(reader.imports([new ListenerData('event.id', 'name', null)], fixture('TestListenerFixture'))).toStrictEqual({});
        });
    });
});
