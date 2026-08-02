/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { Node } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { ConfigImport } from './Data/ConfigImport.ts';
import { ConfigSourceResult } from './Data/Result/ConfigSourceResult.ts';

import type { ClassDeclaration, SourceFile } from 'ts-morph';

import type { ConfigSourceReaderContract } from './Contract/ConfigSourceReaderContract.ts';

/**
 * Reads an application config class and returns every field as source text.
 *
 * Two shapes are supported, because an application config may either extend a
 * framework config and pass positional `super()` arguments, or implement the
 * contract directly and declare its own properties:
 *
 * ```ts
 * class Config extends HttpConfig { constructor() { super('App', process.cwd(), ...); } }
 * class Config implements HttpConfigContract { readonly namespace = 'App'; }
 * ```
 *
 * Values are never evaluated. `process.env['APP_KEY']` is carried through as the
 * text `process.env['APP_KEY']`, so a generated config keeps whatever the author
 * wrote — including expressions no static reader could resolve.
 */
export class ConfigSourceReader extends AstReader implements ConfigSourceReaderContract {
    /**
     * The constructor parameter order of each framework config base.
     *
     * Positional `super()` arguments carry no names, so the base class a config
     * extends is what gives each argument its meaning. `CliConfig` inserts two
     * fields ahead of `providers`, so the orders are not interchangeable.
     */
    protected static readonly BASE_FIELDS: Readonly<Record<string, readonly string[]>> = {
        Config: [
            'namespace',
            'dir',
            'version',
            'environment',
            'debugMode',
            'timezone',
            'key',
            'dataPath',
            'dataNamespace',
            'providers',
            'callbacks',
        ],
        HttpConfig: [
            'namespace',
            'dir',
            'version',
            'environment',
            'debugMode',
            'timezone',
            'key',
            'dataPath',
            'dataNamespace',
            'providers',
            'callbacks',
            'requestReceivedMiddleware',
            'routeMatchedMiddleware',
            'routeNotMatchedMiddleware',
            'routeDispatchedMiddleware',
            'throwableCaughtMiddleware',
            'sendingResponseMiddleware',
            'responseSentMiddleware',
        ],
        CliConfig: [
            'namespace',
            'dir',
            'version',
            'environment',
            'debugMode',
            'timezone',
            'key',
            'dataPath',
            'dataNamespace',
            'applicationName',
            'defaultCommandName',
            'providers',
            'callbacks',
            'inputReceivedMiddleware',
            'routeMatchedMiddleware',
            'routeNotMatchedMiddleware',
            'routeDispatchedMiddleware',
            'throwableCaughtMiddleware',
            'processExitingMiddleware',
        ],
    };

    /** The contract each framework config base satisfies. */
    protected static readonly BASE_CONTRACTS: Readonly<Record<string, string>> = {
        Config: 'ConfigContract',
        HttpConfig: 'HttpConfigContract',
        CliConfig: 'CliConfigContract',
    };

    /** Where each contract is imported from. */
    protected static readonly CONTRACT_SPECIFIERS: Readonly<Record<string, string>> = {
        ConfigContract: '@valkyrjaio/valkyrja/Application/Data/Contract/ConfigContract.ts',
        HttpConfigContract: '@valkyrjaio/valkyrja/Application/Data/Contract/HttpConfigContract.ts',
        CliConfigContract: '@valkyrjaio/valkyrja/Application/Data/Contract/CliConfigContract.ts',
    };

    readFile(filePath: string): ConfigSourceResult {
        const context = this.parseClassFile(filePath);

        if (context === undefined) {
            return new ConfigSourceResult();
        }

        const { sourceFile, classDecl } = context;
        const className = classDecl.getName() ?? '';

        if (className === '') {
            return new ConfigSourceResult();
        }

        const contract = this.resolveContract(classDecl);

        if (contract === undefined) {
            return new ConfigSourceResult();
        }

        const base = this.readBase(classDecl, context.useMap, filePath);
        const fields = { ...base.fields, ...this.readFields(classDecl) };
        const types = { ...base.types, ...this.readPropertyTypes(classDecl) };

        if (Object.keys(fields).length === 0) {
            return new ConfigSourceResult();
        }

        return new ConfigSourceResult(className, contract.name, contract.specifier, fields, types, [
            ...this.readImports(sourceFile),
            ...base.imports,
        ]);
    }

    /**
     * Read the defaults of the framework config a class extends.
     *
     * A config passes only the arguments it wants to change, so the rest come
     * from the base's constructor parameter defaults. A generated config
     * implements the contract directly and inherits nothing, so those defaults
     * must be copied in or they are silently lost — `CliConfig`, for one,
     * defaults several middleware lists to non-empty values.
     */
    protected readBase(
        classDecl: ClassDeclaration,
        useMap: Record<string, string>,
        filePath: string,
    ): { fields: Record<string, string>; types: Record<string, string>; imports: ConfigImport[] } {
        const baseName = classDecl.getExtends()?.getExpression().getText() ?? '';

        if (ConfigSourceReader.BASE_FIELDS[baseName] === undefined) {
            return { fields: {}, types: {}, imports: [] };
        }

        const baseFile = this.parseDeclaringSourceFile(baseName, useMap, filePath);
        const baseClass = baseFile?.getClass(baseName);

        if (baseFile === undefined || baseClass === undefined) {
            return { fields: {}, types: {}, imports: [] };
        }

        const fields: Record<string, string> = {};
        const types: Record<string, string> = {};

        for (const parameter of baseClass.getConstructors()[0]?.getParameters() ?? []) {
            const initializer = parameter.getInitializer();

            if (initializer === undefined) {
                continue;
            }

            fields[parameter.getName()] = initializer.getText();

            const typeNode = parameter.getTypeNode();

            if (typeNode !== undefined) {
                types[parameter.getName()] = typeNode.getText();
            }
        }

        return { fields, types, imports: this.readImports(baseFile) };
    }

    /**
     * Determine which config contract the class satisfies, and where that
     * contract is imported from.
     *
     * A class that extends a framework config takes that base's contract; a
     * standalone class names its contract in the `implements` clause. Returns
     * undefined when neither names a contract this reader knows.
     */
    protected resolveContract(classDecl: ClassDeclaration): { name: string; specifier: string } | undefined {
        const baseName = classDecl.getExtends()?.getExpression().getText() ?? '';
        const names = [ConfigSourceReader.BASE_CONTRACTS[baseName]];

        for (const implemented of classDecl.getImplements()) {
            names.push(implemented.getExpression().getText());
        }

        for (const name of names) {
            const specifier = name === undefined ? undefined : ConfigSourceReader.CONTRACT_SPECIFIERS[name];

            if (name !== undefined && specifier !== undefined) {
                return { name, specifier };
            }
        }

        return undefined;
    }

    /**
     * Read every field initializer as source text, from whichever shape the
     * class uses.
     */
    protected readFields(classDecl: ClassDeclaration): Record<string, string> {
        const baseName = classDecl.getExtends()?.getExpression().getText() ?? '';
        const order = ConfigSourceReader.BASE_FIELDS[baseName];

        if (order !== undefined) {
            return this.readFieldsFromSuperCall(classDecl, order);
        }

        return this.readFieldsFromProperties(classDecl);
    }

    /**
     * Map positional `super()` arguments onto the base's field order.
     *
     * Arguments the author omitted keep the base class default, so they are left
     * out of the result rather than recorded as empty.
     */
    protected readFieldsFromSuperCall(classDecl: ClassDeclaration, order: readonly string[]): Record<string, string> {
        const fields: Record<string, string> = {};
        const args = this.findSuperCallArguments(classDecl);

        for (const [index, arg] of args.entries()) {
            const name = order[index];

            if (name === undefined) {
                continue;
            }

            fields[name] = arg;
        }

        return fields;
    }

    /**
     * Collect the argument source texts of the constructor's `super()` call.
     */
    protected findSuperCallArguments(classDecl: ClassDeclaration): string[] {
        const constructor = classDecl.getConstructors()[0];

        if (constructor === undefined) {
            return [];
        }

        for (const statement of constructor.getStatements()) {
            if (!Node.isExpressionStatement(statement)) {
                continue;
            }

            const expression = statement.getExpression();

            if (!Node.isCallExpression(expression) || expression.getExpression().getKindName() !== 'SuperKeyword') {
                continue;
            }

            return expression.getArguments().map((arg) => arg.getText());
        }

        return [];
    }

    /**
     * Read initializers from a standalone class's property declarations.
     */
    protected readFieldsFromProperties(classDecl: ClassDeclaration): Record<string, string> {
        const fields: Record<string, string> = {};

        for (const property of classDecl.getProperties()) {
            if (property.isStatic()) {
                continue;
            }

            const initializer = property.getInitializer();

            if (initializer === undefined) {
                continue;
            }

            fields[property.getName()] = initializer.getText();
        }

        return fields;
    }

    /**
     * Read the declared types of a standalone class's own properties.
     */
    protected readPropertyTypes(classDecl: ClassDeclaration): Record<string, string> {
        const types: Record<string, string> = {};

        for (const property of classDecl.getProperties()) {
            const typeNode = property.getTypeNode();

            if (!property.isStatic() && typeNode !== undefined) {
                types[property.getName()] = typeNode.getText();
            }
        }

        return types;
    }

    /**
     * Collect every named import in the config source file.
     *
     * Default and namespace imports are skipped: a config field can only
     * reference a named binding, so nothing else can appear in the copied text.
     */
    protected readImports(sourceFile: SourceFile): ConfigImport[] {
        const imports: ConfigImport[] = [];
        const ownerPath = sourceFile.getFilePath();

        for (const declaration of sourceFile.getImportDeclarations()) {
            const specifier = declaration.getModuleSpecifierValue();
            const isTypeOnly = declaration.isTypeOnly();
            const resolvedPath = specifier.startsWith('.')
                ? this.resolveModuleSpecifierToFilePath(specifier, ownerPath)
                : '';

            for (const named of declaration.getNamedImports()) {
                imports.push(
                    new ConfigImport(named.getName(), specifier, isTypeOnly || named.isTypeOnly(), resolvedPath),
                );
            }
        }

        return imports;
    }
}
