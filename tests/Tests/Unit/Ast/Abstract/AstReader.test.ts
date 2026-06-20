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

import { ClassDeclaration, Decorator, MethodDeclaration, Project, SourceFile, ts } from 'ts-morph';

import { describe, expect, it } from 'vitest';

import { AstReader } from '../../../../../src/Sindri/Ast/Abstract/AstReader.ts';
import { HandlerData } from '../../../../../src/Sindri/Ast/Data/HandlerData.ts';
import { AstFileReadException } from '../../../../../src/Sindri/Ast/Throwable/Exception/AstFileReadException.ts';

/**
 * Concrete subclass exposing every protected helper of {@see AstReader}.
 */
class TestAstReader extends AstReader {
    public parseFileToSourceFile = (f: string): SourceFile => super.parseFileToSourceFile(f);
    public buildUseMap = (s: SourceFile): Record<string, string> => super.buildUseMap(s);
    public findClass = (s: SourceFile): ClassDeclaration | undefined => super.findClass(s);
    public indexMethods = (c: ClassDeclaration): Record<string, MethodDeclaration> => super.indexMethods(c);
    public resolveImportToFilePath = (n: string, u: Record<string, string>, f: string): string =>
        super.resolveImportToFilePath(n, u, f);
    public extractClassListFromValues = (
        m: MethodDeclaration | undefined,
        u: Record<string, string>,
        f: string,
    ): string[] => super.extractClassListFromValues(m, u, f);
    public extractClassListFromKeys = (
        m: MethodDeclaration | undefined,
        u: Record<string, string>,
        f: string,
    ): string[] => super.extractClassListFromKeys(m, u, f);
    public findReturnedArray = (m: MethodDeclaration): ts.ArrayLiteralExpression | undefined =>
        super.findReturnedArray(m);
    public findReturnedObject = (m: MethodDeclaration): ts.ObjectLiteralExpression | undefined =>
        super.findReturnedObject(m);
    public newExprToClassName = (n: ts.Node, u: Record<string, string>, f: string): string | undefined =>
        super.newExprToClassName(n, u, f);
    public classNameFromNode = (n: ts.Node, u: Record<string, string>, f: string): string | undefined =>
        super.classNameFromNode(n, u, f);
    public resolvePropertyKeyToString = (
        k: ts.PropertyName,
        u: Record<string, string>,
        f: string,
    ): string | undefined => super.resolvePropertyKeyToString(k, u, f);
    public resolveNodeToString = (n: ts.Expression, u: Record<string, string>, f: string): string | undefined =>
        super.resolveNodeToString(n, u, f);
    public resolveStaticProperty = (
        c: string,
        p: string | undefined,
        u: Record<string, string>,
        f: string,
    ): string | undefined => super.resolveStaticProperty(c, p, u, f);
    public resolveClassToFilePath = (n: string, u: Record<string, string>, f: string): string =>
        super.resolveClassToFilePath(n, u, f);
    public extractExprValue = (n: ts.Node | undefined, u: Record<string, string>, f: string, c: string = ''): unknown =>
        super.extractExprValue(n, u, f, c);
    public extractHandlerFromTsArray = (
        a: ts.ArrayLiteralExpression,
        u: Record<string, string>,
        f: string,
    ): HandlerData | undefined => super.extractHandlerFromTsArray(a, u, f);
    public parseClassFile = (f: string): unknown => super.parseClassFile(f);
    public extractStringArg = (
        d: Decorator,
        p: number,
        u: Record<string, string>,
        f: string,
        c: string,
        def?: string,
    ): string => super.extractStringArg(d, p, u, f, c, def);
    public extractBoolArg = (
        d: Decorator,
        p: number,
        u: Record<string, string>,
        f: string,
        c: string,
        def?: boolean,
    ): boolean => super.extractBoolArg(d, p, u, f, c, def);
    public extractClassListArgFromDecorator = (
        d: Decorator,
        p: number,
        u: Record<string, string>,
        f: string,
        c: string,
    ): string[] => super.extractClassListArgFromDecorator(d, p, u, f, c);
    public extractStringListArgFromDecorator = (
        d: Decorator,
        p: number,
        u: Record<string, string>,
        f: string,
        c: string,
    ): string[] => super.extractStringListArgFromDecorator(d, p, u, f, c);
    public buildStringExpr = (v: string): ts.StringLiteral => super.buildStringExpr(v);
    public buildClassConstExpr = (s: string): ts.StringLiteral => super.buildClassConstExpr(s);
    public buildHandlerExpr = (h: HandlerData): ts.PropertyAccessExpression => super.buildHandlerExpr(h);
    public buildClassArrayExpr = (c: readonly string[]): ts.ArrayLiteralExpression => super.buildClassArrayExpr(c);
    public buildNewExpr = (n: string, a: ts.Expression[]): ts.NewExpression => super.buildNewExpr(n, a);
    public buildBoolExpr = (v: boolean): ts.BooleanLiteral => super.buildBoolExpr(v);
    public buildStringArrayExpr = (v: readonly string[]): ts.ArrayLiteralExpression => super.buildStringArrayExpr(v);
    public buildNullExpr = (): ts.NullLiteral => super.buildNullExpr();
    public buildClassIdentifierArrayExpr = (c: readonly string[]): ts.ArrayLiteralExpression =>
        super.buildClassIdentifierArrayExpr(c);
    public classImplementsInterface = (c: string, i: string, u: Record<string, string>, f: string): boolean =>
        super.classImplementsInterface(c, i, u, f);
}

const fixtureDir = fileURLToPath(new URL('../../../Classes/Ast/', import.meta.url));
const anchor = path.join(fixtureDir, 'anchor.ts');
const useMap: Record<string, string> = {
    StaticHolder: './StaticHolder.ts',
    Implementor: './Implementor.ts',
    Empty: './EmptyModule.ts',
    Missing: './DoesNotExist.ts',
    Bare: 'node:fs',
};

const reader = new TestAstReader();

/** Build an in-memory ts-morph source file. */
function sourceFile(code: string): SourceFile {
    return new Project({ useInMemoryFileSystem: true }).createSourceFile('f.ts', code);
}

/** Compiler node of the initializer of `const __x = <code>;`. */
function expr(code: string): ts.Node {
    return sourceFile(`const __x = ${code};`).getVariableDeclarationOrThrow('__x').getInitializerOrThrow().compilerNode;
}

/** A method declaration from a class body. */
function method(body: string, name = 'm'): MethodDeclaration {
    return sourceFile(`class C { ${body} }`).getClassOrThrow('C').getMethodOrThrow(name);
}

/** The first decorator on a decorated class. */
function decorator(decoratorSrc: string): Decorator {
    return sourceFile(`${decoratorSrc} class C {}`).getClassOrThrow('C').getDecorators()[0];
}

describe('AstReader', () => {
    describe('parseFileToSourceFile', () => {
        it('parses an existing file', () => {
            expect(reader.parseFileToSourceFile(path.join(fixtureDir, 'StaticHolder.ts'))).toBeDefined();
        });

        it('throws when the file does not exist', () => {
            expect(() => reader.parseFileToSourceFile(path.join(fixtureDir, 'nope.ts'))).toThrow(AstFileReadException);
        });
    });

    describe('buildUseMap', () => {
        it('maps named, aliased, default and namespace imports', () => {
            const sf = sourceFile(
                "import Default from './d.ts';\n" +
                    "import * as ns from './n.ts';\n" +
                    "import { Named, Other as Alias } from './o.ts';\n",
            );

            expect(reader.buildUseMap(sf)).toEqual({
                Default: './d.ts',
                ns: './n.ts',
                Named: './o.ts',
                Alias: './o.ts',
            });
        });
    });

    describe('findClass / indexMethods', () => {
        it('returns the first class and indexes its methods', () => {
            const sf = sourceFile('class C { a() {} b() {} }');
            const cls = reader.findClass(sf)!;

            expect(cls).toBeDefined();
            expect(Object.keys(reader.indexMethods(cls))).toEqual(['a', 'b']);
        });

        it('returns undefined when there is no class', () => {
            expect(reader.findClass(sourceFile('export const x = 1;'))).toBeUndefined();
        });
    });

    describe('resolveImportToFilePath', () => {
        it('returns empty when the name is not imported', () => {
            expect(reader.resolveImportToFilePath('Unknown', useMap, anchor)).toBe('');
        });

        it('returns empty for a non-relative module specifier', () => {
            expect(reader.resolveImportToFilePath('Bare', useMap, anchor)).toBe('');
        });

        it('resolves a relative specifier to an existing file', () => {
            expect(reader.resolveImportToFilePath('StaticHolder', useMap, anchor)).toBe(
                path.join(fixtureDir, 'StaticHolder.ts'),
            );
        });

        it('returns empty when the resolved file does not exist', () => {
            expect(reader.resolveImportToFilePath('Missing', useMap, anchor)).toBe('');
        });
    });

    describe('extractClassListFromValues', () => {
        it('returns empty for an undefined method', () => {
            expect(reader.extractClassListFromValues(undefined, useMap, anchor)).toEqual([]);
        });

        it('returns empty when the method does not return an array', () => {
            expect(reader.extractClassListFromValues(method('m() { return 1; }'), useMap, anchor)).toEqual([]);
        });

        it('extracts new-expression and identifier class names, skipping scalars', () => {
            expect(
                reader.extractClassListFromValues(method('m() { return [new A(), B, 5]; }'), useMap, anchor),
            ).toEqual(['A', 'B']);
        });
    });

    describe('extractClassListFromKeys', () => {
        it('returns empty for an undefined method', () => {
            expect(reader.extractClassListFromKeys(undefined, useMap, anchor)).toEqual([]);
        });

        it('returns empty when the method does not return an object', () => {
            expect(reader.extractClassListFromKeys(method('m() { return 1; }'), useMap, anchor)).toEqual([]);
        });

        it('collects string and identifier keys, skipping spreads and unresolved computed keys', () => {
            const m = method("m() { return { 'svc.id': 1, plainKey: 2, [Bare.X]: 3, ...rest }; }");

            expect(reader.extractClassListFromKeys(m, useMap, anchor)).toEqual(['svc.id', 'plainKey']);
        });
    });

    describe('findReturnedArray / findReturnedObject', () => {
        it('returns undefined when the method has no body', () => {
            const m = sourceFile('abstract class C { abstract m(): void; }').getClassOrThrow('C').getMethodOrThrow('m');

            expect(reader.findReturnedArray(m)).toBeUndefined();
            expect(reader.findReturnedObject(m)).toBeUndefined();
        });

        it('returns undefined when the method returns no matching literal', () => {
            expect(reader.findReturnedArray(method('m() { const x = 1; }'))).toBeUndefined();
            expect(reader.findReturnedObject(method('m() { return 1; }'))).toBeUndefined();
        });

        it('finds the returned array and object literals', () => {
            expect(reader.findReturnedArray(method('m() { return [1]; }'))).toBeDefined();
            expect(reader.findReturnedObject(method('m() { return { a: 1 }; }'))).toBeDefined();
        });
    });

    describe('newExprToClassName / classNameFromNode', () => {
        it('resolves identifier and property-access new expressions', () => {
            expect(reader.newExprToClassName(expr('new A()'), useMap, anchor)).toBe('A');
            expect(reader.newExprToClassName(expr('new ns.Foo()'), useMap, anchor)).toBe('ns.Foo');
        });

        it('returns undefined for a non-new node', () => {
            expect(reader.newExprToClassName(expr('1'), useMap, anchor)).toBeUndefined();
        });

        it('resolves identifier nodes and rejects non-identifiers', () => {
            expect(reader.classNameFromNode(expr('A'), useMap, anchor)).toBe('A');
            expect(reader.classNameFromNode(expr('1'), useMap, anchor)).toBeUndefined();
        });
    });

    describe('resolvePropertyKeyToString', () => {
        const keyOf = (objectCode: string): ts.PropertyName =>
            (expr(objectCode) as ts.ObjectLiteralExpression).properties[0].name as ts.PropertyName;

        it('resolves string-literal, identifier and computed keys', () => {
            expect(reader.resolvePropertyKeyToString(keyOf("{ 'a': 1 }"), useMap, anchor)).toBe('a');
            expect(reader.resolvePropertyKeyToString(keyOf('{ ident: 1 }'), useMap, anchor)).toBe('ident');
            expect(reader.resolvePropertyKeyToString(keyOf('{ [Bare.X]: 1 }'), useMap, anchor)).toBeUndefined();
        });

        it('returns undefined for an unsupported key', () => {
            expect(reader.resolvePropertyKeyToString(keyOf('{ 5: 1 }'), useMap, anchor)).toBeUndefined();
        });
    });

    describe('resolveNodeToString', () => {
        it('resolves string literals', () => {
            expect(reader.resolveNodeToString(expr("'lit'") as ts.Expression, useMap, anchor)).toBe('lit');
        });

        it('resolves a static property access', () => {
            expect(reader.resolveNodeToString(expr('StaticHolder.NAME') as ts.Expression, useMap, anchor)).toBe(
                'svc.name',
            );
        });

        it('returns undefined for a bare identifier without a property', () => {
            expect(reader.resolveNodeToString(expr('SomeId') as ts.Expression, useMap, anchor)).toBeUndefined();
        });

        it('returns undefined for a nested property access', () => {
            expect(reader.resolveNodeToString(expr('a.b.c') as ts.Expression, useMap, anchor)).toBeUndefined();
        });

        it('returns undefined for unsupported nodes', () => {
            expect(reader.resolveNodeToString(expr('1') as ts.Expression, useMap, anchor)).toBeUndefined();
        });
    });

    describe('resolveStaticProperty', () => {
        it('returns the static string property value', () => {
            expect(reader.resolveStaticProperty('StaticHolder', 'NAME', useMap, anchor)).toBe('svc.name');
        });

        it('returns undefined when the import cannot be resolved', () => {
            expect(reader.resolveStaticProperty('Missing', 'NAME', useMap, anchor)).toBeUndefined();
        });

        it('returns undefined when the property name is undefined', () => {
            expect(reader.resolveStaticProperty('StaticHolder', undefined, useMap, anchor)).toBeUndefined();
        });

        it('returns undefined when the class is not found in the file', () => {
            expect(reader.resolveStaticProperty('Empty', 'NAME', useMap, anchor)).toBeUndefined();
        });

        it('returns undefined when the property is missing', () => {
            expect(reader.resolveStaticProperty('StaticHolder', 'GONE', useMap, anchor)).toBeUndefined();
        });

        it('returns undefined when the property is not a string literal', () => {
            expect(reader.resolveStaticProperty('StaticHolder', 'NUM', useMap, anchor)).toBeUndefined();
        });
    });

    describe('resolveClassToFilePath', () => {
        it('delegates to resolveImportToFilePath', () => {
            expect(reader.resolveClassToFilePath('StaticHolder', useMap, anchor)).toBe(
                path.join(fixtureDir, 'StaticHolder.ts'),
            );
        });
    });

    describe('extractExprValue', () => {
        it('returns undefined for an undefined node', () => {
            expect(reader.extractExprValue(undefined, useMap, anchor)).toBeUndefined();
        });

        it('reads scalar literals', () => {
            expect(reader.extractExprValue(expr("'s'"), useMap, anchor)).toBe('s');
            expect(reader.extractExprValue(expr('42'), useMap, anchor)).toBe(42);
            expect(reader.extractExprValue(expr('true'), useMap, anchor)).toBe(true);
            expect(reader.extractExprValue(expr('false'), useMap, anchor)).toBe(false);
            expect(reader.extractExprValue(expr('null'), useMap, anchor)).toBeNull();
        });

        it('reads negative numbers and rejects other unary expressions', () => {
            expect(reader.extractExprValue(expr('-7'), useMap, anchor)).toBe(-7);
            expect(reader.extractExprValue(expr('-x'), useMap, anchor)).toBeUndefined();
        });

        it('reads identifiers as keywords or class names', () => {
            expect(reader.extractExprValue(expr('SomeClass'), useMap, anchor)).toBe('SomeClass');
        });

        it('resolves property access to a static value or ClassName::prop', () => {
            expect(reader.extractExprValue(expr('StaticHolder.NAME'), useMap, anchor)).toBe('svc.name');
            expect(reader.extractExprValue(expr('Unresolved.PROP'), useMap, anchor)).toBe('Unresolved::PROP');
        });

        it('returns undefined for a nested property access', () => {
            expect(reader.extractExprValue(expr('a.b.c'), useMap, anchor)).toBeUndefined();
        });

        it('reads a two-element array as a HandlerData', () => {
            const value = reader.extractExprValue(expr("[A, 'method']"), useMap, anchor);

            expect(value).toBeInstanceOf(HandlerData);
        });

        it('returns undefined for an unsupported node', () => {
            expect(reader.extractExprValue(expr('{ a: 1 }'), useMap, anchor)).toBeUndefined();
        });
    });

    describe('extractHandlerFromTsArray', () => {
        const arr = (code: string): ts.ArrayLiteralExpression => expr(code) as ts.ArrayLiteralExpression;

        it('builds a HandlerData from a class/method pair', () => {
            expect(reader.extractHandlerFromTsArray(arr("[A, 'm']"), useMap, anchor)).toEqual(
                new HandlerData('A', 'm'),
            );
        });

        it('returns undefined when the array is not a pair', () => {
            expect(reader.extractHandlerFromTsArray(arr('[A]'), useMap, anchor)).toBeUndefined();
        });

        it('returns undefined when the class value is not a string', () => {
            expect(reader.extractHandlerFromTsArray(arr("[1, 'm']"), useMap, anchor)).toBeUndefined();
        });

        it('returns undefined when the method value is not a string', () => {
            expect(reader.extractHandlerFromTsArray(arr('[A, 1]'), useMap, anchor)).toBeUndefined();
        });
    });

    describe('parseClassFile', () => {
        it('parses a class file', () => {
            expect(reader.parseClassFile(path.join(fixtureDir, 'StaticHolder.ts'))).toBeDefined();
        });

        it('returns undefined when there is no class', () => {
            expect(reader.parseClassFile(path.join(fixtureDir, 'EmptyModule.ts'))).toBeUndefined();
        });
    });

    describe('decorator argument extraction', () => {
        const dec = decorator("@Foo('hello', true, ['A', 'B'], ['a', 'b', 5])");

        it('extracts string and bool args with defaults', () => {
            expect(reader.extractStringArg(dec, 0, useMap, anchor, 'C')).toBe('hello');
            expect(reader.extractStringArg(dec, 9, useMap, anchor, 'C', 'def')).toBe('def');
            expect(reader.extractBoolArg(dec, 1, useMap, anchor, 'C')).toBe(true);
            expect(reader.extractBoolArg(dec, 9, useMap, anchor, 'C', true)).toBe(true);
        });

        it('extracts class and string list args', () => {
            expect(reader.extractClassListArgFromDecorator(dec, 2, useMap, anchor, 'C')).toEqual(['A', 'B']);
            expect(reader.extractStringListArgFromDecorator(dec, 3, useMap, anchor, 'C')).toEqual(['a', 'b']);
        });

        it('returns empty for missing or non-array args', () => {
            expect(reader.extractClassListArgFromDecorator(dec, 9, useMap, anchor, 'C')).toEqual([]);
            expect(reader.extractClassListArgFromDecorator(dec, 0, useMap, anchor, 'C')).toEqual([]);
            expect(reader.extractStringListArgFromDecorator(dec, 9, useMap, anchor, 'C')).toEqual([]);
            expect(reader.extractStringListArgFromDecorator(dec, 0, useMap, anchor, 'C')).toEqual([]);
        });
    });

    describe('AST-building helpers', () => {
        it('builds expression nodes', () => {
            expect(ts.isStringLiteral(reader.buildStringExpr('s'))).toBe(true);
            expect(ts.isStringLiteral(reader.buildClassConstExpr('id'))).toBe(true);
            expect(ts.isPropertyAccessExpression(reader.buildHandlerExpr(new HandlerData('A\\B', 'm')))).toBe(true);
            expect(ts.isArrayLiteralExpression(reader.buildClassArrayExpr(['A']))).toBe(true);
            expect(ts.isNewExpression(reader.buildNewExpr('A\\B', []))).toBe(true);
            expect(reader.buildBoolExpr(true).kind).toBe(ts.SyntaxKind.TrueKeyword);
            expect(reader.buildBoolExpr(false).kind).toBe(ts.SyntaxKind.FalseKeyword);
            expect(ts.isArrayLiteralExpression(reader.buildStringArrayExpr(['a']))).toBe(true);
            expect(reader.buildNullExpr().kind).toBe(ts.SyntaxKind.NullKeyword);
            expect(ts.isArrayLiteralExpression(reader.buildClassIdentifierArrayExpr(['A\\B']))).toBe(true);
        });
    });

    describe('classImplementsInterface', () => {
        it('returns true when the class implements the interface', () => {
            expect(reader.classImplementsInterface('Implementor', 'FooContract', useMap, anchor)).toBe(true);
        });

        it('returns false when the interface is not implemented', () => {
            expect(reader.classImplementsInterface('Implementor', 'Other', useMap, anchor)).toBe(false);
        });

        it('returns false when the file cannot be resolved', () => {
            expect(reader.classImplementsInterface('Missing', 'FooContract', useMap, anchor)).toBe(false);
        });

        it('returns false when the class is not found', () => {
            expect(reader.classImplementsInterface('Empty', 'FooContract', useMap, anchor)).toBe(false);
        });
    });

    describe('branch edge cases', () => {
        it('returns undefined when the static member is not a property declaration', () => {
            // GETTER is a static get accessor, not a PropertyDeclaration.
            expect(reader.resolveStaticProperty('StaticHolder', 'GETTER', useMap, anchor)).toBeUndefined();
        });

        it('resolves identifier nodes whose text is a literal keyword', () => {
            expect(reader.extractExprValue(ts.factory.createIdentifier('null'), useMap, anchor)).toBeNull();
            expect(reader.extractExprValue(ts.factory.createIdentifier('true'), useMap, anchor)).toBe(true);
            expect(reader.extractExprValue(ts.factory.createIdentifier('false'), useMap, anchor)).toBe(false);
        });

        it('skips non-string elements when extracting a class list from a decorator array', () => {
            const dec = decorator("@Foo([1, 'A'])");

            expect(reader.extractClassListArgFromDecorator(dec, 0, useMap, anchor, 'C')).toEqual(['A']);
        });

        it('falls back to an empty current class for an anonymous class', () => {
            const context = reader.parseClassFile(path.join(fixtureDir, 'AnonymousClass.ts')) as
                | { currentClass: string }
                | undefined;

            expect(context?.currentClass).toBe('');
        });
    });
});
