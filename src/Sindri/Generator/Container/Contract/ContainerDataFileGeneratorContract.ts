/*
 * This file is part of the Sindri package.
 *
 * Copyright (c) 2016-present Melech Mizrachi
 *
 * Released under the MIT License. See LICENSE.md for details.
 */

import type { GenerateStatus } from '../../Enum/GenerateStatus.ts';

export interface ContainerDataFileGeneratorContract {
    /** Map of class name → module specifier for the provider imports the data cache references. */
    classImportMap: Record<string, string>;

    generateFile(
        directory: string,
        className: string,
        namespace: string,
        publishers: Readonly<Record<string, readonly [string, string]>>,
    ): GenerateStatus;

    generateClassContents(publishers: Readonly<Record<string, readonly [string, string]>>): string;
}
