/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MethodDeclaration, Project, SourceFile, ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { HttpParameterData } from '../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteParameterReader } from '../../../../src/Sindri/Ast/HttpRouteParameterReader.ts';

function sourceFile(code: string): SourceFile {
    return new Project({ useInMemoryFileSystem: true }).createSourceFile('f.ts', code);
}

function method(body: string, name = 'm'): MethodDeclaration {
    return sourceFile(`class C { ${body} }`).getClassOrThrow('C').getMethodOrThrow(name);
}

/** Compiler expression node for `const __x = <code>;`. */
function expr(code: string): ts.Expression {
    return sourceFile(`const __x = ${code};`).getVariableDeclarationOrThrow('__x').getInitializerOrThrow()
        .compilerNode as ts.Expression;
}

const reader = new HttpRouteParameterReader();
const emptyMethod = method('m() {}');

describe('HttpRouteParameterReader', () => {
    describe('updateParameters - inline parameters', () => {
        it('returns no inline parameters when the third arg is missing or not an array', () => {
            expect(reader.updateParameters([], emptyMethod, {}, '', 'C')).toEqual([]);
            expect(reader.updateParameters([expr("'a'"), expr("'b'"), expr("'c'")], emptyMethod, {}, '', 'C')).toEqual(
                [],
            );
        });

        it('builds parameters from inline new-expressions, skipping non-new elements', () => {
            const args = [
                expr("'path'"),
                expr("'name'"),
                expr("[42, new Parameter('id', '\\\\d+', 'int', true, false)]"),
            ];

            const params = reader.updateParameters(args, emptyMethod, {}, '', 'C');

            expect(params).toEqual([new HttpParameterData('id', '\\d+', 'int', true, false)]);
        });

        it('applies defaults when optional inline args are omitted', () => {
            const args = [expr("'path'"), expr("'name'"), expr("[new Parameter('id', '\\\\d+')]")];

            const params = reader.updateParameters(args, emptyMethod, {}, '', 'C');

            expect(params).toEqual([new HttpParameterData('id', '\\d+', null, false, true)]);
        });

        it('ignores inline new-expressions with missing or invalid name/regex or non-string optionals', () => {
            const args = [
                expr("'path'"),
                expr("'name'"),
                expr("[new Parameter(), new Parameter(1, '\\\\d+'), new Parameter('id', '\\\\d+', 9, 'x', 'y')]"),
            ];

            const params = reader.updateParameters(args, emptyMethod, {}, '', 'C');

            // First two are dropped; the third keeps name/regex with cast/optional/capture defaulted.
            expect(params).toEqual([new HttpParameterData('id', '\\d+', null, false, true)]);
        });
    });

    describe('updateParameters - decorator and method parameters', () => {
        it('reads @Parameter decorators on the method and on its parameters', () => {
            const m = method("@Parameter('attr', '\\\\d+') m(@Parameter('arg', '\\\\w+') id: string) {}");

            const params = reader.updateParameters([], m, {}, '', 'C');

            expect(params).toEqual([
                new HttpParameterData('attr', '\\d+', null, false, true),
                new HttpParameterData('arg', '\\w+', null, false, true),
            ]);
        });

        it('drops decorator parameters with an empty name or regex', () => {
            const m = method("@Parameter('', '') m() {}");

            expect(reader.updateParameters([], m, {}, '', 'C')).toEqual([]);
        });

        it('drops method-parameter decorators with an empty name or regex', () => {
            const m = method("m(@Parameter('', '') id: string) {}");

            expect(reader.updateParameters([], m, {}, '', 'C')).toEqual([]);
        });
    });

    describe('buildParameterListExpr', () => {
        it('builds an array expression with enum-case and plain regex/cast parameters', () => {
            const list = reader.buildParameterListExpr([
                new HttpParameterData('id', 'Regex\\Pattern::NUM', 'Cast\\Type::INT', true, false),
                new HttpParameterData('slug', '[a-z]+', null, false, true),
            ]);

            expect(ts.isArrayLiteralExpression(list)).toBe(true);
            expect(list.elements).toHaveLength(2);
        });
    });
});
