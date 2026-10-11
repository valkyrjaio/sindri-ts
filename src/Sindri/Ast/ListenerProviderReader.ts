/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { ts } from 'ts-morph';

import { AstReader } from './Abstract/AstReader.ts';
import { ListenerProviderResult } from './Data/Result/ListenerProviderResult.ts';

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
            this.extractListenerImports(listeners, useMap, filePath),
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
    ): Record<string, string> {
        const imports: Record<string, string> = {};

        for (const listener of listeners) {
            for (const name of this.collectReferencedIdentifiers(listener)) {
                const resolved = this.resolveImportToFilePath(name, useMap, filePath);

                if (resolved !== '') {
                    imports[name] = resolved;
                }
            }
        }

        return imports;
    }
}
