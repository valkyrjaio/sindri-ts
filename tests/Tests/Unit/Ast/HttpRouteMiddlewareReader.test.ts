/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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

function expr(code: string): ts.Expression {
    return sourceFile(`const __x = ${code};`).getVariableDeclarationOrThrow('__x').getInitializerOrThrow()
        .compilerNode as ts.Expression;
}

const fixtureDir = fileURLToPath(new URL('../../Classes/Http/', import.meta.url));
const anchor = path.join(fixtureDir, 'controller.ts');
const useMap: Record<string, string> = { AllMiddleware: './AllMiddleware.ts' };

const reader = new HttpRouteMiddlewareReader();

describe('HttpRouteMiddlewareReader', () => {
    describe('extractInlineRequestMethods', () => {
        it('returns the methods from an inline array argument', () => {
            const args = [expr("'a'"), expr("'b'"), expr("'c'"), expr("['GET', 'POST']")];

            expect(reader.extractInlineRequestMethods(args, useMap, anchor, 'C')).toEqual(['GET', 'POST']);
        });

        it('returns empty when the fourth argument is missing or not an array', () => {
            expect(reader.extractInlineRequestMethods([], useMap, anchor, 'C')).toEqual([]);
            expect(
                reader.extractInlineRequestMethods(
                    [expr("'a'"), expr("'b'"), expr("'c'"), expr("'x'")],
                    useMap,
                    anchor,
                    'C',
                ),
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
    });

    describe('updateMiddleware', () => {
        it('classifies a middleware that implements every contract and skips empty names', () => {
            const m = method('@Middleware(AllMiddleware) @Middleware() m() {}');

            const result = reader.updateMiddleware(m, useMap, anchor, 'C', [], [], [], [], []);

            expect(result).toEqual([
                ['AllMiddleware'],
                ['AllMiddleware'],
                ['AllMiddleware'],
                ['AllMiddleware'],
                ['AllMiddleware'],
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
