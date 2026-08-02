/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Project, SourceFile, ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { HttpParameterData } from '../../../../src/Sindri/Ast/Data/HttpParameterData.ts';
import { HttpRouteParameterReader } from '../../../../src/Sindri/Ast/HttpRouteParameterReader.ts';

function sourceFile(code: string): SourceFile {
    return new Project({ useInMemoryFileSystem: true }).createSourceFile('f.ts', code);
}

/** Compiler object-literal node for `const __x = <code>;`. */
function objectLiteral(code: string): ts.ObjectLiteralExpression {
    return sourceFile(`const __x = ${code};`).getVariableDeclarationOrThrow('__x').getInitializerOrThrow()
        .compilerNode as ts.ObjectLiteralExpression;
}

class TestHttpRouteParameterReader extends HttpRouteParameterReader {
    public buildOne(data: HttpParameterData): ts.NewExpression {
        return this.buildParameterExpr(data) as ts.NewExpression;
    }
}

const reader = new HttpRouteParameterReader();

describe('HttpRouteParameterReader', () => {
    describe('updateParameters', () => {
        it('returns no parameters when the parameters prop is missing or not an array', () => {
            expect(reader.updateParameters(objectLiteral("{ path: '/p' }"), {}, '', 'C')).toEqual([]);
            expect(reader.updateParameters(objectLiteral("{ parameters: 'nope' }"), {}, '', 'C')).toEqual([]);
        });

        it('builds parameters from object literals, skipping non-object elements', () => {
            const obj = objectLiteral(
                "{ parameters: [42, { name: 'id', regex: '\\\\d+', cast: 'int', isOptional: true, shouldCapture: false }] }",
            );

            expect(reader.updateParameters(obj, {}, '', 'C')).toEqual([
                new HttpParameterData('id', '\\d+', 'int', true, false, null),
            ]);
        });

        it('applies defaults when optional props are omitted', () => {
            const obj = objectLiteral("{ parameters: [{ name: 'id', regex: '\\\\d+' }] }");

            expect(reader.updateParameters(obj, {}, '', 'C')).toEqual([
                new HttpParameterData('id', '\\d+', null, false, true, null),
            ]);
        });

        it('drops object parameters with an empty or non-string name or regex', () => {
            const obj = objectLiteral("{ parameters: [{ name: '', regex: '' }, { name: 1, regex: '\\\\d+' }] }");

            expect(reader.updateParameters(obj, {}, '', 'C')).toEqual([]);
        });

        it('reads string, number and boolean default values, ignoring non-scalar defaults', () => {
            const obj = objectLiteral(
                "{ parameters: [{ name: 's', regex: '.', default: 'x' }, { name: 'n', regex: '.', default: 5 }, { name: 'b', regex: '.', default: true }, { name: 'z', regex: '.', default: {} }] }",
            );

            expect(reader.updateParameters(obj, {}, '', 'C')).toEqual([
                new HttpParameterData('s', '.', null, false, true, 'x'),
                new HttpParameterData('n', '.', null, false, true, 5),
                new HttpParameterData('b', '.', null, false, true, true),
                new HttpParameterData('z', '.', null, false, true, null),
            ]);
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

    describe('buildParameterExpr', () => {
        it('omits the default argument when none is set and appends it otherwise', () => {
            const builder = new TestHttpRouteParameterReader();

            expect(builder.buildOne(new HttpParameterData('id', '\\d+')).arguments).toHaveLength(5);
            expect(builder.buildOne(new HttpParameterData('id', '\\d+', null, false, true, 'x')).arguments).toHaveLength(
                6,
            );
            expect(builder.buildOne(new HttpParameterData('id', '\\d+', null, false, true, 7)).arguments).toHaveLength(6);
            expect(
                builder.buildOne(new HttpParameterData('id', '\\d+', null, false, true, true)).arguments,
            ).toHaveLength(6);
        });
    });
});
