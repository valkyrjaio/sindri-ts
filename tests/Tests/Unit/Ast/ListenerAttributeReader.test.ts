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
}

describe('ListenerAttributeReader', () => {
    it('reads class-level and method-level @Listener decorators', () => {
        const result = new ListenerAttributeReader().readFile(fixture('TestListenerFixture'));

        expect(Object.keys(result.listeners)).toContain('sendWelcome');
        expect(Object.keys(result.listeners)).toContain('cleanup');
    });

    it('skips listeners with an empty event id or name', () => {
        const result = new ListenerAttributeReader().readFile(fixture('TestEmptyListenerFixture'));

        expect(Object.keys(result.listeners)).toHaveLength(0);
    });

    it('returns an empty result when there is no class', () => {
        const result = new ListenerAttributeReader().readFile(fixture('../Config/TestConfigNoClassFixture'));

        expect(Object.keys(result.listeners)).toHaveLength(0);
    });

    it('builds a null handler argument when the listener has no handler', () => {
        const expr = new TestListenerAttributeReader().build(new ListenerData('event.id', 'name', null));

        expect(ts.isNewExpression(expr)).toBe(true);
    });
});
