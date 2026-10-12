/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import * as path from 'path';

import { ts } from 'ts-morph';

import type { SourceFile } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { ListenerProviderResult } from './Data/Result/ListenerProviderResult.ts';
import { AstUnreadableListenerException } from './Throwable/Exception/AstUnreadableListenerException.ts';

import type { ListenerProviderReaderContract } from './Contract/ListenerProviderReaderContract.ts';

export class ListenerProviderReader extends AstReader implements ListenerProviderReaderContract {
    protected static readonly METHOD_LISTENER_CLASSES = 'getListenerClasses';
    protected static readonly METHOD_LISTENERS = 'getListeners';

    readFile(filePath: string): ListenerProviderResult {
        const sourceFile = this.parseFileToSourceFile(filePath);
        const classDecl = this.findClass(sourceFile);

        if (classDecl === undefined) {
            return new ListenerProviderResult();
        }

        const useMap = this.buildUseMap(sourceFile);
        const methods = this.indexMethods(classDecl);
        const listeners = this.extractListeners(methods[ListenerProviderReader.METHOD_LISTENERS]);

        return new ListenerProviderResult(
            this.extractClassListFromValues(methods[ListenerProviderReader.METHOD_LISTENER_CLASSES], useMap, filePath),
            listeners,
            this.extractListenerImports(listeners, useMap, filePath, this.collectFileNames(sourceFile, filePath)),
        );
    }

    /**
     * Extract the listeners a provider's `getListeners()` method returns, which the generator
     * emits verbatim.
     */
    protected extractListeners(
        method: ReturnType<typeof this.indexMethods>[string] | undefined,
    ): readonly ts.Expression[] {
        if (method === undefined) {
            return [];
        }

        const array = this.findReturnedArray(method);

        if (array === undefined) {
            return [];
        }

        return array.elements.filter((element) => this.isConstructedListener(element));
    }

    /** Whether an expression declares a listener through a construction, with or without a chain. */
    protected isConstructedListener(expression: ts.Expression): boolean {
        let current = this.unwrapTypeAssertions(expression);

        while (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)) {
            current = this.unwrapTypeAssertions(current.expression.expression);
        }

        return ts.isNewExpression(current);
    }

    /**
     * Resolve every class the listener expressions reference to its absolute file path, so the
     * generated data cache can import them.
     */
    protected extractListenerImports(
        listeners: readonly ts.Expression[],
        useMap: Record<string, string>,
        filePath: string,
        fileNames: ReadonlySet<string>,
    ): Record<string, string> {
        const imports: Record<string, string> = {};

        for (const listener of listeners) {
            const declaredNames = this.collectDeclaredNames(listener);

            for (const name of this.collectReferencedIdentifiers(listener)) {
                const resolved = this.resolveImportToFilePath(name, useMap, filePath);

                if (resolved !== '') {
                    imports[name] = resolved;

                    continue;
                }

                // A name the provider file declares for itself is one the generated data file, in
                // another module, cannot reach. Every other unresolved name is a global.
                if (fileNames.has(name) && !declaredNames.has(name)) {
                    throw new AstUnreadableListenerException(
                        `Cannot read the listener '${listener.getText()}': the generated data cannot import '${name}', which the provider declares for itself.`,
                    );
                }
            }
        }

        return imports;
    }

    /**
     * The names the provider file declares anywhere in itself, less the file's own base name, which
     * is the name the generated data file imports the provider by.
     */
    protected collectFileNames(sourceFile: SourceFile, filePath: string): Set<string> {
        const names = this.collectDeclaredNames(sourceFile.compilerNode);

        names.delete(path.basename(filePath, '.ts'));

        return names;
    }

    /**
     * The names a node declares, such as the parameters of an inline handler.
     *
     * A name any part of an expression declares counts as declared throughout it, which reads a
     * shadowed name as declared rather than stopping on it.
     */
    protected collectDeclaredNames(node: ts.Node, names: Set<string> = new Set<string>()): Set<string> {
        if (ListenerProviderReader.declaresName(node) && node.name !== undefined && ts.isIdentifier(node.name)) {
            names.add(node.name.text);
        }

        ts.forEachChild(node, (child: ts.Node): void => {
            this.collectDeclaredNames(child, names);
        });

        return names;
    }

    /**
     * Whether a node's `name` declares a binding rather than naming one.
     *
     * A property access, a shorthand property and an object-literal key all carry a `name` that
     * references or keys instead of declaring, so the kind decides rather than the slot.
     */
    protected static declaresName(node: ts.Node): node is ts.NamedDeclaration {
        return (
            ts.isParameter(node) ||
            ts.isVariableDeclaration(node) ||
            ts.isBindingElement(node) ||
            ts.isFunctionDeclaration(node) ||
            ts.isClassDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isModuleDeclaration(node)
        );
    }
}
