/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import * as fs from 'fs';

import { ts } from 'ts-morph';

import { GenerateStatus } from '../Enum/GenerateStatus.ts';

export abstract class AstFileGenerator {
    /** The provider and handler classes the generated file imports. */
    public classImportMap: Record<string, string> = {};

    protected readonly printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    protected readonly dummySourceFile = ts.createSourceFile(
        '_dummy.ts',
        '',
        ts.ScriptTarget.ESNext,
        false,
        ts.ScriptKind.TS,
    );

    /**
     * Build a property access or string literal expression from a "ClassName::CASE" string.
     */
    protected buildEnumCaseExpr(fqnColonCase: string): ts.Expression {
        const pos = fqnColonCase.indexOf('::');

        if (pos === -1) {
            return ts.factory.createStringLiteral(fqnColonCase);
        }

        const fqn = fqnColonCase.substring(0, pos);
        const caseName = fqnColonCase.substring(pos + 2);
        const className = fqn.slice(fqn.lastIndexOf('\\') + 1);

        return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(className), caseName);
    }

    /**
     * Build the `import { X } from '...';` block for the provider/handler classes
     * a generated data cache references, followed by a trailing newline (or an
     * empty string when there are no such imports).
     *
     * Names the generated file's fixed framework header already binds are
     * dropped: those are the same framework classes under the same names, and
     * emitting them twice is a duplicate-identifier error.
     */
    protected buildUserImportsBlock(classImportMap: Record<string, string>, reservedNames: readonly string[]): string {
        const userImports = Object.entries(classImportMap)
            .filter(([name]) => !reservedNames.includes(name))
            .map(([name, specifier]) => `import { ${name} } from '${specifier}';`)
            .join('\n');

        return userImports ? `${userImports}\n` : '';
    }

    /**
     * Render the fixed framework imports a generated data file always carries.
     */
    protected buildFrameworkImportLines(imports: Readonly<Record<string, string>>, isType: boolean = false): string[] {
        const keyword = isType ? 'import type' : 'import';

        return Object.entries(imports).map(([name, specifier]) => `${keyword} { ${name} } from '${specifier}';`);
    }

    /**
     * Print an expression to source.
     *
     * A parsed node, which a `getRoutes()` body gives, is emitted through its own source text. A
     * synthesized node carries no source position, so it goes through the printer.
     */
    protected printExpr(expr: ts.Expression): string {
        return expr.pos >= 0
            ? expr.getText()
            : this.printer.printNode(ts.EmitHint.Unspecified, expr, this.dummySourceFile);
    }

    /**
     * Read the map key an expression names.
     *
     * A literal keys the map by its own text. A constant reference keeps the `Class::CASE` marker,
     * so the generated file emits the reference rather than the value the constant holds today.
     */
    protected dataKeyOf(expression: ts.Expression | undefined): string | undefined {
        if (expression === undefined) {
            return undefined;
        }

        if (ts.isStringLiteral(expression)) {
            return expression.text;
        }

        if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
            return `${expression.expression.text}::${expression.name.text}`;
        }

        return undefined;
    }

    /**
     * Format one key of a generated data map.
     *
     * A key that names an enum case keeps the reference, so the generated file reads the value the
     * enum holds when the application runs rather than the value it held at generation.
     */
    protected formatDataKey(key: string): string {
        if (!key.includes('::')) {
            return `['${key}']`;
        }

        const reference = this.printer.printNode(
            ts.EmitHint.Unspecified,
            this.buildEnumCaseExpr(key),
            this.dummySourceFile,
        );

        return `[${reference}]`;
    }

    /**
     * Build the `super({ ... })` call a generated data class constructor holds.
     *
     * Each value is a thunk of the contract the caller names, so the data class builds only the
     * entries a request reaches.
     */
    protected buildSuperCall(entries: Record<string, ts.Expression>, valueType: string): string {
        const pairs = Object.entries(entries);

        if (pairs.length === 0) {
            return 'super({});';
        }

        const lines = pairs.map(
            ([key, value]) => `            ${this.formatDataKey(key)}: (): ${valueType} => ${this.printExpr(value)},`,
        );

        return ['super({', ...lines, '        });'].join('\n        ');
    }

    /**
     * Build the whole text of a generated data file.
     */
    protected buildDataFile(
        className: string,
        baseClassName: string,
        contents: string,
        frameworkImports: Readonly<Record<string, string>>,
        frameworkTypeImports: Readonly<Record<string, string>>,
    ): string {
        const userImportsBlock = this.buildUserImportsBlock(this.classImportMap, [
            ...Object.keys(frameworkImports),
            ...Object.keys(frameworkTypeImports),
        ]);

        return [
            '// This file was automatically generated by Sindri.',
            '',
            ...this.buildFrameworkImportLines(frameworkImports),
            ...this.buildFrameworkImportLines(frameworkTypeImports, true),
            userImportsBlock,
            `export class ${className} extends ${baseClassName} {`,
            `    constructor() {`,
            `        ${contents}`,
            `    }`,
            `}`,
            '',
        ].join('\n');
    }

    protected writeFile(directory: string, className: string, data: string): GenerateStatus {
        const filePath = directory.replace(/\/$/, '') + `/${className}.ts`;

        try {
            const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : false;

            if (existing === data) {
                return GenerateStatus.SKIPPED;
            }

            fs.mkdirSync(directory, { recursive: true });
            fs.writeFileSync(filePath, data, 'utf-8');

            return GenerateStatus.SUCCESS;
        } catch {
            // Fallthrough
        }

        return GenerateStatus.FAILURE;
    }
}
