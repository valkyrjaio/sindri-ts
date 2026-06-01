/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';
import * as path from 'path';

import ts from 'typescript';
import {
    ClassDeclaration,
    Decorator,
    MethodDeclaration,
    Node,
    ParameterDeclaration,
    Project,
    SourceFile,
    SyntaxKind,
} from 'ts-morph';

import { AstFileReadException } from '../Throwable/Exception/AstFileReadException.js';
import { HandlerData } from '../Data/HandlerData.js';

/**
 * Shared AST parsing utilities for all provider reader implementations.
 *
 * Uses ts-morph for high-level class/method/decorator discovery and the
 * TypeScript compiler API for fine-grained body traversal.
 *
 * All methods are protected so subclasses can override any step of the pipeline.
 */
export abstract class AstReader {
    protected parseFileToSourceFile(filePath: string): SourceFile {
        if (!fs.existsSync(filePath)) {
            throw new AstFileReadException(`Cannot read file '${filePath}'.`);
        }

        const project = new Project({ addFilesFromTsConfig: false, skipFileDependencyResolution: true });

        return project.addSourceFileAtPath(filePath);
    }

    /**
     * Build a map of alias/short-name → import module specifier from import declarations.
     */
    protected buildUseMap(sourceFile: SourceFile): Record<string, string> {
        const map: Record<string, string> = {};

        for (const importDecl of sourceFile.getImportDeclarations()) {
            const moduleSpecifier = importDecl.getModuleSpecifierValue();

            for (const namedImport of importDecl.getNamedImports()) {
                const alias = namedImport.getAliasNode()?.getText() ?? namedImport.getName();
                map[alias] = moduleSpecifier;
            }

            const defaultImport = importDecl.getDefaultImport();

            if (defaultImport !== undefined) {
                map[defaultImport.getText()] = moduleSpecifier;
            }

            const namespaceImport = importDecl.getNamespaceImport();

            if (namespaceImport !== undefined) {
                map[namespaceImport.getText()] = moduleSpecifier;
            }
        }

        return map;
    }

    protected findClass(sourceFile: SourceFile): ClassDeclaration | undefined {
        return sourceFile.getClasses()[0];
    }

    protected indexMethods(classDecl: ClassDeclaration): Record<string, MethodDeclaration> {
        const index: Record<string, MethodDeclaration> = {};

        for (const method of classDecl.getMethods()) {
            index[method.getName()] = method;
        }

        return index;
    }

    /**
     * Resolve the file path for an imported class name using the use map and current file directory.
     */
    protected resolveImportToFilePath(
        name: string,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string {
        const moduleSpecifier = useMap[name];

        if (moduleSpecifier === undefined) {
            return '';
        }

        if (!moduleSpecifier.startsWith('.')) {
            return '';
        }

        const dir = path.dirname(currentFilePath);
        const resolved = path.resolve(dir, moduleSpecifier.replace(/\.js$/, '.ts'));

        return fs.existsSync(resolved) ? resolved : '';
    }

    /**
     * Extract class names from a method returning [new A(), new B(), ...].
     */
    protected extractClassListFromValues(
        method: MethodDeclaration | undefined,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string[] {
        if (method === undefined) {
            return [];
        }

        const array = this.findReturnedArray(method);

        if (array === undefined) {
            return [];
        }

        const classes: string[] = [];

        for (const element of array.elements) {
            const resolved =
                this.newExprToClassName(element, useMap, currentFilePath) ??
                this.classNameFromNode(element, useMap, currentFilePath);

            if (resolved !== undefined) {
                classes.push(resolved);
            }
        }

        return classes;
    }

    /**
     * Extract service ID strings from keys of an object-returning method.
     *
     * Used for publishers() where keys are service IDs (strings or computed references).
     */
    protected extractClassListFromKeys(
        method: MethodDeclaration | undefined,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string[] {
        if (method === undefined) {
            return [];
        }

        const obj = this.findReturnedObject(method);

        if (obj === undefined) {
            return [];
        }

        const classes: string[] = [];

        for (const prop of obj.properties) {
            if (!ts.isPropertyAssignment(prop) && !ts.isShorthandPropertyAssignment(prop)) {
                continue;
            }

            const resolved = this.resolvePropertyKeyToString(prop.name, useMap, currentFilePath);

            if (resolved !== undefined) {
                classes.push(resolved);
            }
        }

        return classes;
    }

    /**
     * Find the first returned ArrayLiteralExpression in a method's body.
     */
    protected findReturnedArray(method: MethodDeclaration): ts.ArrayLiteralExpression | undefined {
        const body = method.compilerNode.body;

        if (body === undefined) {
            return undefined;
        }

        for (const stmt of body.statements) {
            if (ts.isReturnStatement(stmt) && stmt.expression !== undefined && ts.isArrayLiteralExpression(stmt.expression)) {
                return stmt.expression;
            }
        }

        return undefined;
    }

    /**
     * Find the first returned ObjectLiteralExpression in a method's body.
     */
    protected findReturnedObject(method: MethodDeclaration): ts.ObjectLiteralExpression | undefined {
        const body = method.compilerNode.body;

        if (body === undefined) {
            return undefined;
        }

        for (const stmt of body.statements) {
            if (ts.isReturnStatement(stmt) && stmt.expression !== undefined && ts.isObjectLiteralExpression(stmt.expression)) {
                return stmt.expression;
            }
        }

        return undefined;
    }

    /**
     * Extract a class name from a NewExpression TS compiler node.
     */
    protected newExprToClassName(
        node: ts.Node,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string | undefined {
        if (!ts.isNewExpression(node)) {
            return undefined;
        }

        const name = ts.isIdentifier(node.expression) ? node.expression.text : node.expression.getText();

        return this.resolveClassName(name, useMap, currentFilePath);
    }

    /**
     * Extract a class name from a general TS compiler node (identifier).
     */
    protected classNameFromNode(
        node: ts.Node,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string | undefined {
        if (ts.isIdentifier(node)) {
            return this.resolveClassName(node.text, useMap, currentFilePath);
        }

        return undefined;
    }

    /**
     * Resolve a property key node to a string value.
     *
     * Handles: string literals, identifiers, computed properties [SomeId.Constant].
     */
    protected resolvePropertyKeyToString(
        keyNode: ts.PropertyName,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string | undefined {
        if (ts.isStringLiteral(keyNode)) {
            return keyNode.text;
        }

        if (ts.isIdentifier(keyNode)) {
            return keyNode.text;
        }

        if (ts.isComputedPropertyName(keyNode)) {
            return this.resolveNodeToString(keyNode.expression, useMap, currentFilePath);
        }

        return undefined;
    }

    /**
     * Attempt to resolve a TS node to a string value.
     *
     * Handles: string literals, identifiers, property accesses like ServiceId.Constant.
     */
    protected resolveNodeToString(
        node: ts.Expression,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string | undefined {
        if (ts.isStringLiteral(node)) {
            return node.text;
        }

        if (ts.isIdentifier(node)) {
            return this.resolveStaticProperty(node.text, undefined, useMap, currentFilePath);
        }

        if (ts.isPropertyAccessExpression(node)) {
            const objName = ts.isIdentifier(node.expression) ? node.expression.text : undefined;

            if (objName !== undefined) {
                return this.resolveStaticProperty(objName, node.name.text, useMap, currentFilePath);
            }
        }

        return undefined;
    }

    /**
     * Resolve a static property value by reading the imported source file.
     */
    protected resolveStaticProperty(
        className: string,
        propName: string | undefined,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string | undefined {
        const importedFilePath = this.resolveImportToFilePath(className, useMap, currentFilePath);

        if (importedFilePath === '') {
            return undefined;
        }

        try {
            const project = new Project({ addFilesFromTsConfig: false, skipFileDependencyResolution: true });
            const importedSource = project.addSourceFileAtPath(importedFilePath);
            const importedClass = importedSource.getClass(className);

            if (importedClass === undefined || propName === undefined) {
                return undefined;
            }

            const prop = importedClass.getStaticProperty(propName);

            if (prop === undefined) {
                return undefined;
            }

            if (Node.isPropertyDeclaration(prop)) {
                const initializer = prop.getInitializer();

                if (initializer?.isKind(SyntaxKind.StringLiteral) === true) {
                    return (initializer as Node<ts.StringLiteral>).compilerNode.text;
                }
            }
        } catch {
            // Silently skip unresolvable references
        }

        return undefined;
    }

    /**
     * Resolve a short class name — returns the name as-is (class names in TS are local).
     */
    protected resolveClassName(
        name: string,
        useMap: Record<string, string>,
        _currentFilePath: string,
    ): string {
        if (name in useMap) {
            return name;
        }

        return name;
    }

    /**
     * Resolve a class short name to an absolute file path using the use map.
     */
    protected resolveClassToFilePath(
        name: string,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): string {
        return this.resolveImportToFilePath(name, useMap, currentFilePath);
    }

    /**
     * Collect all Decorator nodes on a given node whose name matches decoratorName.
     */
    protected findDecoratorsOnNode(
        node: ClassDeclaration | MethodDeclaration | ParameterDeclaration,
        decoratorName: string,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): Decorator[] {
        return node.getDecorators().filter((d) => {
            const name = d.getName();
            return name === decoratorName || this.resolveClassName(name, useMap, currentFilePath) === decoratorName;
        });
    }

    protected getDecoratorArg(decorator: Decorator, position: number): Node | undefined {
        return decorator.getArguments()[position];
    }

    /**
     * Convert a simple expression node to a scalar value or HandlerData.
     */
    protected extractExprValue(
        node: Node | ts.Node | undefined,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string = '',
    ): string | number | boolean | HandlerData | null | undefined {
        if (node === undefined) {
            return undefined;
        }

        const tsNode = Node.isNode(node) ? (node as Node).compilerNode : (node as ts.Node);

        if (ts.isStringLiteral(tsNode)) {
            return tsNode.text;
        }

        if (ts.isNumericLiteral(tsNode)) {
            return Number(tsNode.text);
        }

        if (tsNode.kind === ts.SyntaxKind.TrueKeyword) {
            return true;
        }

        if (tsNode.kind === ts.SyntaxKind.FalseKeyword) {
            return false;
        }

        if (tsNode.kind === ts.SyntaxKind.NullKeyword) {
            return null;
        }

        if (ts.isPrefixUnaryExpression(tsNode) && tsNode.operator === ts.SyntaxKind.MinusToken) {
            const inner = this.extractExprValue(tsNode.operand, useMap, currentFilePath, currentClass);
            if (typeof inner === 'number') return -inner;
            return undefined;
        }

        if (ts.isIdentifier(tsNode)) {
            const text = tsNode.text;
            if (text === 'null') return null;
            if (text === 'true') return true;
            if (text === 'false') return false;
            return this.resolveClassName(text, useMap, currentFilePath);
        }

        if (ts.isPropertyAccessExpression(tsNode)) {
            const objName = ts.isIdentifier(tsNode.expression) ? tsNode.expression.text : undefined;
            const propName = tsNode.name.text;

            if (objName !== undefined) {
                const resolved = this.resolveStaticProperty(objName, propName, useMap, currentFilePath);
                if (resolved !== undefined) {
                    return resolved;
                }
                const className = this.resolveClassName(objName, useMap, currentFilePath);
                return `${className}::${propName}`;
            }
        }

        if (ts.isArrayLiteralExpression(tsNode)) {
            return this.extractHandlerFromTsArray(tsNode, useMap, currentFilePath, currentClass);
        }

        return undefined;
    }

    protected extractHandlerFromTsArray(
        array: ts.ArrayLiteralExpression,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string = '',
    ): HandlerData | undefined {
        if (array.elements.length !== 2) {
            return undefined;
        }

        const classValue = this.extractExprValue(array.elements[0], useMap, currentFilePath, currentClass);
        const methodValue = this.extractExprValue(array.elements[1], useMap, currentFilePath, currentClass);

        if (typeof classValue !== 'string' || classValue === '') {
            return undefined;
        }

        if (typeof methodValue !== 'string' || methodValue === '') {
            return undefined;
        }

        return new HandlerData(classValue, methodValue);
    }

    protected extractClassListFromArrayExpr(
        array: ts.ArrayLiteralExpression,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string = '',
    ): string[] {
        const classes: string[] = [];

        for (const element of array.elements) {
            const value = this.extractExprValue(element, useMap, currentFilePath, currentClass);

            if (typeof value === 'string' && value !== '') {
                classes.push(value);
            }
        }

        return classes;
    }

    protected parseClassFile(
        filePath: string,
    ):
        | { sourceFile: SourceFile; classDecl: ClassDeclaration; useMap: Record<string, string>; currentClass: string }
        | undefined {
        const sourceFile = this.parseFileToSourceFile(filePath);
        const classDecl = this.findClass(sourceFile);

        if (classDecl === undefined) {
            return undefined;
        }

        const useMap = this.buildUseMap(sourceFile);
        const currentClass = classDecl.getName() ?? '';

        return { sourceFile, classDecl, useMap, currentClass };
    }

    protected extractStringArg(
        decorator: Decorator,
        position: number,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        defaultValue: string = '',
    ): string {
        const node = this.getDecoratorArg(decorator, position);
        const value = this.extractExprValue(node, useMap, currentFilePath, currentClass);
        return typeof value === 'string' ? value : defaultValue;
    }

    protected extractBoolArg(
        decorator: Decorator,
        position: number,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
        defaultValue: boolean = false,
    ): boolean {
        const node = this.getDecoratorArg(decorator, position);
        const value = this.extractExprValue(node, useMap, currentFilePath, currentClass);
        return typeof value === 'boolean' ? value : defaultValue;
    }

    protected extractClassListArgFromDecorator(
        decorator: Decorator,
        position: number,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string[] {
        const node = this.getDecoratorArg(decorator, position);

        if (node === undefined) {
            return [];
        }

        const tsNode = node.compilerNode;

        if (!ts.isArrayLiteralExpression(tsNode)) {
            return [];
        }

        return this.extractClassListFromArrayExpr(tsNode, useMap, currentFilePath, currentClass);
    }

    protected extractStringListArgFromDecorator(
        decorator: Decorator,
        position: number,
        useMap: Record<string, string>,
        currentFilePath: string,
        currentClass: string,
    ): string[] {
        const node = this.getDecoratorArg(decorator, position);

        if (node === undefined) {
            return [];
        }

        const tsNode = node.compilerNode;

        if (!ts.isArrayLiteralExpression(tsNode)) {
            return [];
        }

        const values: string[] = [];

        for (const element of tsNode.elements) {
            const value = this.extractExprValue(element, useMap, currentFilePath, currentClass);
            if (typeof value === 'string') {
                values.push(value);
            }
        }

        return values;
    }

    // -------------------------------------------------------------------------
    // AST-building helpers — produce ts.Expression nodes for code generation
    // -------------------------------------------------------------------------

    protected buildStringExpr(value: string): ts.StringLiteral {
        return ts.factory.createStringLiteral(value);
    }

    protected buildClassConstExpr(serviceId: string): ts.StringLiteral {
        return ts.factory.createStringLiteral(serviceId);
    }

    /**
     * Build an enum/constant case expression from a "ClassName::CASE" string.
     *
     * Produces `ClassName.CASE` property access, or a string literal fallback.
     */
    protected buildEnumCaseExpr(fqnColonCase: string): ts.Expression {
        const pos = fqnColonCase.indexOf('::');

        if (pos === -1) {
            return ts.factory.createStringLiteral(fqnColonCase);
        }

        const fqn = fqnColonCase.substring(0, pos);
        const caseName = fqnColonCase.substring(pos + 2);
        const className = fqn.split('\\').pop() ?? fqn;

        return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(className), caseName);
    }

    /**
     * Build a `ClassName.methodName` property access from a HandlerData.
     */
    protected buildHandlerExpr(handler: HandlerData): ts.PropertyAccessExpression {
        const className = handler.class.split('\\').pop() ?? handler.class;

        return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(className), handler.method);
    }

    protected buildClassArrayExpr(classes: readonly string[]): ts.ArrayLiteralExpression {
        const elements = classes.map((c) => ts.factory.createStringLiteral(c));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected buildNewExpr(className: string, args: ts.Expression[]): ts.NewExpression {
        const shortName = className.split('\\').pop() ?? className;

        return ts.factory.createNewExpression(ts.factory.createIdentifier(shortName), undefined, args);
    }

    protected buildBoolExpr(value: boolean): ts.BooleanLiteral {
        return value ? ts.factory.createTrue() : ts.factory.createFalse();
    }

    protected buildStringArrayExpr(values: readonly string[]): ts.ArrayLiteralExpression {
        const elements = values.map((v) => ts.factory.createStringLiteral(v));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected buildEnumCaseArrayExpr(enumCases: readonly string[]): ts.ArrayLiteralExpression {
        const elements = enumCases.map((c) => this.buildEnumCaseExpr(c));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected buildNullExpr(): ts.NullLiteral {
        return ts.factory.createNull();
    }

    protected buildClassIdentifierArrayExpr(classes: readonly string[]): ts.ArrayLiteralExpression {
        const elements = classes.map((c) => ts.factory.createIdentifier(c.split('\\').pop() ?? c));
        return ts.factory.createArrayLiteralExpression(elements);
    }

    protected classImplementsInterface(
        className: string,
        interfaceName: string,
        useMap: Record<string, string>,
        currentFilePath: string,
    ): boolean {
        const filePath = this.resolveImportToFilePath(className, useMap, currentFilePath);

        if (filePath === '') {
            return false;
        }

        try {
            const project = new Project({ addFilesFromTsConfig: false, skipFileDependencyResolution: true });
            const sourceFile = project.addSourceFileAtPath(filePath);
            const classDecl = sourceFile.getClass(className);

            if (classDecl === undefined) {
                return false;
            }

            for (const impl of classDecl.getImplements()) {
                if (impl.getExpression().getText() === interfaceName) {
                    return true;
                }
            }
        } catch {
            // Silently skip unresolvable
        }

        return false;
    }
}
