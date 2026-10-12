/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { ts } from 'ts-morph';

import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export interface EventDataFileGeneratorContract {
    /** Map of class name → module specifier for the imports the data cache references. */
    classImportMap: Record<string, string>;

    generateFile(
        directory: string,
        className: string,
        namespace: string,
        listeners: ReadonlyMap<string, ts.Expression>,
    ): GenerateStatus;

    generateMergedFile(
        directory: string,
        className: string,
        namespace: string,
        listeners: ReadonlyMap<string, ts.Expression>,
        listenerExprs: readonly ts.Expression[],
    ): GenerateStatus;

    generateClassContents(
        factories: ReadonlyMap<string, ts.Expression>,
        events: ReadonlyMap<string, readonly string[]>,
    ): string;
}
