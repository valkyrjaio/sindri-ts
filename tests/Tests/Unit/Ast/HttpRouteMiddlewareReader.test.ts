/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import * as path from 'path';
import { fileURLToPath } from 'node:url';

import { MethodDeclaration, Project, SourceFile, ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { HttpRouteData } from '../../../../src/Sindri/Ast/Data/HttpRouteData.ts';
import { HttpRouteMiddlewareReader } from '../../../../src/Sindri/Ast/HttpRouteMiddlewareReader.ts';

function sourceFile(code: string): SourceFile {
    return new Project({ useInMemoryFileSystem: true }).createSourceFile('f.ts', code);
}

function method(body: string, name = 'm'): MethodDeclaration {
    return sourceFile(`class C { ${body} }`).getClassOrThrow('C').getMethodOrThrow(name);
}

/** Compiler object-literal node for `const __x = <code>;`. */
function objectLiteral(code: string): ts.ObjectLiteralExpression {
    return sourceFile(`const __x = ${code};`).getVariableDeclarationOrThrow('__x').getInitializerOrThrow()
        .compilerNode as ts.ObjectLiteralExpression;
}

const fixtureDir = fileURLToPath(new URL('../../Fixtures/Http/', import.meta.url));
const anchor = path.join(fixtureDir, 'controller.ts');
const useMap: Record<string, string> = { AllMiddlewareFixture: './AllMiddlewareFixture.ts' };

const reader = new HttpRouteMiddlewareReader();

describe('HttpRouteMiddlewareReader', () => {
    describe('extractObjectRequestMethods', () => {
        it('returns the request methods from the requestMethods object property', () => {
            expect(
                reader.extractObjectRequestMethods(objectLiteral("{ requestMethods: ['GET', 'POST'] }"), useMap, anchor, 'C'),
            ).toEqual(['GET', 'POST']);
        });

        it('returns empty when the requestMethods property is missing or not an array', () => {
            expect(reader.extractObjectRequestMethods(objectLiteral('{}'), useMap, anchor, 'C')).toEqual([]);
            expect(
                reader.extractObjectRequestMethods(objectLiteral("{ requestMethods: 'x' }"), useMap, anchor, 'C'),
            ).toEqual([]);
        });
    });

    describe('updateRequestMethods', () => {
        it('collects @RequestMethod arguments', () => {
            const m = method("@RequestMethod('M::GET', 'M::POST') m() {}");

            expect(reader.updateRequestMethods([], m, useMap, anchor, 'C')).toEqual(['M::GET', 'M::POST']);
        });

        it('defaults to HEAD and GET when no request methods are present', () => {
            expect(reader.updateRequestMethods([], method('m() {}'), useMap, anchor, 'C')).toEqual([
                'Valkyrja\\Http\\Message\\Enum\\RequestMethod::HEAD',
                'Valkyrja\\Http\\Message\\Enum\\RequestMethod::GET',
            ]);
        });

        it('ignores non-string @RequestMethod arguments', () => {
            expect(reader.updateRequestMethods([], method('@RequestMethod(123) m() {}'), useMap, anchor, 'C')).toEqual([
                'Valkyrja\\Http\\Message\\Enum\\RequestMethod::HEAD',
                'Valkyrja\\Http\\Message\\Enum\\RequestMethod::GET',
            ]);
        });
    });

    describe('updateMiddleware', () => {
        it('classifies the object middleware list and method @Middleware decorators, appending each', () => {
            const m = method('@Middleware(() => AllMiddlewareFixture) @Middleware() m() {}');

            // The list contributes one entry, the method decorator another (append, never dedupe).
            const result = reader.updateMiddleware(m, useMap, anchor, 'C', ['AllMiddlewareFixture']);

            expect(result).toEqual([
                ['AllMiddlewareFixture', 'AllMiddlewareFixture'],
                ['AllMiddlewareFixture', 'AllMiddlewareFixture'],
                ['AllMiddlewareFixture', 'AllMiddlewareFixture'],
                ['AllMiddlewareFixture', 'AllMiddlewareFixture'],
                ['AllMiddlewareFixture', 'AllMiddlewareFixture'],
            ]);
        });

        it('skips an unresolvable middleware class from the list', () => {
            expect(reader.updateMiddleware(method('m() {}'), useMap, anchor, 'C', ['Unknown'])).toEqual([
                [],
                [],
                [],
                [],
                [],
            ]);
        });
    });

    describe('struct decorators', () => {
        it('reads request and response struct values', () => {
            const m = method("@RequestStruct('Req') @ResponseStruct('Res') m() {}");

            expect(reader.updateRequestStruct(m, useMap, anchor, 'C')).toBe('Req');
            expect(reader.updateResponseStruct(m, useMap, anchor, 'C')).toBe('Res');
        });

        it('returns null when no struct decorators are present', () => {
            const m = method('m() {}');

            expect(reader.updateRequestStruct(m, useMap, anchor, 'C')).toBeNull();
            expect(reader.updateResponseStruct(m, useMap, anchor, 'C')).toBeNull();
        });

        it('returns null when the struct decorator argument is not a string', () => {
            const m = method('@RequestStruct(123) @ResponseStruct(123) m() {}');

            expect(reader.updateRequestStruct(m, useMap, anchor, 'C')).toBeNull();
            expect(reader.updateResponseStruct(m, useMap, anchor, 'C')).toBeNull();
        });
    });

    describe('AST builders', () => {
        it('builds middleware and struct argument expressions', () => {
            const withStructs = new HttpRouteData('/p', 'p', null, [], ['A'], ['B'], ['C'], ['D'], ['E'], 'Req', 'Res');
            const withoutStructs = new HttpRouteData('/p', 'p');

            expect(reader.buildRouteMiddlewareArgs(withStructs)).toHaveLength(5);
            expect(reader.buildRouteStructArgs(withStructs)).toHaveLength(2);
            expect(reader.buildRouteStructArgs(withoutStructs)).toHaveLength(2);
        });
    });
});
