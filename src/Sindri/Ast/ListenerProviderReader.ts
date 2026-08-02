/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

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

        return new ListenerProviderResult(
            this.extractClassListFromValues(methods[ListenerProviderReader.METHOD_LISTENER_CLASSES], useMap, filePath),
            this.extractListeners(methods[ListenerProviderReader.METHOD_LISTENERS], useMap, filePath),
        );
    }

    protected extractListeners(
        _method: ReturnType<typeof this.indexMethods>[string] | undefined,
        _useMap: Record<string, string>,
        _filePath: string,
    ): ts.Expression[] {
        return [];
    }
}
