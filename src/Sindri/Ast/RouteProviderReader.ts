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
import { RouteProviderResult } from './Data/Result/RouteProviderResult.js';

import type { RouteProviderReaderContract } from './Contract/RouteProviderReaderContract.js';

export class RouteProviderReader extends AstReader implements RouteProviderReaderContract {
    protected static readonly METHOD_CONTROLLER_CLASSES = 'getControllerClasses';
    protected static readonly METHOD_ROUTES = 'getRoutes';

    readFile(filePath: string): RouteProviderResult {
        const sourceFile = this.parseFileToSourceFile(filePath);
        const classDecl = this.findClass(sourceFile);

        if (classDecl === undefined) {
            return new RouteProviderResult();
        }

        const useMap = this.buildUseMap(sourceFile);
        const methods = this.indexMethods(classDecl);

        return new RouteProviderResult(
            this.extractClassListFromValues(
                methods[RouteProviderReader.METHOD_CONTROLLER_CLASSES],
                useMap,
                filePath,
            ),
            this.extractRoutes(methods[RouteProviderReader.METHOD_ROUTES], useMap, filePath),
        );
    }

    protected extractRoutes(
        method: ReturnType<typeof this.indexMethods>[string],
        _useMap: Record<string, string>,
        _filePath: string,
    ): ts.Expression[] {
        return [];
    }
}
