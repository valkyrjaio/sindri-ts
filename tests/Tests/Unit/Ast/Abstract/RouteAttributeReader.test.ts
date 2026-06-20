/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MethodDeclaration, Project, SourceFile } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { RouteAttributeReader } from '../../../../../src/Sindri/Ast/Abstract/RouteAttributeReader.ts';
import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';

class TestRouteAttributeReader extends RouteAttributeReader {
    protected getRouteHandlerDecoratorName(): string {
        return 'RouteHandler';
    }

    public update(method: MethodDeclaration, currentClass: string): HandlerData {
        return this.updateHandler(method, {}, '', currentClass);
    }
}

function method(body: string, name = 'm'): MethodDeclaration {
    const sf: SourceFile = new Project({ useInMemoryFileSystem: true }).createSourceFile('f.ts', `class C { ${body} }`);
    return sf.getClassOrThrow('C').getMethodOrThrow(name);
}

const reader = new TestRouteAttributeReader();

describe('RouteAttributeReader', () => {
    it('resolves the handler from a @RouteHandler decorator argument', () => {
        const handler = reader.update(method("@RouteHandler([OtherClass, 'handle']) m() {}"), 'CurrentClass');

        expect(handler).toEqual(new HandlerData('OtherClass', 'handle'));
    });

    it('falls back to the current class and method name when no decorator is present', () => {
        const handler = reader.update(method('m() {}'), 'CurrentClass');

        expect(handler).toEqual(new HandlerData('CurrentClass', 'm'));
    });

    it('falls back when the decorator argument is not a handler pair', () => {
        const handler = reader.update(method("@RouteHandler('not-a-pair') m() {}"), 'CurrentClass');

        expect(handler).toEqual(new HandlerData('CurrentClass', 'm'));
    });
});
