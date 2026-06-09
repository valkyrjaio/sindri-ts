/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AstReader } from './Abstract/AstReader.js';
import { ComponentProviderResult } from './Data/Result/ComponentProviderResult.js';

import type { ComponentProviderReaderContract } from './Contract/ComponentProviderReaderContract.js';

export class ComponentProviderReader extends AstReader implements ComponentProviderReaderContract {
    protected static readonly METHOD_COMPONENT = 'getComponentProviders';
    protected static readonly METHOD_CONTAINER = 'getContainerProviders';
    protected static readonly METHOD_EVENT = 'getEventProviders';
    protected static readonly METHOD_CLI = 'getCliProviders';
    protected static readonly METHOD_HTTP = 'getHttpProviders';

    readFile(filePath: string): ComponentProviderResult {
        const sourceFile = this.parseFileToSourceFile(filePath);
        const classDecl = this.findClass(sourceFile);

        if (classDecl === undefined) {
            return new ComponentProviderResult();
        }

        const useMap = this.buildUseMap(sourceFile);
        const methods = this.indexMethods(classDecl);

        return new ComponentProviderResult(
            this.extractClassListFromValues(methods[ComponentProviderReader.METHOD_COMPONENT], useMap, filePath),
            this.extractClassListFromValues(methods[ComponentProviderReader.METHOD_CONTAINER], useMap, filePath),
            this.extractClassListFromValues(methods[ComponentProviderReader.METHOD_EVENT], useMap, filePath),
            this.extractClassListFromValues(methods[ComponentProviderReader.METHOD_CLI], useMap, filePath),
            this.extractClassListFromValues(methods[ComponentProviderReader.METHOD_HTTP], useMap, filePath),
        );
    }
}
