/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as path from 'path';

import ts from 'typescript';

import { AstReader } from './Abstract/AstReader.js';
import { ConfigResult } from './Data/Result/ConfigResult.js';

import type { ClassDeclaration } from 'ts-morph';

import type { ConfigReaderContract } from './Contract/ConfigReaderContract.js';

/**
 * Reads an application config class file via AST and extracts the values
 * needed by GenerateDataFromAst without executing the TypeScript file.
 *
 * Expects a class with a constructor that calls super() with positional or
 * named arguments: (namespace, dir, ..., dataPath, dataNamespace, providers).
 * __dirname / import.meta.dirname in the dir argument is resolved relative to
 * the config file path.
 */
export class ConfigReader extends AstReader implements ConfigReaderContract {
    readFile(filePath: string): ConfigResult {
        const context = this.parseClassFile(filePath);

        if (context === undefined) {
            return new ConfigResult();
        }

        const { classDecl, useMap } = context;
        const args = this.findSuperConstructorArgs(classDecl);

        if (args === undefined) {
            return new ConfigResult();
        }

        return this.buildConfigResult(args, filePath, useMap);
    }

    /**
     * Locate the constructor and extract its super() call arguments.
     */
    protected findSuperConstructorArgs(
        classDecl: ClassDeclaration,
    ): ts.NodeArray<ts.Expression> | undefined {
        const constructor = classDecl.getConstructors()[0];

        if (constructor === undefined) {
            return undefined;
        }

        const body = constructor.compilerNode.body;

        if (body === undefined) {
            return undefined;
        }

        for (const stmt of body.statements) {
            if (ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression)) {
                const call = stmt.expression;

                if (ts.isIdentifier(call.expression) && call.expression.text === 'super') {
                    return call.arguments;
                }
            }
        }

        return undefined;
    }

    /**
     * Build a ConfigResult from the extracted super() argument list.
     *
     * The TS Config base class constructor signature (CliConfig):
     *   (namespace, dir, version, env, debug, timezone, secret, dataPath, dataNamespace, ...)
     *
     * Positional args:
     *   0: namespace (string)
     *   1: dir (string — may use process.cwd() or __dirname)
     *   2: version (string)
     *   3: env (string)
     *   4: debug (bool)
     *   5: timezone (string)
     *   6: secret (string)
     *   7: dataPath (string — relative path)
     *   8: dataNamespace (string)
     *   9+: other args, then providers array
     */
    protected buildConfigResult(
        args: ts.NodeArray<ts.Expression>,
        filePath: string,
        useMap: Record<string, string>,
    ): ConfigResult {
        const fileDir = path.dirname(filePath);

        const namespace = this.extractStringFromArg(args[0]);
        const dir = this.resolvePathFromArg(args[1], fileDir);
        const dataPath = this.resolveDataPathFromArgs(args, fileDir);
        const dataNamespace = this.extractStringFromArg(args[8]);
        const providers = this.extractProvidersFromArgs(args, useMap, filePath);

        if (namespace === '' || dir === '' || dataPath === '' || dataNamespace === '') {
            return new ConfigResult();
        }

        return new ConfigResult(namespace, dir, dataPath, dataNamespace, providers);
    }

    protected extractStringFromArg(arg: ts.Expression | undefined): string {
        if (arg === undefined) {
            return '';
        }

        if (ts.isStringLiteral(arg)) {
            return arg.text;
        }

        return '';
    }

    protected resolvePathFromArg(arg: ts.Expression | undefined, fileDir: string): string {
        if (arg === undefined) {
            return '';
        }

        if (ts.isStringLiteral(arg)) {
            return arg.text;
        }

        // process.cwd() → use the file directory as a proxy
        if (ts.isCallExpression(arg) && ts.isPropertyAccessExpression(arg.expression)) {
            const obj = arg.expression.expression;
            const prop = arg.expression.name;

            if (
                ts.isIdentifier(obj) &&
                obj.text === 'process' &&
                ts.isIdentifier(prop) &&
                prop.text === 'cwd'
            ) {
                return fileDir;
            }
        }

        // __dirname or import.meta.dirname
        if (ts.isIdentifier(arg) && arg.text === '__dirname') {
            return fileDir;
        }

        if (
            ts.isPropertyAccessExpression(arg) &&
            ts.isPropertyAccessExpression(arg.expression) &&
            ts.isMetaProperty(arg.expression.expression) &&
            arg.expression.expression.name.text === 'meta'
        ) {
            return fileDir;
        }

        return '';
    }

    /**
     * Resolve the data path from args, prepending the app root when relative.
     * Args[7] is dataPath in CliConfig.
     */
    protected resolveDataPathFromArgs(args: ts.NodeArray<ts.Expression>, fileDir: string): string {
        const dataPathArg = args[7];

        if (dataPathArg === undefined) {
            return '';
        }

        const dataPath = this.extractStringFromArg(dataPathArg);

        if (dataPath === '') {
            return '';
        }

        if (!dataPath.startsWith('/')) {
            const dirArg = args[1];
            const appRoot = this.resolvePathFromArg(dirArg, fileDir);

            if (appRoot !== '') {
                return appRoot.replace(/\/$/, '') + '/' + dataPath;
            }
        }

        return dataPath;
    }

    /**
     * Extract provider class names from the providers argument.
     * In CliConfig, providers is typically the 12th positional arg (index 11).
     */
    protected extractProvidersFromArgs(
        args: ts.NodeArray<ts.Expression>,
        useMap: Record<string, string>,
        filePath: string,
    ): string[] {
        // Try to find the providers array in the argument list
        // It's typically at index 11 in CliConfig
        for (let i = 10; i < args.length; i++) {
            const arg = args[i];

            if (ts.isArrayLiteralExpression(arg)) {
                return this.extractClassListFromArrayExpr(arg, useMap, filePath);
            }
        }

        return [];
    }
}