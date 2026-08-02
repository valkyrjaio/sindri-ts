/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import { AstReader } from './Abstract/AstReader.ts';
import { ComponentProviderResult } from './Data/Result/ComponentProviderResult.ts';

import type { ComponentProviderReaderContract } from './Contract/ComponentProviderReaderContract.ts';

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

        // Provider references are resolved through the file's import map to
        // absolute paths (not bare names) so the walk locates each provider
        // unambiguously — the same short name (e.g. `ComponentProvider`,
        // `DataServiceProvider`) exists in both the Http and Cli trees.
        return new ComponentProviderResult(
            this.extractClassPathListFromValues(methods[ComponentProviderReader.METHOD_COMPONENT], useMap, filePath),
            this.extractClassPathListFromValues(methods[ComponentProviderReader.METHOD_CONTAINER], useMap, filePath),
            this.extractClassPathListFromValues(methods[ComponentProviderReader.METHOD_EVENT], useMap, filePath),
            this.extractClassPathListFromValues(methods[ComponentProviderReader.METHOD_CLI], useMap, filePath),
            this.extractClassPathListFromValues(methods[ComponentProviderReader.METHOD_HTTP], useMap, filePath),
        );
    }
}
