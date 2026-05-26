/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type ts from 'typescript';

import { AstReader } from './Abstract/AstReader.js';
import { ListenerProviderResult } from './Data/Result/ListenerProviderResult.js';

import type { ListenerProviderReaderContract } from './Contract/ListenerProviderReaderContract.js';

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
            this.extractClassListFromValues(
                methods[ListenerProviderReader.METHOD_LISTENER_CLASSES],
                useMap,
                filePath,
            ),
            this.extractListeners(methods[ListenerProviderReader.METHOD_LISTENERS], useMap, filePath),
        );
    }

    protected extractListeners(
        _method: ReturnType<typeof this.indexMethods>[string],
        _useMap: Record<string, string>,
        _filePath: string,
    ): ts.Expression[] {
        return [];
    }
}